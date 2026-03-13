import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { processDocumentFile, processDocumentUrl } from '../services/mistralService';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG, JPEG, and WEBP are allowed.'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit (Mistral supports up to 512MB)
});

// POST /api/ocr/process - Process uploaded file
router.post('/process', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📄 Processing file: ${req.file.originalname}`);
    console.log(`   MIME type: ${req.file.mimetype}`);
    console.log(`   Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Process with Mistral OCR using file upload API
    const result = await processDocumentFile(req.file.path, {
      includeImageBase64: true,
    });

    // Cleanup local uploaded file
    fs.unlinkSync(req.file.path);
    console.log(`✅ Successfully processed: ${req.file.originalname}`);

    res.json({
      success: true,
      filename: req.file.originalname,
      pages: result.pages,
      totalPages: result.pages?.length || 0
    });

  } catch (error: any) {
    console.error('❌ OCR Route Error:', error);
    
    // Cleanup local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Send detailed error to client
    res.status(500).json({ 
      error: 'OCR processing failed',
      message: error.message || 'Unknown error',
      details: error.body || error.response?.data || null
    });
  }
});

// POST /api/ocr/process-url - Process document from URL
router.post('/process-url', async (req: Request, res: Response) => {
  try {
    const { documentUrl } = req.body;
    
    if (!documentUrl) {
      return res.status(400).json({ error: 'No document URL provided' });
    }

    console.log(`🌐 Processing URL: ${documentUrl}`);

    // Process with Mistral OCR
    const result = await processDocumentUrl(documentUrl, {
      includeImageBase64: true,
    });

    console.log(`✅ Successfully processed URL`);

    res.json({
      success: true,
      url: documentUrl,
      pages: result.pages,
      totalPages: result.pages?.length || 0
    });

  } catch (error: any) {
    console.error('❌ OCR URL Error:', error);
    res.status(500).json({ 
      error: 'OCR processing failed',
      message: error.message || 'Unknown error',
      details: error.body || error.response?.data || null
    });
  }
});

export default router;
