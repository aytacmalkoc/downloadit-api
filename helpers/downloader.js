const axios = require('axios');
const ytdl = require('ytdl-core');
const FormData = require('form-data');
const { createYouTubeObject, createTwitterObject, createRedditObjet } = require('./object');

const downloader = async (type, url) => {
    try {
        let data;

        switch (type) {
            case 'youtube':
                data = await downloadFromYouTube(url);
                break;
            case 'twitter':
                data = await downloadFromTwitter(url);
                break;
            case 'reddit':
                data = await downloadFromReddit(url);
                break;
            default:
                throw Error('Invalid type');
                break;
        }

        // sort video by quality higher to lower
        data.videos = data.videos.sort((a, b) => b.quality.localeCompare(a.quality));

        return data;
    } catch (error) {
        throw Error(error);
    }
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
    try {
        const form = new FormData();
        form.append('url', url);
        form.append('action', 'post');

        const { data } = await axios.post('https://twsaver.com/twitter-video-downloader.php', form);

        return createTwitterObject(data, url);
    } catch (error) {
        throw Error(error);
    }
};

const downloadFromReddit = async (url) => {
    try {
        const rs = `https://redditsave.com/info?url=${url}`;

        const { data } = await axios.get(encodeURI(rs));

        return await createRedditObjet(data);
    } catch (error) {
        throw Error(error);
    }
};

module.exports = downloader;