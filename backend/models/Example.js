const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  question: String,
  answer: String,
  embedding: [Number]
});

module.exports = mongoose.model('Example', exampleSchema);
