// server.js
const express = require('express');
const mariadb = require('mariadb');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 80;

// Create a MariaDB connection pool
const pool = mariadb.createPool({
host: '127.0.0.1', // Use IP address to force TCP connection
port: 3306, // Ensure this is the correct port user: 'your_username', // Replace with your MariaDB
user: 'jeremiahlin',
password: 'password', // Replace with your MariaDB password
database: 'bankdb', // Our database name created above
connectionLimit: 5
});
// Set EJS as the view engine and set the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Use body-parser middleware to parse form data (if you prefer explicit usage)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
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

app.post('/register', async (req, res) => {
    const { username, tag } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users(username) VALUES (?)', [username]);
        if (!tag) {
            await axios.post('http://35.239.45.67:80/register', {username: username, tag: true});
        }
        res.status(201).send('passed.');
    } catch (err) {
        res.status(500).send(`reg error`);
    } finally {
        if (conn) conn.release();
    }
})

// app.post('/reg', async (req, res) => {
//     const { entry } = req.body;
//     const test = JSON.parse(entry);
//     const username = test.username;
//     try {
//         const conn = await pool.getConnection();
//         await conn.query('INSERT INTO Users (username) VALUES (?)', [username]);
//         conn.release();
//         res.status(201).json({ message: 'User registered' });
//     } catch (err) {
//         res.status(500).json({ error: 'Database error' });
//     }
// });

app.get('/list', async (req, res) => {
        let conn;
        try {
        conn = await pool.getConnection();
        const users = await conn.query('SELECT * FROM Users');
        const names = users.map(user=> user.username);
        res.json({users: names});
        } finally {
            if (conn) conn.release();
        }
    });
//clear
// app.post('/clear', async (req, res) => {
//     try {
//         const conn = await pool.getConnection();
//         await conn.query('DELETE FROM Users');
//         conn.release();
//         res.json({ message: 'clear pass' });
//     } catch (err) {
//         res.status(500).json({ error: 'fucked' });
//     }
// });

app.post('/clear', async (req, res) => {
    const { tag } = req.body;
    let conn;
    try{
        conn = await pool.getConnection();
        await conn.query('DELETE FROM Users');
        if(!tag) {
            const serverRep = [
                'http://34.28.70.245:80',
            ];
            const promises = serverRep.map(repl => axios.post(`${repl}/clear`, { tag: true}));
            await Promise.all(promises);
        }
        res.status(200).json({ message: 'cleared'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'broken clear' });
    } finally {
        if (conn) conn.release();
    }
})

const setup = async () => {
    let reqExip = await axios.get('http://ifconfig.me');
    let exip = reqExip.data;
    app.listen(port, () => {
        console.log(`http://${exip}:${port}`);
    });
}
// Route: Add a new customer


setup();