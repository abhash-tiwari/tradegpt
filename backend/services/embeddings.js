require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

let model = null;

async function loadUSE() {
  if (!model) model = await use.load();
  return model;
}

async function getEmbedding(text) {
  const useModel = await loadUSE();
  const embeddings = await useModel.embed([text]);
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
