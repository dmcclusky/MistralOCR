import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { processDocument } from '../services/mistralService';

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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/ocr/process - Process uploaded file
router.post('/process', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📄 Processing file: ${req.file.originalname}`);

    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64File = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    // Create data URI
    const dataUri = `data:${mimeType};base64,${base64File}`;

    // Process with Mistral OCR
    const result = await processDocument(dataUri);

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);
    console.log(`✅ Successfully processed: ${req.file.originalname}`);

    res.json({
      success: true,
      filename: req.file.originalname,
      pages: result.pages,
      totalPages: result.pages?.length || 0
    });

  } catch (error: any) {
    console.error('❌ OCR Error:', error);
    
    // Cleanup file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'OCR processing failed',
      message: error.message || 'Unknown error'
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
    const result = await processDocument(documentUrl);

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
      message: error.message || 'Unknown error'
    });
  }
});

export default router;
