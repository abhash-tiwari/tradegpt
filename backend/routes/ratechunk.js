const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdf_table_extractor = require('pdf-table-extractor');
const RateChunk = require('../models/RateChunk');
const { getEmbedding } = require('../services/embeddings');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF uploaded.' });
  const company = req.body.company || '';
  const contextLine = req.body.contextLine || '';
  const filePath = req.file.path;
  try {
    // Extract table from PDF
    pdf_table_extractor(filePath, async (result) => {
      const allRows = result.pageTables.flatMap(pt => pt.tables);
      let tableText = allRows.map(row => row.join(' | ')).join('\n');
      if (contextLine) {
        tableText = contextLine + '\n' + tableText;
      }
      const embedding = await getEmbedding(tableText);
      await RateChunk.create({ company, text: tableText, embedding });
      fs.unlinkSync(filePath);
      res.json({ message: 'RateChunk stored', company, contextLine });
    }, (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Failed to extract table from PDF.' });
    });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Failed to process PDF.' });
  }
});

router.post('/ask', async (req, res) => {
  const question = req.body.question;
  const company = req.body.company || '';
  if (!question) return res.status(400).json({ error: 'No question provided.' });
  try {
    const queryEmbedding = await getEmbedding(question);
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index_rates',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 3,
          similarity: 'cosine'
        }
      },
      {
        $project: {
          text: 1,
          company: 1,
          similarity: { $meta: 'vectorSearchScore' }
        }
      }
    ];
    let matchChunks = await RateChunk.aggregate(pipeline);
    if (company) {
      matchChunks = matchChunks.filter(chunk => chunk.company === company);
    }
    const bestChunk = matchChunks[0];
    if (bestChunk && bestChunk.similarity >= 0.60) {
      return res.json({
        answer: bestChunk.text,
        company: bestChunk.company,
        confidence: bestChunk.similarity.toFixed(2),
        source: 'ratechunk'
      });
    } else {
      return res.json({
        answer: 'No relevant shipping rate found in the rate sheet database.',
        source: 'ratechunk',
        confidence: 0
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process question.' });
  }
});

module.exports = router; 