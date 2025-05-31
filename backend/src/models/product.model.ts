import { Schema, model, Document } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be at least 0'],
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    highlights: {
      type: [String],
      required: true
    },
    colors: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          value: {
            type: String,
            required: true,
            match: /^#[0-9A-F]{6}$/i,
          },
          colorClass: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
      validate: {
        validator: (colors: Array<any>) => colors.length > 0,
      },
    },
    sizes: {
      type: [String],
      required: true,
      validate: {
        validator: (sizes: string[]) => sizes.length > 0,
        message: 'At least one size is required',
      },
    },
    tags: {
      type: [String],
      required: true,
    },
    inventory: {
      type: Number,
      required: true,
      min: [0, 'Inventory cannot be negative'],
    },
  },
  {
    timestamps: true, 
  }
);


ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });


const Product = model('Product', ProductSchema);

export default Product;