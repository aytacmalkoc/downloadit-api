const ytdl = require('ytdl-core');

const downloadFromYouTube = async (url) => {
    try {
        const video = await ytdl.getInfo(url);

        video.formats = video.formats.filter((format) => format.container === 'mp4');

        const details = video.videoDetails;

        return {
            title: details.title,
            owner: details.ownerChannelName,
            description: details.description,
            viewCount: details.viewCount,
            category: details.category,
            thumbnails: details.thumbnails,
            formats: video.formats,
            videoLength: details.lengthSeconds,
            videoLengthReadable: fancyTimeFormat(details.lengthSeconds)
        }
    } catch (error) {
        throw new Error(error);
    }
};

// https://stackoverflow.com/a/11486026/12733576
const fancyTimeFormat = (duration) => {   
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    let ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
}

module.exports = downloadFromYouTube;