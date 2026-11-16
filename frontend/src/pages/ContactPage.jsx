import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './ContactPage.css';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact <span>Us</span></h1>
          <p>Have a question or feedback? We'd love to hear from you!</p>
        </div>
      </div>

      <div className="container section-padding">
        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info-col">
            <h2>Get in Touch</h2>
            <p>We're here to help. Reach out through any of the channels below.</p>
            <div className="contact-items">
              <div className="contact-item">
                <div className="ci-icon"><FaMapMarkerAlt /></div>
                <div><strong>Address</strong><p>123 Food Street, Gulshan, Dhaka-1212</p></div>
              </div>
              <div className="contact-item">
                <div className="ci-icon"><FaPhone /></div>
                <div><strong>Phone</strong><p>+880 1700-000000</p></div>
              </div>
              <div className="contact-item">
                <div className="ci-icon"><FaEnvelope /></div>
                <div><strong>Email</strong><p>hello@foodiehub.com</p></div>
              </div>
              <div className="contact-item">
                <div className="ci-icon"><FaClock /></div>
                <div><strong>Hours</strong><p>Daily: 8:00 AM – 12:00 AM</p></div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-col">
            {sent ? (
              <div className="alert alert-success sent-msg">
                <h3>✅ Message Sent!</h3>
                <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn btn-primary" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="ct-name">Full Name</label>
                    <input id="ct-name" name="name" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ct-email">Email</label>
                    <input id="ct-email" type="email" name="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="ct-subject">Subject</label>
                  <input id="ct-subject" name="subject" className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required placeholder="How can we help?" />
                </div>
                <div className="form-group">
                  <label htmlFor="ct-msg">Message</label>
                  <textarea id="ct-msg" name="message" className="form-control" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="Your message..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
