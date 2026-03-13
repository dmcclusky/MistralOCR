import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables (needed when this file is imported)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Initialize Mistral client
const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.error('❌ MISTRAL_API_KEY not found in environment variables');
  console.error('   Make sure your .env file exists in the project root');
  process.exit(1);
}

const mistral = new Mistral({ apiKey });

interface OCROptions {
  includeImageBase64?: boolean;
}

export async function processDocument(documentUrl: string, options: OCROptions = {}) {
  const { includeImageBase64 = true } = options;

  try {
    const response = await mistral.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        documentUrl: documentUrl,
      },
      includeImageBase64: includeImageBase64,
    });

    return response;
  } catch (error: any) {
    console.error('Mistral OCR Error:', error);
    throw new Error(error.message || 'Failed to process document with Mistral OCR');
  }
}

export default mistral;
