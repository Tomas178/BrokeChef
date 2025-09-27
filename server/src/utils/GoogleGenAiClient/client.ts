import { GoogleGenAI } from '@google/genai';
import config from '@server/config';
import logger from '@server/logger';

export const ai = new GoogleGenAI({ apiKey: config.auth.google.geminiApiKey });

logger.info('Google Gen Ai Client authenticated!');
