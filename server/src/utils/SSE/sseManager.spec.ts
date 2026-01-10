import type { Response } from 'express';
import { RecipeGenerationStatus } from '@server/enums/RecipeGenerationStatus';
import { SSEManager } from '.';

describe('SSEManager', () => {
  let sseManager: SSEManager;
  let mockRes: Response;

  const createMockResponse = () => {
    return {
      write: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;
  };

  beforeEach(() => {
    sseManager = new SSEManager();
    mockRes = createMockResponse();
  });

  describe('Client Management', () => {
    it('Should add a client and be able to send data to it', () => {
      const userId = 'user-123';
      const data = {
        status: RecipeGenerationStatus.SUCCESS,
        recipes: [],
      };

      sseManager.addClient(userId, mockRes);
      sseManager.sendToClient(userId, data);

      expect(mockRes.write).toHaveBeenCalledTimes(1);
    });

    it('Should remove a client and stop sending data', () => {
      const userId = 'user-to-remove';
      const data = {
        status: RecipeGenerationStatus.ERROR,
        message: 'Test error',
      };

      sseManager.addClient(userId, mockRes);
      sseManager.sendToClient(userId, data);
      expect(mockRes.write).toHaveBeenCalledTimes(1);

      sseManager.removeClient(userId);

      sseManager.sendToClient(userId, data);

      expect(mockRes.write).toHaveBeenCalledTimes(1);
    });

    it('Should handle sending data to a non-existent user gracefully', () => {
      sseManager.sendToClient('ghost-user', {
        status: RecipeGenerationStatus.ERROR,
        message: 'Boo',
      });

      expect(mockRes.write).not.toHaveBeenCalled();
    });
  });

  describe('Data Formatting', () => {
    it('Should format success data correctly according to SSE standard', () => {
      const userId = 'valid-user';
      sseManager.addClient(userId, mockRes);

      const payload = {
        status: RecipeGenerationStatus.SUCCESS,
        recipes: [{ title: 'Pasta' } as any],
      };

      sseManager.sendToClient(userId, payload);

      const expectedString = `data: ${JSON.stringify(payload)}\n\n`;

      expect(mockRes.write).toHaveBeenCalledWith(expectedString);
    });

    it('Should format error data correctly', () => {
      const userId = 'error-user';
      sseManager.addClient(userId, mockRes);

      const payload = {
        status: RecipeGenerationStatus.ERROR,
        message: 'Something went wrong',
      };

      sseManager.sendToClient(userId, payload);

      const expectedString = `data: ${JSON.stringify(payload)}\n\n`;

      expect(mockRes.write).toHaveBeenCalledWith(expectedString);
    });
  });

  describe('Multiple Clients', () => {
    it('Should send data only to the specific targeted client', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      const res1 = createMockResponse();
      const res2 = createMockResponse();

      sseManager.addClient(user1, res1);
      sseManager.addClient(user2, res2);

      const data = { status: RecipeGenerationStatus.SUCCESS, recipes: [] };

      sseManager.sendToClient(user1, data);

      expect(res1.write).toHaveBeenCalled();
      expect(res2.write).not.toHaveBeenCalled();
    });
  });
});
