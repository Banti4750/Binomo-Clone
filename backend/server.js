import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/controllers/authControlre.js';
import userRoutes from './src/controllers/userControler.js';
dotenv.config();
import('./src/config/db.js')

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Use auth routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});