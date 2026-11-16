import { Link } from 'react-router-dom';
import { MdFoodBank } from 'react-icons/md';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <MdFoodBank />
              FoodieHub
            </Link>
            <p>Delicious food delivered fresh to your door. Quality meals, fast delivery, and great taste — every time.</p>
            <div className="social-links">
              <a href="#!" aria-label="Facebook"><FaFacebook /></a>
              <a href="#!" aria-label="Instagram"><FaInstagram /></a>
              <a href="#!" aria-label="Twitter"><FaTwitter /></a>
              <a href="#!" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p><FaMapMarkerAlt /> 123 Food Street, Dhaka, Bangladesh</p>
              <p><FaPhone /> +880 1700 000000</p>
              <p><FaEnvelope /> hello@foodiehub.com</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FoodieHub. All rights reserved.</p>
          <p>Made with ❤️ for food lovers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
