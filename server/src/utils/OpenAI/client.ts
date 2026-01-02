import config from '@server/config';
import logger from '@server/logger';
import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: config.auth.openai.apiKey });

logger.info('OpenAI Client authenticated');
