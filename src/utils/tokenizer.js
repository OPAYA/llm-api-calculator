import { get_encoding, encoding_for_model } from '@dqbd/tiktoken';

let encoder = null;

export async function initializeTokenizer() {
  if (!encoder) {
    encoder = await get_encoding('cl100k_base');
  }
  return encoder;
}

export async function getEncoderForModel(modelId) {
  try {
    const modelMapping = {
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4-turbo': 'gpt-4-turbo-preview',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'claude-3-opus': 'cl100k_base',
      'claude-3-sonnet': 'cl100k_base',
      'claude-3-haiku': 'cl100k_base',
      'gemini-pro': 'cl100k_base',
      'gemini-pro-vision': 'cl100k_base',
      'mistral-large': 'cl100k_base',
      'mistral-medium': 'cl100k_base',
      'mistral-small': 'cl100k_base',
      'command-r-plus': 'cl100k_base',
      'command-r': 'cl100k_base'
    };
    
    const modelName = modelMapping[modelId] || 'cl100k_base';
    
    if (modelName === 'cl100k_base') {
      return await initializeTokenizer();
    }
    
    return await encoding_for_model(modelName);
  } catch (error) {
    console.warn(`Failed to get encoder for model ${modelId}, falling back to cl100k_base`, error);
    return await initializeTokenizer();
  }
}

export async function countTokens(text, modelId) {
  if (!text) return 0;
  
  try {
    const encoder = await getEncoderForModel(modelId);
    const tokens = encoder.encode(text);
    return tokens.length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    return Math.ceil(text.length / 4);
  }
}

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}