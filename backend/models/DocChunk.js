const mongoose = require('mongoose');

const docChunkSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  source: String // optional: to track which document
});

module.exports = mongoose.model('DocChunk', docChunkSchema); 