const axios = require('axios');
const ytdl = require('ytdl-core');
const FormData = require('form-data');
const { createYouTubeObject, createTwitterObject, createRedditObjet } = require('./object');

const downloader = async (type, url) => {
    let data;

    switch (type) {
        case 'youtube':
            data = await downloadFromYouTube(url);
            break;
        case 'twitter':
            data = await downloadFromTwitter(url);
        case 'reddit':
            data = await downloadFromReddit(url);
        default:
            throw Error('Invalid type');
            break;
    }

    return data;
};

const downloadFromYouTube = async (url) => {
    try {
        const video = await ytdl.getInfo(url);

        return createYouTubeObject(video);
    } catch (error) {
        throw new Error(error);
    }
};

const downloadFromTwitter = async (url) => {
    const form = new FormData();
    form.append('url', url);
    form.append('action', 'post');

    const { data } = await axios.post('https://twsaver.com/twitter-video-downloader.php', form);

    return createTwitterObject(data);
};

const downloadFromReddit = async (url) => {
    const rs = `https://redditsave.com/info?url=${url}`;

    const { data } = await axios.get(encodeURI(rs));

    return await createRedditObjet(data);
};

module.exports = downloader;