const WebSocket = require('ws');
const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const { scrapeStories } = require('./scraper');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hacker_news',
});

// Ensure the database connection is established
db.connect((err) => {
    if (err) {
        console.error('Failed to connect to MySQL:', err);
        process.exit(1);
    } else {
        console.log('Connected to MySQL database.');
    }
});

// Set up Express server to serve static files
const app = express();
app.use(express.static(path.join(__dirname, '../public')));

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Track sent stories per client
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.sentStories = new Set();

    // Send initial stories
    sendRecentStories(ws);

    ws.on('close', () => console.log('Client disconnected'));
    ws.on('error', (err) => console.error('WebSocket error:', err));
});

// Fetch and send recent stories to a specific client
const sendRecentStories = async (ws) => {
    try {
        const [recentStories] = await db.promise().query(
            'SELECT * FROM stories WHERE created_at > NOW() - INTERVAL 5 MINUTE'
        );
        if (recentStories.length > 0) {
            ws.send(JSON.stringify({ type: 'initial', stories: recentStories }));
            recentStories.forEach((story) => ws.sentStories.add(story.id));
        }
    } catch (err) {
        console.error('Error sending recent stories:', err);
    }
};

// Scrape, save, and broadcast stories
const broadcastStories = async () => {
    try {
        const stories = await scrapeStories();

        for (const story of stories) {
            await db.promise().execute(
                'INSERT IGNORE INTO stories (id, title, url) VALUES (?, ?, ?)',
                [story.id, story.title, story.url]
            );
        }

        const newStories = stories.filter((story) => {
            // Check if this story is new for all clients
            return [...wss.clients].every(
                (client) => !client.sentStories.has(story.id)
            );
        });

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && newStories.length > 0) {
                client.send(
                    JSON.stringify({ type: 'new', stories: newStories })
                );
                newStories.forEach((story) => client.sentStories.add(story.id));
            }
        });
    } catch (error) {
        console.error('Error in broadcastStories:', error);
    }
};

// Periodically scrape and broadcast stories
setInterval(broadcastStories, 60000); // Scrape and broadcast every minute

// Start the Express server
app.listen(3000, () => {
    console.log('Frontend server started on http://localhost:3000');
});
