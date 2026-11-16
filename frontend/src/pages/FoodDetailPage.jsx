import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaMinus, FaPlus, FaArrowLeft, FaStar } from 'react-icons/fa';
import { getFoodById } from '../services/foodService';
import { useCart } from '../context/CartContext';
import './FoodDetailPage.css';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const FoodDetailPage = () => {
  const { id } = useParams();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const cartItem = cartItems.find((i) => i._id === id);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await getFoodById(id);
        setFood(res.data.food);
      } catch (err) {
        setError('Food item not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  const handleAddToCart = () => {
    addToCart({ ...food, quantity: 1 });
    if (qty > 1) updateQuantity(food._id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="loading-container" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
      <p>Loading food details...</p>
    </div>
  );

  if (error) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div className="empty-state-icon">😕</div>
      <h3>{error}</h3>
      <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
    </div>
  );

  if (!food) return null;

  const imageUrl = food.image?.startsWith('http')
    ? food.image
    : food.image
    ? `${API_URL}${food.image}`
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

  return (
    <div className="food-detail-page">
      <div className="container">
        <Link to="/menu" className="back-link">
          <FaArrowLeft /> Back to Menu
        </Link>

        <div className="food-detail-grid">
          {/* Image */}
          <div className="food-detail-img">
            <img src={imageUrl} alt={food.name} />
            {!food.available && (
              <div className="unavail-overlay">Currently Unavailable</div>
            )}
          </div>

          {/* Info */}
          <div className="food-detail-info">
            <span className="detail-category">{food.category?.name}</span>
            <h1>{food.name}</h1>

            <div className="detail-rating">
              {[1,2,3,4,5].map((s) => <FaStar key={s} className={s <= 4 ? 'filled' : ''} />)}
              <span>(4.2)</span>
            </div>

            <p className="detail-desc">{food.description}</p>

            <div className="detail-price">৳{food.price}</div>

            <div className="detail-availability">
              <span className={`badge ${food.available ? 'badge-success' : 'badge-danger'}`}>
                {food.available ? '✓ Available' : '✗ Unavailable'}
              </span>
            </div>

            {food.available && !cartItem && (
              <div className="qty-selector">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <FaMinus />
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                  <FaPlus />
                </button>
              </div>
            )}

            {cartItem ? (
              <div className="cart-qty-controls">
                <p className="in-cart-msg">✓ Added to cart</p>
                <div className="qty-selector">
                  <button onClick={() => updateQuantity(food._id, cartItem.quantity - 1)} aria-label="Decrease">
                    <FaMinus />
                  </button>
                  <span>{cartItem.quantity}</span>
                  <button onClick={() => updateQuantity(food._id, cartItem.quantity + 1)} aria-label="Increase">
                    <FaPlus />
                  </button>
                </div>
                <Link to="/cart" className="btn btn-outline">View Cart</Link>
              </div>
            ) : (
              <button
                className={`btn btn-primary btn-lg add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={!food.available}
              >
                <FaShoppingCart />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            )}

            <p className="delivery-note">🚚 Free delivery on orders over ৳500</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailPage;
