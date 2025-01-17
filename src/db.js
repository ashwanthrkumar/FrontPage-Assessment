const mysql = require('mysql2');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'hacker_news',
});

// Insert a story into the database
const insertStory = (story) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT IGNORE INTO stories (id, title, url) VALUES (?, ?, ?)';
        connection.query(query, [story.id, story.title, story.url], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};

// Get stories created in the last 5 minutes
const getRecentStories = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM stories WHERE created_at > NOW() - INTERVAL 5 MINUTE';
        connection.query(query, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};

// Close MySQL connection
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
