import express from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/product.model';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const products = await Product.find({});
    
    res.status(200).json(
      products
    );
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;