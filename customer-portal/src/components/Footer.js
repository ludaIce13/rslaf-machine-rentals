import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>RSLAF Rentals</h3>
            <p>Your trusted partner for equipment rentals. Quality products, reliable service.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/products">Equipment</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>📧 rslafierentalservice@gmail.com</p>
            <p>📞 +232 78 839095 / +232 79 650500</p>
            <p>📍 Cockerill Barracks, Wilkinson road, FREETOWN</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 RSLAF Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;