# MistralOCR App - Project Planning Document

## 1. Project Overview

**Goal:** Build a web application that allows users to upload documents (PDFs, images) and process them using the Mistral OCR API to extract text, structured data, and images.

**Repository:** `MistralOCR` on GitHub

---

## 2. Tech Stack Options

### Option A: React + Node.js (Recommended for Full-Stack Web App)
- **Frontend:** React 18+ with TypeScript, Tailwind CSS
- **Backend:** Node.js + Express
- **File Upload:** Multer for handling file uploads
- **API Client:** Mistral AI JavaScript SDK
- **Environment:** dotenv for API key management

### Option B: Python + Streamlit (Quick Prototype)
- **Framework:** Streamlit for rapid UI development
- **API Client:** `mistralai` Python SDK
- **File Handling:** Built-in Streamlit file uploader
- **Environment:** python-dotenv

### Recommended: Option A (React + Node.js)
Better scalability, professional UI, and more flexible for future enhancements.

---

## 3. Mistral OCR API Reference

### Endpoint
```
POST https://api.mistral.ai/v1/ocr
```

### Authentication
- Header: `Authorization: Bearer {MISTRAL_API_KEY}`
- API Key stored in `.env` file

### Key Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | `"mistral-ocr-latest"` |
| `document` | object | Document input (URL, base64, or uploaded file) |
| `include_image_base64` | boolean | Include extracted images as base64 |

### Document Input Types
1. **Document URL:** `{ "type": "document_url", "document_url": "https://..." }`
2. **Image URL:** `{ "type": "image_url", "image_url": "https://..." }`
3. **Base64 PDF:** `{ "type": "document_url", "document_url": "data:application/pdf;base64,..." }`

### Response Structure
```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Extracted text...",
      "images": [
        {
          "id": "img-0.jpeg",
          "image_base64": "base64encoded..."
        }
      ]
    }
  ]
}
```

---

## 4. Core Features

### MVP Features (Phase 1)
- [ ] File upload (PDF, PNG, JPG, JPEG)
- [ ] Process documents with Mistral OCR
- [ ] Display extracted markdown text
- [ ] Download results as Markdown file
- [ ] Environment variable configuration (.env)

### Enhanced Features (Phase 2)
- [ ] Display extracted images alongside text
- [ ] Document preview before processing
- [ ] Processing history/stored results
- [ ] Copy to clipboard functionality
- [ ] Page-by-page navigation for multi-page PDFs

### Advanced Features (Phase 3)
- [ ] Document Q&A (ask questions about the document)
- [ ] Structured data extraction (JSON output)
- [ ] Batch processing multiple files
- [ ] Export to multiple formats (JSON, TXT, DOCX)
- [ ] User authentication (optional)

---

## 5. Project Structure

```
MistralOCR/
├── .env                          # API keys (not committed)
├── .env.example                  # Template for .env
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── PLANNING.md                   # This document
├── package.json                  # Node dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
│
├── server/                       # Backend
│   ├── index.ts                  # Express server entry
│   ├── routes/
│   │   └── ocr.ts                # OCR API routes
│   ├── services/
│   │   └── mistralService.ts     # Mistral API integration
│   └── uploads/                  # Temporary upload directory
│
└── client/                       # Frontend (React)
    ├── index.html
    ├── src/
    │   ├── main.tsx              # App entry
    │   ├── App.tsx               # Main component
    │   ├── components/
    │   │   ├── FileUpload.tsx    # File upload component
    │   │   ├── OCRResult.tsx     # Display OCR results
    │   │   └── LoadingSpinner.tsx
    │   ├── hooks/
    │   │   └── useOCR.ts         # Custom hook for OCR API
    │   ├── services/
    │   │   └── api.ts            # API client
    │   └── types/
    │       └── index.ts          # TypeScript types
    └── public/
```

---

## 6. Environment Variables (.env)

```bash
# Mistral API Configuration
MISTRAL_API_KEY=your_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration (for build)
VITE_API_URL=http://localhost:3001
```

---

## 7. Implementation Phases

### Phase 1: Project Setup & Git Repository
- [ ] Initialize git repository
- [ ] Create GitHub repository "MistralOCR"
- [ ] Set up project structure (folders)
- [ ] Create .env and .env.example files
- [ ] Add .gitignore for Node.js

### Phase 2: Backend Development
- [ ] Initialize Node.js project with TypeScript
- [ ] Install dependencies (express, multer, mistralai, dotenv, cors)
- [ ] Create Express server with OCR endpoint
- [ ] Implement file upload handling
- [ ] Integrate Mistral OCR API client
- [ ] Test backend with curl/Postman

### Phase 3: Frontend Development
- [ ] Initialize React project with Vite + TypeScript
- [ ] Install dependencies (axios, react-dropzone)
- [ ] Create FileUpload component with drag-and-drop
- [ ] Create OCRResult component for displaying results
- [ ] Implement API integration
- [ ] Add loading states and error handling

### Phase 4: Polish & Documentation
- [ ] Add Tailwind CSS styling
- [ ] Create README with setup instructions
- [ ] Add download/export functionality
- [ ] Test end-to-end workflow
- [ ] Push to GitHub

---

## 8. Git & GitHub Setup Instructions

### Step 1: Initialize Local Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Project structure and planning"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `MistralOCR`
3. Description: "Document OCR processing app using Mistral AI"
4. Choose visibility (Public/Private)
5. **Do NOT** initialize with README (we already have one)

### Step 3: Link and Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/MistralOCR.git
git branch -M main
git push -u origin main
```

---

## 9. Dependencies to Install

### Backend (server/)
```bash
npm init -y
npm install express multer cors dotenv mistralai
npm install -D @types/express @types/multer @types/cors @types/node typescript ts-node nodemon
```

### Frontend (client/)
```bash
npm create vite@latest client -- --template react-ts
cd client
npm install axios react-dropzone lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 10. Sample API Implementation

### Backend Route (server/routes/ocr.ts)
```typescript
import { Router } from 'express';
import multer from 'multer';
import { Mistral } from '@mistralai/mistralai';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

router.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert file to base64
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64File = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    const dataUri = `data:${mimeType};base64,${base64File}`;

    // Call Mistral OCR
    const response = await mistral.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        document_url: dataUri,
      },
      include_image_base64: true,
    });

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json(response);
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'OCR processing failed' });
  }
});

export default router;
```

---

## 11. Security Considerations

- [ ] Never commit `.env` file to git
- [ ] Add `.env` to `.gitignore`
- [ ] Validate file types before processing (PDF, PNG, JPG, JPEG)
- [ ] Set file size limits (e.g., 10MB max)
- [ ] Use HTTPS in production
- [ ] Rate limiting on API endpoints (optional)

---

## 12. Next Steps

1. **Review this planning document** and confirm tech stack choice
2. **Create your Mistral API key** at https://console.mistral.ai/
3. **Run the Git setup commands** from Section 8
4. **Begin implementation** following the phases in Section 7

---

## Resources

- [Mistral OCR Documentation](https://docs.mistral.ai/capabilities/document_ai)
- [Mistral AI Console](https://console.mistral.ai/)
- [Mistral JavaScript SDK](https://github.com/mistralai/client-js)
- [Mistral Python SDK](https://github.com/mistralai/client-python)
