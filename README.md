# Hacker News Scraper

This project is a **Hacker News Scraper** that fetches the latest stories from Hacker News, stores them in a MySQL database, and serves them to clients through a WebSocket connection. Additionally, a frontend displays these stories in real-time.

## Project Structure

```
ashwanthrkumar-frontpage-assessment/
├── package.json
├── public/
│   └── index.html
├── sql/
│   └── init.sql
└── src/
    ├── db.js
    ├── index.js
    └── scraper.js
```

### File Descriptions

- **`package.json`**: Contains project metadata and dependencies.
- **`public/index.html`**: The frontend interface for displaying stories.
- **`sql/init.sql`**: SQL script for setting up the database.
- **`src/db.js`**: Handles database interactions (inserting and fetching stories).
- **`src/index.js`**: The server logic for managing WebSocket connections and periodic story scraping.
- **`src/scraper.js`**: Contains the logic to scrape Hacker News stories using Axios and Cheerio.

## Prerequisites

- Node.js (v14+)
- MySQL (configured and running)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/ashwanthrkumar/FrontPage-Assessment.git
cd FrontPage-Assessment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up the Database
1. Open your MySQL client.
2. Run the SQL script to create the database and table:
   ```sql
   source sql/init.sql;
   ```
[ I personally would use this below method
```bash
mysql -u root -p < sql/init.sql
```
Above should be executed inside "cd FrontPage-Assessment" ]

3. Update database credentials in `src/db.js` and `src/index.js` if needed:
   ```javascript
   const connection = mysql.createConnection({
       host: 'localhost',
       user: 'root', // Replace with your MySQL username
       password: '', // Replace with your MySQL password
       database: 'hacker_news',
   });
   ```

### 4. Start the Server
```bash
node src/index.js
```
The frontend will be available at [http://localhost:3000](http://localhost:3000).

### 5. WebSocket Server
The WebSocket server runs on port `8080` to push real-time updates to connected clients.

## How It Works

1. **Scraping Stories**: The `scraper.js` fetches the latest stories from Hacker News every 5 minutes using the `setInterval` function.
2. **Database Storage**: Stories are stored in the `stories` table. Duplicate entries are avoided using the `INSERT IGNORE` query.
3. **Real-Time Updates**:
   - When a client connects, they receive all stories created in the last 5 minutes.
   - New stories are broadcast to all connected clients.
4. **Frontend Display**: The frontend fetches real-time updates via WebSocket and displays the stories.


## Project Dependencies

- **Node.js Modules**:
  - `axios`: For HTTP requests to fetch Hacker News content.
  - `cheerio`: For parsing and extracting data from HTML.
  - `express`: To serve the static frontend files.
  - `mysql2`: For database interactions.
  - `ws`: For WebSocket communication.



