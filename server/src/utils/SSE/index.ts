import type { GeneratedRecipe } from '@server/entities/generatedRecipe';
import type { ObjectValues } from '@server/shared/types';
import type { Response } from 'express';

export const RecipeGenerationStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type RecipeGenerationStatusValues = ObjectValues<
  typeof RecipeGenerationStatus
>;

export interface SuccessRecipeData {
  status: typeof RecipeGenerationStatus.SUCCESS;
  recipes: GeneratedRecipe[];
}

export interface ErrorRecipeData {
  status: typeof RecipeGenerationStatus.ERROR;
  message: string;
}

export type RecipeSSEData = SuccessRecipeData | ErrorRecipeData;

export class SSEManager {
  private clients: Map<string, Response>;

  constructor() {
    this.clients = new Map();
  }

  addClient(id: string, res: Response) {
    this.clients.set(id, res);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  sendToClient(id: string, data: RecipeSSEData) {
    const res = this.clients.get(id);

    if (res) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }
}

export const sseManager = new SSEManager();
