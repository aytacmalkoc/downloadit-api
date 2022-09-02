const express = require('express');
const { downloadFromYouTube, downloadFromTwitter, downloadFromReddit} = require('../utils');
const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const { type, url } = req.query;
    let data;

    if (type === 'youtube') {
      data = await downloadFromYouTube(url);
    }else if (type === 'twitter') {
      data = await downloadFromTwitter(url);
    }else if (type === 'reddit') {
      data = await downloadFromReddit(url);
    }else {
      return res.json({
        message: 'invalid type',
        available_types: ['youtube', 'twitter', 'reddit']
      }).status(400);
    }

    return res.json({
      data
    }).status(200);
  } catch (error) {
    return res.json({
      message: error.message,
      error
    }).status(400);
  }
});

module.exports = router;
