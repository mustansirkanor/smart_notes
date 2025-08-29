import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // ✅ Add this import

// ✅ Your existing routes
import topicRoutes from './routes/topicRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import studyRoutes from './routes/studyRoutes.js'; // ✅ New route

dotenv.config();

// ✅ Replace connectDB() with direct connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartnotes';
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected to: ${mongoURI}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
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
