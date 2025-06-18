const express = require('express');
const router = express.Router();
const Example = require('../models/Example');
const axios = require('axios');
const { getEmbedding, cosineSimilarity } = require('../services/embeddings');

const SIMILARITY_THRESHOLD = 0.90;

router.post('/', async (req, res) => {
  try {
    const query = req.body.question;
    const queryEmbedding = await getEmbedding(query);
    const examples = await Example.find({});
    
    const scored = examples.map(ex => ({
      question: ex.question,
      answer: ex.answer,
      similarity: cosineSimilarity(queryEmbedding, ex.embedding)
    }));

    const bestMatch = scored.sort((a, b) => b.similarity - a.similarity)[0];

    if (bestMatch && bestMatch.similarity >= SIMILARITY_THRESHOLD) {
      return res.json({
        answer: bestMatch.answer,
        source: "database",
        matchedQuestion: bestMatch.question,
        confidence: bestMatch.similarity.toFixed(2)
      });
    }

    const prompt = `You are TradeGPT, a trade-specific assistant for Indian export-import, logistics, and compliance. 
You only answer questions about: exports/imports, DGFT schemes, customs, GST, shipping, trade compliance, licensing, and trade agreements. 
For any non-trade questions, respond: 
"I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."

Answer the following question clearly and precisely:

Q: ${query}
A:`;

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      answer: response.data.choices[0].message.content,
      source: "mistral",
      confidence: bestMatch ? bestMatch.similarity.toFixed(2) : 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
