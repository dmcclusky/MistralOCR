# MistralOCR

Document OCR processing app using Mistral AI API. Upload PDFs or images and extract text with high accuracy.

![Mistral OCR App](https://img.shields.io/badge/Mistral-OCR-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)

## Features

- 📄 **Upload Documents** - Drag & drop PDFs, PNG, JPG, JPEG, WEBP
- 🔍 **AI-Powered OCR** - Extract text using Mistral's advanced OCR model
- 🖼️ **Image Extraction** - Extract and view images from documents
- 📋 **Copy & Download** - Copy text or download as Markdown
- 📑 **Multi-page Support** - Navigate through multi-page documents

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **OCR API:** Mistral AI OCR (`mistral-ocr-latest`)

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/dmcclusky/MistralOCR.git
cd MistralOCR
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Mistral API key
MISTRAL_API_KEY=your_api_key_here
```

Get your API key at: https://console.mistral.ai/

### 3. Start the Backend

```bash
cd server
npm install
npm run dev
```

Server runs on http://localhost:3001

### 4. Start the Frontend

```bash
cd client
npm install
npm run dev
```

App opens at http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/process` | Upload and process a file |
| POST | `/api/ocr/process-url` | Process a document URL |
| GET | `/api/health` | Health check |

## Project Structure

```
MistralOCR/
├── .env                    # API keys (not committed)
├── .env.example            # Env template
├── server/                 # Backend API
│   ├── index.ts           # Express server
│   ├── routes/
│   │   └── ocr.ts         # OCR routes
│   └── services/
│       └── mistralService.ts  # Mistral integration
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── App.tsx        # Main app component
│   │   ├── components/    # React components
│   │   └── services/      # API client
│   └── index.html
└── README.md
```

## Development

### Backend Development

```bash
cd server
npm run dev       # Start with hot reload (nodemon)
npm run build     # Compile TypeScript
npm start         # Run compiled code
```

### Frontend Development

```bash
cd client
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MISTRAL_API_KEY` | Your Mistral API key (required) | - |
| `PORT` | Backend server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `VITE_API_URL` | Backend URL for frontend | http://localhost:3001 |

## License

MIT
