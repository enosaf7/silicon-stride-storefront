
import { Product, Review } from '../utils/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Silicon Runner Pro',
    category: 'shoes',
    price: 129.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5'
    ],
    description: 'Our flagship running shoe featuring advanced silicon cushioning for maximum comfort and performance. Perfect for long-distance runners and everyday athletes.',
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ['#000000', '#FFFFFF', '#F97316'],
    stock: 50,
    featured: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Comfort Step Slippers',
    category: 'slippers',
    price: 49.99,
    images: [
      'https://images.unsplash.com/photo-1631624215749-b10b3dd7bca7',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa'
    ],
    description: 'Premium home slippers with silicon-infused memory foam for the ultimate comfort. Your feet deserve this luxury after a long day.',
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ['#000000', '#F97316', '#964B00'],
    stock: 75,
    featured: true,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Urban Trek Boots',
    category: 'boots',
    price: 159.99,
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0',
      'https://images.unsplash.com/photo-1605812860427-4024433a70fd'
    ],
    description: 'Rugged and stylish boots with silicon-reinforced soles for superior grip and durability. Perfect for urban adventures and light hiking.',
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ['#000000', '#964B00'],
    stock: 30,
    newArrival: true,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Silicon Flex Sport',
    category: 'shoes',
    price: 119.99,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3'
    ],
    description: 'Lightweight and flexible sports shoes designed for intense training and gym sessions. Features our patented Silicon Flex technology.',
    sizes: [7, 8, 9, 10, 11],
    colors: ['#000000', '#F97316', '#3B82F6'],
    stock: 40,
    newArrival: true,
    discount: 15,
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Beach Comfort Sandals',
    category: 'sandals',
    price: 59.99,
    images: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306',
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33'
    ],
    description: 'Waterproof sandals with silicon straps and cushioned footbed. Perfect for beach days and summer adventures.',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    colors: ['#000000', '#F97316', '#3B82F6', '#FFFFFF'],
    stock: 60,
    featured: true,
    rating: 4.5,
  },
  {
    id: '6',
    name: 'Business Comfort Oxfords',
    category: 'shoes',
    price: 149.99,
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4',
      'https://images.unsplash.com/photo-1609188076864-c35269136b09'
    ],
    description: 'Professional look meets unmatched comfort with our silicon-cushioned oxford shoes. Perfect for long days at the office.',
    sizes: [8, 9, 10, 11, 12],
    colors: ['#000000', '#964B00'],
    stock: 25,
    rating: 4.7,
  },
];

export const reviews: Review[] = [
  {
    id: '1',
    user_id: 'user1',
    username: 'John D.',
    product_id: '1',
    rating: 5,
    comment: 'These are the most comfortable running shoes I\'ve ever owned! The silicon cushioning makes a huge difference on long runs.',
    date: '2023-04-15'
  },
  {
    id: '2',
    user_id: 'user2',
    username: 'Sarah M.',
    product_id: '1',
    rating: 4,
    comment: 'Great shoes! Very comfortable and stylish. I took off one star because they run slightly small.',
    date: '2023-03-28'
  },
  {
    id: '3',
    user_id: 'user3',
    username: 'Michael T.',
    product_id: '2',
    rating: 5,
    comment: 'These slippers are amazing! Like walking on clouds. Worth every penny.',
    date: '2023-05-02'
  },
  {
    id: '4',
    user_id: 'user4',
    username: 'Lisa R.',
    product_id: '5',
    rating: 5,
    comment: 'Perfect beach sandals. Comfortable, waterproof, and they look great!',
    date: '2023-02-14'
  },
  {
    id: '5',
    user_id: 'user5',
    username: 'James K.',
    product_id: '3',
    rating: 4,
    comment: 'Solid boots for city walking. Not quite rugged enough for serious hiking but perfect for daily wear.',
    date: '2023-01-30'
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
}

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
}

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
}

export const getNewArrivals = (): Product[] => {
  return products.filter(product => product.newArrival);
}

export const getProductReviews = (productId: string): Review[] => {
  return reviews.filter(review => review.product_id === productId);
}
