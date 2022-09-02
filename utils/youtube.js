const ytdl = require('ytdl-core');

const downloadFromYouTube = async (url) => await ytdl.getInfo(url);

module.exports = downloadFromYouTube;