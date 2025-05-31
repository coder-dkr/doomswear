type transaction = {
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  orderId: string;
  createdAt: Date;
}

export type User = {
  _id: string;
  name: string;
  email: string;
  wallet : number;
  transactions : transaction[]
};

type ColorOption = {
  name: string;
  value: string;
  colorClass: string;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  highlights: string[];
  colors: ColorOption[];
  sizes: string[];
  tags: string[];
  inventory: number;
};
