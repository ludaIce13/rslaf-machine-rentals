import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import './Header.css';
import logo from '../assets/logo.jpg';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="brand" onClick={closeMenu}>
            <img src={logo} alt="RSLAF Rentals" className="brand-logo" />
            <span>RSLAF Rentals</span>
          </Link>
          <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/products" onClick={closeMenu}>All Machines</Link>
            <Link to="/about" onClick={closeMenu}>About Us</Link>
          </nav>
        </div>

        <div className="nav-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
          />
          <button onClick={() => navigate(`/products?search=${encodeURIComponent(query)}`)} aria-label="Search">
            <FaSearch />
          </button>
        </div>

        <div className="header-actions">
          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

    </header>
  );
};

export default Header;