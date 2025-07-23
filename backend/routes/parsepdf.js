const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const DocChunk = require('../models/DocChunk');
const { getEmbedding } = require('../services/embeddings');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * Extracts text from a PDF buffer using the Mistral OCR API.
 */
const parsePDFWithMistralOCR = async (buffer) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set in environment');
  
  console.log('[Mistral OCR] Starting PDF extraction using Mistral OCR API...');
  
  // 1. Upload PDF to Mistral
  const formData = new FormData();
  formData.append('purpose', 'ocr');
  formData.append('file', buffer, { filename: 'uploaded.pdf' });
  
  let fileId;
  try {
    const uploadRes = await axios.post(
      'https://api.mistral.ai/v1/files',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    fileId = uploadRes.data.id;
    console.log(`[Mistral OCR] PDF uploaded successfully. File ID: ${fileId}`);
  } catch (err) {
    console.error('[Mistral OCR] Failed to upload PDF:', err.message);
    throw new Error('Failed to upload PDF to Mistral OCR: ' + err.message);
  }
  
  // 2. Get signed URL
  let signedUrl;
  try {
    const urlRes = await axios.get(
      `https://api.mistral.ai/v1/files/${fileId}/url?expiry=24`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );
    signedUrl = urlRes.data.url;
    console.log('[Mistral OCR] Signed URL retrieved successfully.');
  } catch (err) {
    console.error('[Mistral OCR] Failed to get signed URL:', err.message);
    throw new Error('Failed to get signed URL from Mistral: ' + err.message);
  }
  
  // 3. Request OCR
  try {
    const ocrRes = await axios.post(
      'https://api.mistral.ai/v1/ocr',
      {
        model: 'mistral-ocr-latest',
        document: {
          type: 'document_url',
          document_url: signedUrl,
        },
        include_image_base64: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Combine markdown from all pages
    const pages = ocrRes.data.pages || [];
    console.log('[Mistral OCR] Number of pages returned:', pages.length);
    console.log('[Mistral OCR] Full pages array:', JSON.stringify(pages, null, 2));
    
    const text = pages.map(page => page.markdown).join('\n');
    console.log('[Mistral OCR] Text extracted from Mistral OCR. Preview:');
    console.log(text.slice(0, 500)); // Log first 500 chars as a preview
    
    return text;
  } catch (err) {
    console.error('[Mistral OCR] Failed to extract text:', err.message);
    throw new Error('Failed to extract text with Mistral OCR: ' + err.message);
  } finally {
    // Clean up the uploaded file from Mistral (optional)
    try {
      await axios.delete(`https://api.mistral.ai/v1/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      console.log('[Mistral OCR] Cleaned up uploaded file from Mistral');
    } catch (cleanupErr) {
      console.warn('[Mistral OCR] Failed to cleanup file:', cleanupErr.message);
    }
  }
};

// Helper: chunk text into ~500 word chunks
function chunkText(text, chunkSize = 500) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

// POST /parsepdf - upload and process a PDF with Mistral OCR
router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded.' });
  }
  
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  // Reapply singleChunk and contextLine params
  const singleChunk = req.body.singleChunk === 'true' || req.query.singleChunk === 'true';
  const contextLine = req.body.contextLine || '';
  
  try {
    console.log(`Processing PDF: ${originalName}`);
    
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Extract text using Mistral OCR
    const text = await parsePDFWithMistralOCR(dataBuffer);
    
    // Clean up markdown formatting for better chunking
    const cleanText = text
      .replace(/#+\s/g, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/\n+/g, '\n') // Normalize line breaks
      .trim();
    
    // Chunk the text or store as single chunk
    let chunks;
    if (singleChunk) {
      chunks = [contextLine ? (contextLine + '\n' + cleanText) : cleanText];
    } else {
      const words = cleanText.split(/\s+/).filter(word => word.length > 0);
      chunks = [];
      for (let i = 0; i < words.length; i += 500) {
        const chunk = (contextLine ? (contextLine + '\n') : '') + words.slice(i, i + 500).join(' ');
        chunks.push(chunk);
      }
    }
    
    // Store chunks with embeddings
    let count = 0;
    for (const chunk of chunks) {
      if (chunk.trim().length < 50) continue; // skip tiny chunks
      try {
        const embedding = await getEmbedding(chunk);
        await DocChunk.create({ 
          text: chunk, 
          embedding, 
          source: originalName,
          processedWith: 'mistral-ocr'
        });
        count++;
      } catch (embeddingError) {
        console.error('Error creating embedding:', embeddingError);
        // Continue processing other chunks
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    console.log(`Successfully processed ${originalName}: ${count} chunks stored`);
    
    res.json({ 
      message: `Stored ${count} chunks from ${originalName} using Mistral OCR`, 
      extractedText: cleanText,
      originalMarkdown: text // Include original markdown if needed
    });
    
  } catch (err) {
    console.error('PDF processing error:', err);
    
    // Clean up uploaded file in case of error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({ 
      error: 'Failed to process PDF with Mistral OCR.',
      details: err.message 
    });
  }
});

// GET /health - health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    ocrProvider: 'mistral-ocr',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;