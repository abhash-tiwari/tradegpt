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
  const totalStart = Date.now();
  try {
    const query = req.body.question;
    const history = req.body.history || [];

    if (isFollowUp(query)) {
      const systemMessage = {
        role: 'system',
        content: `You are TradeGPT, a trade-specific assistant for Indian export-import, logistics, and compliance.\nWhen the user asks a follow-up like 'elaborate' or 'explain more', do NOT repeat generic introductions or overviews. Instead, immediately expand on your previous answer with new details, examples, or step-by-step guides. Avoid repeating phrases like 'I can provide detailed information...' or listing broad topic areas unless specifically asked.`
      };
      let messagesArr = [systemMessage];
      let followUpContent = query;
      if (history.length >= 2) {
        const lastUser = history[history.length - 2];
        const lastAssistant = history[history.length - 1];
        if (lastUser.role === 'user') messagesArr.push({ role: 'user', content: lastUser.content });
        if (lastAssistant.role === 'assistant') messagesArr.push({ role: 'assistant', content: lastAssistant.content });
        const shortFollowUps = ['elaborate', 'explain', 'why', 'how', 'give example', 'what do you mean', 'clarify', 'expand', 'tell me more', 'more details', 'can you', 'could you', 'please expand', 'please explain', 'continue', 'go on', 'further', 'in detail', 'specify', 'such as', 'like what', 'for instance', 'for example'];
        if (shortFollowUps.includes(query.trim().toLowerCase())) {
          followUpContent = `Please elaborate on your previous answer about: "${lastUser.content}"`;
        }
      }
      messagesArr.push({ role: 'user', content: followUpContent });
      const aiStart = Date.now();
      let aiResponse;
      try {
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
        aiResponse = response.data.choices[0].message.content;
      } catch (apiErr) {
        console.error('AI API call failed:', apiErr);
        return res.status(503).json({ error: 'AI service unavailable. Please try again later.' });
      }
      // Post-process to remove generic phrases from the start
      const genericPhrases = [
        /^I can provide detailed information on various aspects of Indian export-import, logistics, and compliance\. Here are some key areas with elaborate explanations:?\s*/i,
        /^Of course! I'm here to help with any questions or topics related to Indian export-import, logistics, and compliance\.\s*/i,
        /^Let's dive deeper into the key aspects of Indian export-import processes, logistics, and compliance\.\s*/i
      ];
      for (const regex of genericPhrases) {
        aiResponse = aiResponse.replace(regex, '');
      }
      console.log(`[TIMING] AI call (follow-up) took ${Date.now() - aiStart}ms`);
      console.log(`[TIMING] Total request took ${Date.now() - totalStart}ms`);
      return res.json({
        answer: aiResponse.trim(),
        source: 'mistral',
        confidence: 0
      });
    }

    const embedStart = Date.now();
    const queryEmbedding = await getEmbedding(query);
    console.log(`[TIMING] Embedding generation took ${Date.now() - embedStart}ms`);

    const dbStart = Date.now();
    // Use MongoDB Atlas Vector Search to fetch top 3 most similar examples
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector', // Name of your vector index
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 3,
          similarity: 'cosine'
        }
      },
      {
        $project: {
          question: 1,
          answer: 1,
          embedding: 1,
          similarity: { $meta: 'vectorSearchScore' }
        }
      }
    ];
    const examples = await Example.aggregate(pipeline);
    console.log(`[TIMING] Vector search took ${Date.now() - dbStart}ms (fetched ${examples.length} records)`);

    const simStart = Date.now();
    // Use the similarity score from vector search
    const scored = examples.map(ex => ({
      question: ex.question,
      answer: ex.answer,
      similarity: ex.similarity
    }));
    const bestMatch = scored.sort((a, b) => b.similarity - a.similarity)[0];
    console.log(`[TIMING] Similarity calculation took ${Date.now() - simStart}ms`);

    if (bestMatch && bestMatch.similarity >= SIMILARITY_THRESHOLD) {
      console.log(`[TIMING] Total request took ${Date.now() - totalStart}ms`);
      return res.json({
        answer: bestMatch.answer,
        source: 'database',
        matchedQuestion: bestMatch.question,
        confidence: bestMatch.similarity.toFixed(2)
      });
    }

    const aiStart = Date.now();
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
    console.log(`[TIMING] AI call took ${Date.now() - aiStart}ms`);
    console.log(`[TIMING] Total request took ${Date.now() - totalStart}ms`);
    return res.json({
      answer: response.data.choices[0].message.content,
      source: 'mistral',
      confidence: bestMatch ? bestMatch.similarity.toFixed(2) : 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
