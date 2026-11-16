import { Link } from 'react-router-dom';
import { FaMinus, FaPlus, FaTrash, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, deliveryCharge, total } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some delicious food items to get started!</p>
            <Link to="/menu" className="btn btn-primary">
              <FaShoppingBag /> Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Your Cart</h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cartItems.map((item) => {
              const imgUrl = item.image?.startsWith('http')
                ? item.image
                : item.image
                ? `${API_URL}${item.image}`
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';

              return (
                <div key={item._id} className="cart-item">
                  <img src={imgUrl} alt={item.name} />
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">৳{item.price} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-ctrl">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} aria-label="Decrease">
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} aria-label="Increase">
                        <FaPlus />
                      </button>
                    </div>
                    <span className="item-total">৳{item.price * item.quantity}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charge</span>
                <span>৳{deliveryCharge}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>৳{total}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary checkout-btn">
              Proceed to Checkout <FaArrowRight />
            </Link>

            <Link to="/menu" className="btn btn-outline continue-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
