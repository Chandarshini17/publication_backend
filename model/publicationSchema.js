const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
  },
  issue: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, 
    required: false,
  },
  link: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, 
});

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;