const axios = require('axios');
const htmlparser2 = require('htmlparser2');
const cheerio = require('cheerio');
const ytdl = require('ytdl-core');
const { calculateVideoSize, fancyTimeFormat } = require('./formats');

const BASE_OBJECT = {
    title: null,
    owner: null,
    thumbnail: null,
    duration: null,
    duration_readable: null,
    videos: [],
    audio: null,
};

const createYouTubeObject = (data) => {
    try {
        const details = data.videoDetails;

        BASE_OBJECT.title = details.title;
        BASE_OBJECT.owner = details.ownerChannelName,
        BASE_OBJECT.thumbnail = details.thumbnails.pop(),
        BASE_OBJECT.duration = parseInt(details.lengthSeconds),
        BASE_OBJECT.duration_readable = fancyTimeFormat(details.lengthSeconds),
        BASE_OBJECT.audio = ytdl.filterFormats(data.formats, 'audioonly')[0].url

        // filter video formats
        ytdl.filterFormats(data.formats, 'videoandaudio').filter(format => format.container === 'mp4').forEach(format => {
            BASE_OBJECT.videos.push({
                quality: format.qualityLabel,
                format: format.container,
                size: calculateVideoSize(format.contentLength),
                url: format.url,
            });
        });

        return BASE_OBJECT;
    } catch (error) {
        throw Error(error);
    }
};

const createTwitterObject = (html) => {
    try {
        const dom = htmlparser2.parseDocument(html);
        const $ = cheerio.load(dom);
        const tableRows = $('.table tbody').children('tr').toArray();

        tableRows.forEach(row => {
            const childs = $(row).children().toArray();
            const downloadURL = $(childs[3]).children('p').first().children('a').first().attr('href');

            BASE_OBJECT.videos.push({
                quality: $(childs[0]).text(),
                format: $(childs[1]).text(),
                size: $(childs[2]).text(),
                url: new URL(downloadURL, 'https://twsaver.com').href,
            })
        });

        return BASE_OBJECT;
    } catch (error) {
        throw Error(error);
    }
};

const createRedditObjet = async (html) => {
    try {
        const dom = htmlparser2.parseDocument(html);
        const $ = cheerio.load(dom);
        const tableRows = $('.table tbody').children('tr').toArray();
        tableRows.shift();

        BASE_OBJECT.title = $('h2').first().text().replace('“', '').replace('”', '').trim();
        BASE_OBJECT.owner = $(tableRows[1]).children('td').last().text().trim();
        BASE_OBJECT.thumbnail = $('img.center-block').first().attr('src');
        // BASE_OBJECT.permalink = $(tableRows[2]).children('td').last().children('a').first().attr('href').trim();
        BASE_OBJECT.audio = `https://redditsave.com${$('a:contains("save audio")').first().attr('href')}`;

        BASE_OBJECT.videos.push({
            quality: '720p (mp4)',
            format: 'mp4',
            size: $(tableRows[3]).children('td').last().text().trim(),
            url: $('.downloadbutton').first().attr('href').trim()
        });

        BASE_OBJECT.videos.push(...await getRedditSDDownloadUrls(`https://redditsave.com${$('.downloadbutton').last().attr('href').trim()}`));

        return BASE_OBJECT;
    } catch (error) {
        throw Error(error);
    }
};

const getRedditSDDownloadUrls = async (sdUrl) => {
    try {
        let videos = [];
        const { data } = await axios.get(sdUrl);

        const dom = htmlparser2.parseDocument(data);
        const $ = cheerio.load(dom);
        const tableRows = $('.table tbody').children('tr').toArray();

        tableRows.forEach(row => {
            const childs = $(row).children().toArray();
            videos.push({
                quality: $(childs[0]).text().trim(),
                format: 'mp4',
                size: null,
                url: $(childs[1]).children('a').attr('href').trim()
            });
        });

        return videos;
    } catch (error) {
        throw Error(error);
    }
};

module.exports = {
    createYouTubeObject,
    createTwitterObject,
    createRedditObjet
}