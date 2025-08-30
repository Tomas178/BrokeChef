import { GoogleGenAI } from '@google/genai';
import config from '@server/config';

export const ai = new GoogleGenAI({ apiKey: config.auth.google.geminiApiKey });

console.log('Google Gen Ai Client authenticated!');
