const WebSocket = require('ws');
const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const { scrapeStories } = require('./scraper'); // Import scraper function

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

// Helper function to insert stories into MySQL
const insertStoriesIntoDb = async (stories) => {
    for (const story of stories) {
        const { id, title, url } = story;
        const query = `
            INSERT IGNORE INTO stories (id, title, url)
            VALUES (?, ?, ?)
        `;

        // Execute query to insert story
        db.execute(query, [id, title, url], (err) => {
            if (err) {
                console.error(`Error inserting story with ID ${id} into DB:`, err);
            }
        });
    }
};

// Broadcast stories to a WebSocket client
const sendStoriesToClient = (ws, stories) => {
    const payload = {
        type: 'initial', // Message type for initial stories
        stories,
    };
    ws.send(JSON.stringify(payload), (err) => {
        if (err) {
            console.error('Error sending stories to client:', err);
        }
    });
};

// Scrape, save, and broadcast stories
const broadcastStories = async () => {
    try {
        const stories = await scrapeStories(); // Scrape stories
        await insertStoriesIntoDb(stories);   // Save stories to the database

        // Broadcast stories to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                sendStoriesToClient(client, stories);
            }
        });
    } catch (error) {
        console.error('Error in broadcastStories:', error);
    }
};

// Periodically scrape and broadcast stories
setInterval(broadcastStories, 60000); // Scrape and broadcast every minute

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send initial stories immediately upon connection
    scrapeStories()
        .then((stories) => {
            sendStoriesToClient(ws, stories); // Send initial stories
            insertStoriesIntoDb(stories);     // Save to DB
        })
        .catch((err) => console.error('Error fetching initial stories:', err));

    ws.on('message', (message) => {
        console.log('Received message from client:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

console.log('WebSocket server started on ws://localhost:8080');

// Start the Express server
app.listen(3000, () => {
    console.log('Frontend server started on http://localhost:3000');
});
