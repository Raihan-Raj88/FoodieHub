import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './FoodCard.css';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const FoodCard = ({ food }) => {
  const { addToCart, cartItems } = useCart();

  const imageUrl = food.image?.startsWith('http')
    ? food.image
    : food.image
    ? `${API_URL}${food.image}`
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

  const inCart = cartItems.some((item) => item._id === food._id);

  return (
    <div className={`food-card ${!food.available ? 'unavailable' : ''}`}>
      <Link to={`/food/${food._id}`} className="food-card-img-wrap">
        <img src={imageUrl} alt={food.name} loading="lazy" />
        {!food.available && <div className="unavailable-badge">Unavailable</div>}
        <div className="food-card-category">{food.category?.name || 'Food'}</div>
      </Link>

      <div className="food-card-body">
        <Link to={`/food/${food._id}`}>
          <h3 className="food-card-title">{food.name}</h3>
        </Link>
        <p className="food-card-desc">{food.description}</p>

        <div className="food-card-footer">
          <span className="food-price">৳{food.price}</span>
          <button
            className={`add-cart-btn ${inCart ? 'in-cart' : ''}`}
            onClick={() => food.available && addToCart(food)}
            disabled={!food.available}
            aria-label={`Add ${food.name} to cart`}
          >
            <FaShoppingCart />
            {inCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
