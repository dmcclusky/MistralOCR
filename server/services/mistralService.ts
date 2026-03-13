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
    console.log('📤 Sending request to Mistral OCR...');
    console.log('   Document URL length:', documentUrl.length);
    console.log('   Model: mistral-ocr-latest');

    const response = await mistral.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        documentUrl: documentUrl,
      },
      includeImageBase64: includeImageBase64,
    });

    console.log('✅ Mistral OCR response received');
    return response;
  } catch (error: any) {
    // Log full error details
    console.error('❌ Mistral OCR Error Details:');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error status:', error.statusCode || error.status);
    console.error('   Error code:', error.code);
    
    if (error.body) {
      console.error('   Error body:', JSON.stringify(error.body, null, 2));
    }
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Return a more informative error
    const errorMessage = error.body?.message || error.message || 'Unknown error from Mistral API';
    throw new Error(`Mistral API Error: ${errorMessage}`);
  }
}

export default mistral;
