import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';


dotenv.config();


const app = express();


const corsOptions = {
  origin:["https://doomswear.vercel.app","http://localhost:5173"],
  optionsSuccessStatus: 200, 
  Credentials : true
};

app.use(cors(corsOptions));
app.use(express.json());


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-flow';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Nothing interesting here peeps' });
});
app.get('/api', (req, res) => {
  res.json({ message: 'API UP AND WELL' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});