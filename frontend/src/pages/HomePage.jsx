import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaTruck, FaStar, FaShieldAlt, FaClock, FaLeaf } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';
import { getFoods } from '../services/foodService';
import { getCategories } from '../services/categoryService';
import FoodCard from '../components/FoodCard';
import './HomePage.css';

const TESTIMONIALS = [
  { name: 'Rahim Ahmed', rating: 5, text: 'Amazing food quality and super fast delivery! FoodieHub is my go-to for every meal.', avatar: 'R' },
  { name: 'Fatima Khan', rating: 5, text: 'I love the variety of food options. The burgers are absolutely delicious!', avatar: 'F' },
  { name: 'Kabir Hossain', rating: 4, text: 'Great experience overall. The app is easy to use and food is always fresh.', avatar: 'K' },
];

const WHY_US = [
  { icon: <FaTruck />, title: 'Fast Delivery', desc: 'Get your food delivered within 30-45 minutes, hot and fresh.' },
  { icon: <FaLeaf />, title: 'Fresh Ingredients', desc: 'We use only the freshest, highest quality ingredients in every dish.' },
  { icon: <FaShieldAlt />, title: 'Safe & Hygienic', desc: 'Our kitchen meets the highest hygiene and safety standards.' },
  { icon: <FaClock />, title: 'Open All Day', desc: "Order anytime — we're open from 8AM to midnight, every day." },
];

const HomePage = () => {
  const [popularFoods, setPopularFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsRes, catsRes] = await Promise.all([getFoods(), getCategories()]);
        setPopularFoods(foodsRes.data.foods.slice(0, 8));
        setCategories(catsRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="home-page">
      {/* ===== Hero Section ===== */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-tag"><MdRestaurantMenu /> Fresh & Delicious</span>
            <h1>Delicious Food,<br />Delivered <span>Fresh</span> to Your Door</h1>
            <p>
              Explore hundreds of mouth-watering dishes from our kitchen. Order online
              and get hot, fresh food delivered right to your doorstep.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Explore Menu <FaArrowRight />
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">Learn More</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><strong>500+</strong><span>Menu Items</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>10k+</strong><span>Happy Customers</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>4.8★</strong><span>Rating</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      {categories.length > 0 && (
        <section className="section-padding categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Browse by <span>Category</span></h2>
              <p className="section-subtitle">Find exactly what you're craving</p>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link to={`/menu?category=${cat._id}`} key={cat._id} className="category-chip">
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Popular Foods ===== */}
      <section className="section-padding popular-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular <span>Food Items</span></h2>
            <p className="section-subtitle">Our customers' most loved dishes</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading food items...</p>
            </div>
          ) : (
            <>
              <div className="food-grid">
                {popularFoods.map((food) => (
                  <FoodCard key={food._id} food={food} />
                ))}
              </div>
              <div className="view-all-wrap">
                <Link to="/menu" className="btn btn-outline">
                  View Full Menu <FaArrowRight />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== Why Choose Us ===== */}
      <section className="section-padding why-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose <span>FoodieHub?</span></h2>
            <p className="section-subtitle">We're committed to giving you the best food experience</p>
          </div>
          <div className="grid-4">
            {WHY_US.map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="section-padding testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our <span>Customers Say</span></h2>
            <p className="section-subtitle">Real reviews from happy foodies</p>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="test-stars">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <FaStar key={s} />
                  ))}
                </div>
                <p>"{t.text}"</p>
                <div className="test-author">
                  <div className="test-avatar">{t.avatar}</div>
                  <span>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Newsletter ===== */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-inner">
            <h2>Stay Updated with <span>Special Offers</span></h2>
            <p>Subscribe to get exclusive deals, new menu updates, and more.</p>
            {subscribed ? (
              <div className="alert alert-success" style={{ maxWidth: 400, margin: '0 auto' }}>
                🎉 Thanks for subscribing! Check your email for offers.
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control"
                />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
