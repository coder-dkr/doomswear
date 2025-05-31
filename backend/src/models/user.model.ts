import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface ITransaction extends mongoose.Document {
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  orderId: mongoose.Types.ObjectId;
  createdAt: Date;
}


interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  wallet: number;
  transactions: ITransaction[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['debit', 'credit']
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  wallet : {
    type : Number,
    required: true,
    default: 2000
  },
  transactions: {
    type: [transactionSchema],
    default: [] 
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  const user = this as unknown as IUser;

  if (!user.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;