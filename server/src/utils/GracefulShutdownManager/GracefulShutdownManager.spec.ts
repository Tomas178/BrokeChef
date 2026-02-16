import { createServer, type Server } from 'node:http';
import { GracefulShutdownPriority } from '@server/enums/GracefulShutdownPriority';
import { GracefulShutdownManager, type CleanupHandlerFunction } from '.';

vi.mock('@server/logger', () => ({
  default: {
    shutdown: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

let manager: GracefulShutdownManager;
let server: Server;
let exitMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  exitMock = vi.fn();
  manager = new GracefulShutdownManager(5000, 1000, exitMock);

  server = createServer((_, res) => {
    res.writeHead(200);
    res.end('ok');
  });
});

afterEach(async () => {
  vi.restoreAllMocks();
  await new Promise<void>(resolve => {
    server.close(() => resolve());
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }).catch(() => {});
});

describe('GracefulShutdownManager', () => {
  describe('registerCleanup', () => {
    it('Should register a cleanup handler', () => {
      const handler = vi.fn();
      manager.registerCleanup('test', handler, GracefulShutdownPriority.WORKER);

      expect(manager['cleanupHandlers']).toHaveLength(1);
      expect(manager['cleanupHandlers'][0]).toEqual({
        name: 'test',
        handler,
        priority: GracefulShutdownPriority.WORKER,
      });
    });
  });

  describe('attachServer', () => {
    it('Should attach a server', () => {
      manager.attachServer(server);
      expect(manager['server']).toBe(server);
    });
  });

  describe('isTerminating', () => {
    it('Should return false initially', () => {
      expect(manager.isTerminating()).toBe(false);
    });
  });

  describe('shutdown', () => {
    it('Should set isTerminating to true', async () => {
      await manager.shutdown('SIGTERM');
      expect(manager.isTerminating()).toBe(true);
    });

    it('Should only run once when called multiple times', async () => {
      const handler = vi.fn();
      manager.registerCleanup('test', handler, GracefulShutdownPriority.WORKER);

      await manager.shutdown('SIGTERM');
      await manager.shutdown('SIGTERM');

      expect(handler).toHaveBeenCalledOnce();
    });

    it('Should close the attached server', async () => {
      await new Promise<void>(resolve => {
        server.listen(0, () => resolve());
      });

      manager.attachServer(server);
      await manager.shutdown('SIGTERM');

      expect(server.listening).toBe(false);
    });

    it('Should run cleanup handlers in priority order', async () => {
      const callOrder: string[] = [];

      manager.registerCleanup(
        'database',
        () => {
          callOrder.push('database');
        },
        GracefulShutdownPriority.DATABASE
      );
      manager.registerCleanup(
        'worker',
        () => {
          callOrder.push('worker');
        },
        GracefulShutdownPriority.WORKER
      );
      manager.registerCleanup(
        'queue',
        () => {
          callOrder.push('queue');
        },
        GracefulShutdownPriority.QUEUE
      );

      await manager.shutdown('SIGTERM');

      expect(callOrder).toEqual(['worker', 'queue', 'database']);
    });

    it('Should handle async cleanup handlers', async () => {
      const handler = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      manager.registerCleanup(
        'async',
        handler,
        GracefulShutdownPriority.WORKER
      );
      await manager.shutdown('SIGTERM');

      expect(handler).toHaveBeenCalledOnce();
    });

    it('Should continue cleanup if a handler throws', async () => {
      const failingHandler = vi.fn(() => {
        throw new Error('cleanup failed');
      });
      const successHandler = vi.fn();

      manager.registerCleanup(
        'failing',
        failingHandler,
        GracefulShutdownPriority.WORKER
      );
      manager.registerCleanup(
        'success',
        successHandler,
        GracefulShutdownPriority.QUEUE
      );

      await manager.shutdown('SIGTERM');

      expect(failingHandler).toHaveBeenCalledOnce();
      expect(successHandler).toHaveBeenCalledOnce();
    });

    it('Should timeout a slow handler and continue', async () => {
      const slowHandler = vi.fn(
        () => new Promise(resolve => setTimeout(resolve, 10_000))
      ) as CleanupHandlerFunction;
      const fastHandler = vi.fn();

      manager.registerCleanup(
        'slow',
        slowHandler,
        GracefulShutdownPriority.WORKER
      );
      manager.registerCleanup(
        'fast',
        fastHandler,
        GracefulShutdownPriority.QUEUE
      );

      await manager.shutdown('SIGTERM');

      expect(slowHandler).toHaveBeenCalledOnce();
      expect(fastHandler).toHaveBeenCalledOnce();
    });

    it('Should work without an attached server', async () => {
      const handler = vi.fn();
      manager.registerCleanup('test', handler, GracefulShutdownPriority.WORKER);

      await manager.shutdown('SIGTERM');

      expect(handler).toHaveBeenCalledOnce();
    });

    it('Should call exit with 0 on successful shutdown', async () => {
      await manager.shutdown('SIGTERM');

      await vi.waitFor(() => {
        expect(exitMock).toHaveBeenCalledWith(0);
      });
    });
  });
});
