// server.js
const express = require('express');
const mariadb = require('mariadb');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 80;

// Create a MariaDB connection pool
const pool = mariadb.createPool({
host: '127.0.0.1', // Use IP address to force TCP connection
port: 3306, // Ensure this is the correct port user: 'your_username', // Replace with your MariaDB
user: 'jeremiahlin',
password: 'password', // Replace with your MariaDB password
database: 'hw', // Our database name created above
connectionLimit: 5
});
// Set EJS as the view engine and set the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Use body-parser middleware to parse form data (if you prefer explicit usage)
app.use(bodyParser.urlencoded({ extended: true }));
// Alternatively, you can use Express's built-in parsing:
// app.use(express.urlencoded({ extended: true }));
// Route: Display form and customer table


app.get('/', async (req, res) => {
let conn;
try {
conn = await pool.getConnection();
// Get all customers from the table
const users = await conn.query('SELECT * FROM Users');
res.render('index', { users });
} catch (err) {
res.status(500).send(`Error retrieving Users: ${err}`);
} finally {
if (conn) conn.release();
}
});

//greeting
app.get('/greeting', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});

//regisger
app.post('/register', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    try {
        const conn = await pool.getConnection();
        await conn.query('INSERT INTO Users (username) VALUES (?)', [username]);
        conn.release();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});
//list
app.get('/list', async (req, res) => {
    let conn;
    try {
    conn = await pool.getConnection();
    // Get all customers from the table
    const users = await conn.query('SELECT * FROM Users');
    res.render('index', { users });
    } catch (err) {
    res.status(500).send(`Error retrieving Users: ${err}`);
    } finally {
    if (conn) conn.release();
    }
});

//clear
app.post('/clear', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        await conn.query('DELETE FROM Users');
        conn.release();
        res.json({ message: 'clear pass' });
    } catch (err) {
        res.status(500).json({ error: 'fucked' });
    }
});


// Route: Add a new customer
app.listen(port, () => {
    console.log(`Server is running on http://<external ip>:${port}`);
   });