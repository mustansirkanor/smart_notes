import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // ✅ Add this import
import authRoutes from './routes/authRoutes.js';

// ✅ Your existing routes
import topicRoutes from './routes/topicRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import studyRoutes from './routes/studyRoutes.js'; // ✅ New route

dotenv.config();

// ✅ Replace connectDB() with direct connection
const connectDB = async () => {
 mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
};

// ✅ Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Your existing routes
app.use('/api/topics', topicRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
// ✅ NEW: Add this new route
app.use('/api/study', studyRoutes);

// ✅ Enhanced health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Enhanced Smart Notes API is running',
    features: [
      'AI Assistant',
      'Voice Integration', 
      'Study Analytics',
      'Flashcard Generation',
      'Multi-language Support'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Smart Notes server running on port ${PORT}`);
  console.log(`🎯 Available features: AI, Voice, Analytics, Flashcards`);
});

export default app;
