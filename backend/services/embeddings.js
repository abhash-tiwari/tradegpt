require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

let model = null;

// Pre-load the model at server startup
(async () => {
  console.log('[EMBEDDINGS] Loading Universal Sentence Encoder model...');
  model = await use.load();
  console.log('[EMBEDDINGS] Model loaded!');
})();

async function getEmbedding(text) {
  // Wait until the model is loaded
  while (!model) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const embeddings = await model.embed([text]);
  const vector = embeddings.arraySync()[0];
  return vector;
}

function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}

module.exports = { getEmbedding, cosineSimilarity };
