import type { Server } from 'node:http';
import logger from '@server/logger';
import { type GracefulShutdownPriorityValues } from '@server/enums/GracefulShutdownPriority';

export type CleanupHandlerFunction = () => Promise<void> | void;
export type ExitFunction = (code: number) => void;

export interface CleanupHandler {
  name: string;
  handler: CleanupHandlerFunction;
  priority: GracefulShutdownPriorityValues;
}

export class GracefulShutdownManager {
  private isShuttingDown = false;
  private cleanupHandlers: CleanupHandler[] = [];
  private server: Server | undefined = undefined;
  private shutdownTimeout: number;
  private handlerTimeout: number;
  private exit: ExitFunction;

  constructor(
    shutdownTimeout = 30_000,
    handlerTimeout = 5000,
    exit: ExitFunction = code => process.exit(code)
  ) {
    this.shutdownTimeout = shutdownTimeout;
    this.handlerTimeout = handlerTimeout;
    this.exit = exit;
  }

  registerCleanup(
    name: string,
    handler: CleanupHandlerFunction,
    priority: GracefulShutdownPriorityValues
  ) {
    this.cleanupHandlers.push({ name, handler, priority });
  }

  attachServer(server: Server) {
    this.server = server;
  }

  async shutdown(signal: string) {
    if (this.isShuttingDown) {
      logger.shutdown('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    logger.shutdown(`${signal} received. Starting graceful shutdown...`);
    const startTime = Date.now();

    const forceShutdownTimer = setTimeout(() => {
      console.error('Timeout exceeded, forcing exit');
      setTimeout(() => this.exit(1), 100);
    }, this.shutdownTimeout).unref();

    try {
      logger.shutdown('Stopping HTTP server...');
      await this.closeServer();
      logger.shutdown('HTTP server stopped');

      const sortedHandlers = [...this.cleanupHandlers].sort(
        (a, b) => a.priority - b.priority
      );
      for (const { name, handler } of sortedHandlers) {
        try {
          await Promise.race([
            handler(),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error(`${name} cleanup timed out`)),
                this.handlerTimeout
              )
            ),
          ]);
          logger.shutdown(`${name} closed`);
        } catch (error) {
          logger.error(`Error cleaning up ${name}: ${error}`);
        }
      }

      const duration = Date.now() - startTime;
      logger.shutdown(`Completed in ${duration}ms`);

      clearTimeout(forceShutdownTimer);
      setTimeout(() => this.exit(0), 100);
    } catch (error) {
      logger.error(`Error during shutdown: ${error}`);
      clearTimeout(forceShutdownTimer);
      setTimeout(() => this.exit(1), 100);
    }
  }

  private async closeServer() {
    return new Promise<void>((resolve, reject) => {
      if (!this.server) {
        return resolve();
      }

      this.server.close(error => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  isTerminating() {
    return this.isShuttingDown;
  }
}

export const gracefulShutdownManager = new GracefulShutdownManager();
