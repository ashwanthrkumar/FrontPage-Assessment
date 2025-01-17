const axios = require('axios');
const cheerio = require('cheerio');

const scrapeStories = async () => {
    console.log('Starting to scrape Hacker News...');
    const response = await axios.get('https://news.ycombinator.com/');
    const $ = cheerio.load(response.data);
    let stories = [];

    $('.athing.submission').each((index, element) => {
        const id = $(element).attr('id');  // Story ID
        const title = $(element).find('.titleline a').text();  // Story Title
        const url = $(element).find('.titleline a').attr('href');  // Story URL

        console.log(`ID: ${id}, Title: ${title}, URL: ${url}`);

        if (title && url) {
            stories.push({ id, title, url });
        }
    });

    return stories;
};

module.exports = { scrapeStories };
