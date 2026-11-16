/**
 * Seed script - run with: node utils/seedData.js
 * Creates sample categories, foods, and an admin user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Food = require('../models/Food');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Category.deleteMany({});
  await Food.deleteMany({});

  // Create admin user
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@foodiehub.com',
    phone: '01700000000',
    password: 'admin123',
    role: 'admin',
  });
  console.log('Admin created:', admin.email);

  // Create categories
  const categories = await Category.insertMany([
    { name: 'Burger', description: 'Juicy grilled burgers', image: '' },
    { name: 'Pizza', description: 'Wood-fired pizzas', image: '' },
    { name: 'Pasta', description: 'Italian pasta dishes', image: '' },
    { name: 'Salads', description: 'Fresh healthy salads', image: '' },
    { name: 'Drinks', description: 'Refreshing beverages', image: '' },
    { name: 'Desserts', description: 'Sweet treats', image: '' },
  ]);
  console.log('Categories created');

  const [burger, pizza, pasta, salad, drink, dessert] = categories;

  // Create food items
  await Food.insertMany([
    {
      name: 'Classic Beef Burger',
      description: 'Juicy beef patty with lettuce, tomato, cheese, and our special sauce in a brioche bun.',
      price: 250,
      category: burger._id,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      available: true,
    },
    {
      name: 'BBQ Chicken Burger',
      description: 'Grilled chicken with smoky BBQ sauce, caramelized onions, and coleslaw.',
      price: 220,
      category: burger._id,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
      available: true,
    },
    {
      name: 'Margherita Pizza',
      description: 'Classic tomato base with fresh mozzarella, basil leaves, and olive oil.',
      price: 320,
      category: pizza._id,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      available: true,
    },
    {
      name: 'Pepperoni Pizza',
      description: 'Loaded with premium pepperoni slices, mozzarella, and zesty tomato sauce.',
      price: 380,
      category: pizza._id,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
      available: true,
    },
    {
      name: 'Chicken Alfredo Pasta',
      description: 'Creamy Alfredo sauce with grilled chicken strips, parmesan, and fettuccine.',
      price: 280,
      category: pasta._id,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      available: true,
    },
    {
      name: 'Spaghetti Bolognese',
      description: 'Rich minced meat sauce slow-cooked with tomatoes and herbs over spaghetti.',
      price: 260,
      category: pasta._id,
      image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400',
      available: true,
    },
    {
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan shavings.',
      price: 180,
      category: salad._id,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      available: true,
    },
    {
      name: 'Mango Smoothie',
      description: 'Fresh mango blended with yogurt and a hint of honey. Chilled and refreshing.',
      price: 120,
      category: drink._id,
      image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
      available: true,
    },
    {
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.',
      price: 160,
      category: dessert._id,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      available: true,
    },
    {
      name: 'Double Cheese Burger',
      description: 'Two beef patties, double cheese, pickles, onions, and signature burger sauce.',
      price: 300,
      category: burger._id,
      image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400',
      available: true,
    },
    {
      name: 'Greek Salad',
      description: 'Crisp cucumbers, cherry tomatoes, olives, red onion, and feta cheese with herb dressing.',
      price: 200,
      category: salad._id,
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      available: true,
    },
    {
      name: 'Strawberry Cheesecake',
      description: 'Creamy New York-style cheesecake on a buttery graham cracker crust topped with fresh strawberries.',
      price: 180,
      category: dessert._id,
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
      available: true,
    },
  ]);
  console.log('Food items created');

  console.log('\n✅ Seed complete!');
  console.log('Admin login: admin@foodiehub.com / admin123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
