const express = require('express');
const router = express.Router();

// routes
const downloadRoute = require('./download');

router.use('/download', downloadRoute);

module.exports = router;