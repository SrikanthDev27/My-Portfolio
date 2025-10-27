const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🔧 Connecting to MongoDB Atlas...');

// MongoDB Connection with SSL options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      tls: true
    });
    console.log('✅ MongoDB Atlas Connected Successfully!');
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
    console.log('💡 Trying without SSL...');
    
    // Try without SSL
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: false
      });
      console.log('✅ Connected without SSL!');
    } catch (error2) {
      console.log('❌ Both connection attempts failed');
    }
  }
};

connectDB();

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Contact Route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database not connected' 
      });
    }

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    
    console.log('✅ Contact saved to MongoDB');
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });
  } catch (error) {
    console.error('❌ Error saving contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending message' 
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    dbConnected: mongoose.connection.readyState === 1
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});