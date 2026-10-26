import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aIRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Selectively parse JSON or Raw buffer depending on route (required for Stripe Webhook)
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') {
        express.raw({ type: 'application/json' })(req, res, next);
    } else {
        express.json()(req, res, next);
    }
});

app.use(cors());

// Connect Database
connectDB();

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => res.send("Server is live........."));

app.listen(PORT, () => {
    console.log(`Server running at the port ${PORT}`);
});

export default app;