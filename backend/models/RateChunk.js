const mongoose = require('mongoose');

const rateChunkSchema = new mongoose.Schema({
  company: String,
  text: String, // extracted table as plain text
  embedding: [Number]
});

module.exports = mongoose.model('RateChunk', rateChunkSchema); 