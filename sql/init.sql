-- Create the database
CREATE DATABASE IF NOT EXISTS hacker_news;

-- Switch to the newly created database
USE hacker_news;

-- Create the stories table
CREATE TABLE IF NOT EXISTS stories (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
