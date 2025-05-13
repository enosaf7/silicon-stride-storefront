
import { Product, Review } from '../utils/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Executive Oxford Classic',
    category: 'shoes',
    price: 199.99,
    images: [
      'https://images.unsplash.com/photo-1560343090-f0409e92791a',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4'
    ],
    description: 'Our flagship executive oxford shoes featuring advanced silicon cushioning for maximum comfort and professional style. Perfect for business meetings and formal events.',
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ['#000000', '#5C4033', '#8B4513'],
    stock: 50,
    featured: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Italian Leather Derby',
    category: 'shoes',
    price: 239.99,
    images: [
      'https://images.unsplash.com/photo-1543665545-a5a845c3e2dc',
      'https://images.unsplash.com/photo-1531310197839-ccf54634509e'
    ],
    description: 'Premium Italian leather derby shoes with silicon-infused memory foam for the ultimate comfort. Your feet deserve this luxury for long business days.',
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ['#000000', '#5C4033', '#964B00'],
    stock: 75,
    featured: true,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Formal Wing-tip Brogue',
    category: 'shoes',
    price: 259.99,
    images: [
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1',
      'https://images.unsplash.com/photo-1678732841792-159fb692854b'
    ],
    description: 'Elegant and sophisticated brogue shoes with silicon-reinforced soles for superior comfort and durability. Perfect for weddings and special occasions.',
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ['#000000', '#964B00'],
    stock: 30,
    newArrival: true,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Business Loafer Pro',
    category: 'shoes',
    price: 189.99,
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509',
      'https://images.unsplash.com/photo-1561997847-77a236bd864f'
    ],
    description: 'Lightweight and flexible business loafers designed for comfort during long workdays. Features our patented Silicon Flex technology.',
    sizes: [7, 8, 9, 10, 11],
    colors: ['#000000', '#964B00', '#8B4513'],
    stock: 40,
    newArrival: true,
    discount: 15,
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Premium Monk Strap',
    category: 'shoes',
    price: 219.99,
    images: [
      'https://images.unsplash.com/photo-1613592743574-3447394077dd',
      'https://images.unsplash.com/photo-1614252235429-a05507e8118b'
    ],
    description: 'Distinguished monk strap shoes with silicon cushioned footbed. Perfect for making a statement in the boardroom.',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    colors: ['#000000', '#5C4033', '#8B4513', '#FFFFFF'],
    stock: 60,
    featured: true,
    rating: 4.5,
  },
  {
    id: '6',
    name: 'Executive Comfort Oxfords',
    category: 'shoes',
    price: 249.99,
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
