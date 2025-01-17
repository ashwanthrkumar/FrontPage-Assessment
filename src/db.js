const mysql = require('mysql2');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Replace with your MySQL username
    password: '',  // Replace with your MySQL password
    database: 'hacker_news'
});

// Insert a story into the database
const insertStory = (story) => {
    return new Promise((resolve, reject) => {
        // Check if the story already exists in the database by its ID
        const checkQuery = 'SELECT * FROM stories WHERE id = ?';
        connection.query(checkQuery, [story.id], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length > 0) {
                // Story already exists, so we don't insert it again
                console.log(`Story with ID ${story.id} already exists.`);
                resolve();
                return;
            }

            // Insert the story if it doesn't exist
            const query = 'INSERT INTO stories (id, title, url) VALUES (?, ?, ?)';
            connection.query(query, [story.id, story.title, story.url], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`Inserted story with ID ${story.id}`);
                resolve(results);
            });
        });
    });
};

// Get stories created in the last 5 minutes
const getRecentStories = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM stories WHERE created_at > NOW() - INTERVAL 5 MINUTE`;
        connection.query(query, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};

// Close MySQL connection (optional, can be called when done)
const closeConnection = () => {
    connection.end((err) => {
        if (err) {
            console.error('Error closing connection:', err);
        } else {
            console.log('Connection closed.');
        }
    });
};

module.exports = { insertStory, getRecentStories, closeConnection };
