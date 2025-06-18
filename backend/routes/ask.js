const express = require('express');
const router = express.Router();
const Example = require('../models/Example');
const axios = require('axios');
const { getEmbedding, cosineSimilarity } = require('../services/embeddings');

const SIMILARITY_THRESHOLD = 0.90;

function isFollowUp(message) {
  const followUpKeywords = [
    'elaborate', 'explain', 'why', 'how', 'give example', 'what do you mean', 'clarify', 'expand', 'tell me more', 'more details', 'can you', 'could you', 'please expand', 'please explain', 'continue', 'go on', 'further', 'in detail', 'specify', 'such as', 'like what', 'for instance', 'for example'
  ];
  const lowerMsg = message.trim().toLowerCase();
  return followUpKeywords.some(keyword => lowerMsg.startsWith(keyword) || lowerMsg === keyword);
}

router.post('/', async (req, res) => {
  try {
    const query = req.body.question;
    const history = req.body.history || [];

    if (isFollowUp(query)) {
      const systemMessage = {
        role: 'system',
        content: `You are TradeGPT, a trade-specific assistant for Indian export-import, logistics, and compliance.\nYou only answer questions about: exports/imports, DGFT schemes, customs, GST, shipping, trade compliance, licensing, and trade agreements.\nFor any non-trade questions, respond: \"I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics.\"\nWhen answering, be detailed and thorough. Provide comprehensive explanations and examples where possible.`
      };
      let messagesArr = [systemMessage];
      if (history.length > 0) {
        history.forEach(msg => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messagesArr.push({ role: msg.role, content: msg.content });
          }
        });
      } else {
        messagesArr.push({ role: 'user', content: query });
      }
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-large-latest',
          messages: messagesArr,
          temperature: 0.3,
          max_tokens: 1024
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
        source: 'mistral',
        confidence: 0
      });
    }

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
        source: 'database',
        matchedQuestion: bestMatch.question,
        confidence: bestMatch.similarity.toFixed(2)
      });
    }

    const systemMessage = {
      role: 'system',
      content: `You are TradeGPT, a trade-specific assistant for Indian export-import, logistics, and compliance.\nYou only answer questions about: exports/imports, DGFT schemes, customs, GST, shipping, trade compliance, licensing, and trade agreements.\nFor any non-trade questions, respond: \"I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics.\"\nWhen answering, be detailed and thorough. Provide comprehensive explanations and examples where possible.`
    };
    let messagesArr = [systemMessage];
    if (history.length > 0) {
      history.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messagesArr.push({ role: msg.role, content: msg.content });
        }
      });
    } else {
      messagesArr.push({ role: 'user', content: query });
    }
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-large-latest',
        messages: messagesArr,
        temperature: 0.3,
        max_tokens: 512
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
      source: 'mistral',
      confidence: bestMatch ? bestMatch.similarity.toFixed(2) : 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
