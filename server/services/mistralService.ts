import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
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

/**
 * Process a document using Mistral OCR
 * Uses file upload API for better handling of large files (up to 512MB)
 */
export async function processDocumentFile(filePath: string, options: OCROptions = {}) {
  const { includeImageBase64 = true } = options;

  try {
    console.log('📤 Uploading file to Mistral...');
    console.log('   File:', filePath);

    // Get file stats for logging
    const stats = fs.statSync(filePath);
    console.log('   Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

    // Read file into buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create a Blob from the buffer
    const blob = new Blob([fileBuffer]);

    // Upload file to Mistral (supports up to 512MB)
    const uploadedFile = await mistral.files.upload({
      file: {
        fileName: path.basename(filePath),
        content: blob,
      },
      purpose: 'ocr',
    });

    console.log('✅ File uploaded:', uploadedFile.id);

    // Get signed URL for the uploaded file
    const signedUrl = await mistral.files.getSignedUrl({
      fileId: uploadedFile.id,
    });

    console.log('🔗 Got signed URL, processing OCR...');

    // Process with Mistral OCR using the signed URL
    const response = await mistral.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        documentUrl: signedUrl.url,
      },
      includeImageBase64: includeImageBase64,
    });

    console.log('✅ OCR processing complete');
    console.log('   Pages:', response.pages?.length || 0);

    // Clean up uploaded file from Mistral
    try {
      await mistral.files.delete({ fileId: uploadedFile.id });
      console.log('🗑️  Cleaned up uploaded file');
    } catch (cleanupError) {
      console.warn('⚠️  Could not clean up file:', cleanupError);
    }

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

/**
 * Process a document URL using Mistral OCR
 */
export async function processDocumentUrl(documentUrl: string, options: OCROptions = {}) {
  const { includeImageBase64 = true } = options;

  try {
    console.log('🌐 Processing document URL...');
    console.log('   URL:', documentUrl.substring(0, 100) + '...');

    const response = await mistral.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        documentUrl: documentUrl,
      },
      includeImageBase64: includeImageBase64,
    });

    console.log('✅ OCR processing complete');
    console.log('   Pages:', response.pages?.length || 0);

    return response;
  } catch (error: any) {
    console.error('❌ Mistral OCR Error:', error);
    const errorMessage = error.body?.message || error.message || 'Unknown error from Mistral API';
    throw new Error(`Mistral API Error: ${errorMessage}`);
  }
}

export default mistral;
