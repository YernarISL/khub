import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './db.js';
import cors from 'cors';
import router from './routers/index.js';
import express from 'express';
import session from 'express-session';
import errorHandler from './middleware/ErrorHandlingMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", 
        httpOnly: true
    },
}))

app.use('/api', router)
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
app.use(errorHandler)

const startServer = async () => { 
    try {
        await sequelize.authenticate()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}

startServer()