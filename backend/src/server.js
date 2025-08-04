import express from 'express';
import connectDB from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const app = express();

connectDB();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});