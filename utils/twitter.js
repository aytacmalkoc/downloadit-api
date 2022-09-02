const axios = require('axios');
const htmlparser2 = require('htmlparser2');
const cheerio = require('cheerio');
const FormData = require('form-data');

const downloadFromTwitter = async (url) => {
    let info = [];
    
    const form = new FormData();
    form.append('url', url);
    form.append('action', 'post');

    const { data } = await axios.post('https://twsaver.com/twitter-video-downloader.php', form);

    const dom = htmlparser2.parseDocument(data);
    const $ = cheerio.load(dom);
    const options = $('.table tbody').children('tr').toArray();

    options.forEach(option => {
        const childs = $(option).children().toArray();
        const downloadURL = $(childs[3]).children('p').first().children('a').first().attr('href');

        info.push({
            quality: $(childs[0]).text(),
            format: $(childs[1]).text(),
            size: $(childs[2]).text(),
            download: new URL(downloadURL, 'https://twsaver.com').href,
        })
    })

    return info;
};

module.exports = downloadFromTwitter;