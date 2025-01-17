const axios = require('axios');
const cheerio = require('cheerio');

const scrapeStories = async () => {
    console.log('Starting to scrape Hacker News...');
    const response = await axios.get('https://news.ycombinator.com/');
    const $ = cheerio.load(response.data);
    const stories = [];

    $('.athing').each((_, element) => {
        const id = $(element).attr('id'); // Story ID
        const title = $(element).find('.titleline a').text().trim(); // Story Title
        const url = $(element).find('.titleline a').attr('href'); // Story URL

        if (id && title && url) {
            stories.push({ id, title, url });
        }
    });

    return stories;
};

module.exports = { scrapeStories };
