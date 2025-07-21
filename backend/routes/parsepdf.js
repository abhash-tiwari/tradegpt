const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const DocChunk = require('../models/DocChunk');
const { getEmbedding } = require('../services/embeddings');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper: chunk text into ~500 word chunks
function chunkText(text, chunkSize = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

// POST /parsepdf - upload and process a PDF
router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded.' });
  }
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const chunks = chunkText(text, 500);
    let count = 0;
    for (const chunk of chunks) {
      if (chunk.trim().length < 50) continue; // skip tiny chunks
      const embedding = await getEmbedding(chunk);
      await DocChunk.create({ text: chunk, embedding, source: originalName });
      count++;
    }
    fs.unlinkSync(filePath); // Clean up uploaded file
    res.json({ message: `Stored ${count} chunks from ${originalName}`, extractedText: text });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error(err);
    res.status(500).json({ error: 'Failed to process PDF.' });
  }
});

module.exports = router; 