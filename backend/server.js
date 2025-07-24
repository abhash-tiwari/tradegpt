require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const askRoute = require('./routes/ask');
const parsePdfRoute = require('./routes/parsepdf');
const app = express();
app.use(cors())
app.use(express.json());
app.use('/ask', askRoute);
app.use('/parsepdf', parsePdfRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error(err));
