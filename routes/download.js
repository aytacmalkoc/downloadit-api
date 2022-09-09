const express = require('express');
const downloader = require('../helpers/downloader');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, url } = req.query;

    return res.json(await downloader(type, url)).status(200);
  } catch (error) {
    return res.json(error);
  }
});

module.exports = router;
