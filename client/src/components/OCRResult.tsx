import { useState } from 'react';
import { Copy, Download, Check, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { OCRResponse } from '../types';

interface OCRResultProps {
  result: OCRResponse;
}

export function OCRResult({ result }: OCRResultProps) {
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const allText = result.pages.map((page) => page.markdown).join('\n\n---\n\n');
  const currentPageData = result.pages[currentPage];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([allText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename
      ? `${result.filename.replace(/\.[^/.]+$/, '')}.md`
      : 'ocr-result.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">OCR Results</h3>
              <p className="text-sm text-gray-500">
                {result.totalPages} page{result.totalPages !== 1 ? 's' : ''} processed
                {result.filename && ` • ${result.filename}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy All
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Markdown
            </button>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      {result.totalPages > 1 && (
        <div className="border-b px-6 py-3 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {result.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(result.totalPages - 1, p + 1))}
            disabled={currentPage === result.totalPages - 1}
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="markdown-content prose max-w-none">
          {currentPageData?.markdown ? (
            <div
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(currentPageData.markdown),
              }}
            />
          ) : (
            <p className="text-gray-500 italic">No text content found on this page.</p>
          )}
        </div>

        {/* Images */}
        {currentPageData?.images && currentPageData.images.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Extracted Images ({currentPageData.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentPageData.images.map((img) => (
                <div key={img.id} className="border rounded-lg overflow-hidden">
                  {img.imageBase64 ? (
                    <img
                      src={img.imageBase64}
                      alt={img.id}
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <div className="bg-gray-100 p-4 text-center text-sm text-gray-500">
                      {img.id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple markdown to HTML converter
function formatMarkdown(markdown: string): string {
  return (
    markdown
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="max-w-full h-auto my-4" />')
      // Line breaks
      .replace(/\n/g, '<br />')
  );
}
