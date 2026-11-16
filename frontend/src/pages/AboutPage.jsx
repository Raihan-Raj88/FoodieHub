import { FaUtensils, FaTruck, FaUsers, FaStar } from 'react-icons/fa';
import './AboutPage.css';

const AboutPage = () => (
  <div className="about-page">
    <div className="about-hero">
      <div className="container">
        <h1>About <span>FoodieHub</span></h1>
        <p>We're passionate about bringing restaurant-quality food to your home</p>
      </div>
    </div>

    <div className="container section-padding">
      <div className="about-grid">
        <div className="about-text">
          <h2>Our Story</h2>
          <p>FoodieHub was born out of a simple idea — everyone deserves access to delicious, fresh, restaurant-quality food delivered right to their door. We started in 2020 as a small team of food enthusiasts who wanted to change the way people experience food.</p>
          <p>Today, we serve thousands of happy customers across the city, partnering with the best local chefs and restaurants to bring you a diverse menu of mouth-watering dishes prepared with the finest ingredients.</p>
          <p>Our commitment is simple: fresh food, fast delivery, and a smile with every order.</p>
        </div>
        <div className="about-img">
          <img src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600" alt="Our Kitchen" />
        </div>
      </div>

      <div className="about-stats">
        {[
          { icon: <FaUtensils />, value: '500+', label: 'Menu Items' },
          { icon: <FaTruck />, value: '30 Min', label: 'Avg Delivery' },
          { icon: <FaUsers />, value: '10,000+', label: 'Happy Customers' },
          { icon: <FaStar />, value: '4.8/5', label: 'Average Rating' },
        ].map((s, i) => (
          <div key={i} className="about-stat">
            <div className="about-stat-icon">{s.icon}</div>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AboutPage;
