const axios = require('axios');
const htmlparser2 = require('htmlparser2');
const cheerio = require('cheerio');

const downloadFromReddit = async (url) => {
    const rs = `https://redditsave.com/info?url=${url}`;
    let info = {};

    const { data } = await axios.get(encodeURI(rs));

    const dom = htmlparser2.parseDocument(data);
    const $ = cheerio.load(dom);
    const tableRows = $('.table tbody').children('tr').toArray();
    tableRows.shift();

    info.source = $(tableRows[0]).children('td').last().text().trim();
    info.subreddit = $(tableRows[1]).children('td').last().text().trim();
    info.permalink = $(tableRows[2]).children('td').last().children('a').first().attr('href').trim();
    info.file_size = $(tableRows[3]).children('td').last().text().trim();

    info.downloads = {
        audio: `https://redditsave.com${$('a:contains("save audio")').first().attr('href')}`,
        hd: $('.downloadbutton').first().attr('href').trim(),
        sd: await getSDDownloadUrls(`https://redditsave.com${$('.downloadbutton').last().attr('href').trim()}`)
    };

    return info;
};

const getSDDownloadUrls = async (sdUrl) => {
    let sdData = {
        url: sdUrl,
        formats: []
    };
    const { data } = await axios.get(sdUrl);

    const dom = htmlparser2.parseDocument(data);
    const $ = cheerio.load(dom);
    const tableRows = $('.table tbody').children('tr').toArray();

    tableRows.forEach(row => {
        const childs = $(row).children().toArray();
        sdData.formats.push({
            quality: $(childs[0]).text().trim(),
            url: $(childs[1]).children('a').attr('href').trim()
        });
    });

    return sdData;
};

module.exports = downloadFromReddit;