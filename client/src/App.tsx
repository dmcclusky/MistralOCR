import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { OCRResult } from './components/OCRResult';
import { LoadingSpinner } from './components/LoadingSpinner';
import { processFile } from './services/api';
import type { OCRResponse } from './types';
import { Scan, AlertCircle, CheckCircle } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setResult(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await processFile(selectedFile);
      setResult(response);
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to process document. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mistral OCR</h1>
              <p className="text-sm text-gray-500">Extract text from documents with AI</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClearFile={handleClearFile}
            isProcessing={isProcessing}
          />
        </div>

        {/* Process Button */}
        {selectedFile && !result && (
          <div className="mb-8">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  <span>Process Document</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Processing Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {result && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">Processing Complete</h3>
              <p className="text-sm text-green-700 mt-1">
                Successfully extracted text from {result.totalPages} page{result.totalPages !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && <OCRResult result={result} />}

        {/* New Document Button */}
        {result && (
          <div className="mt-8 text-center">
            <button
              onClick={handleClearFile}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Process another document →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Powered by <a href="https://mistral.ai" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Mistral AI</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
