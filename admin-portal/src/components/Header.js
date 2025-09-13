import React from 'react';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="admin-header">
      <div className="header-content">
        <h1 className="header-title">Dashboard</h1>

        <div className="header-actions">
          <div className="user-info">
            <FaUser className="user-icon" />
            <span className="user-name">{user?.email}</span>
            <span className="user-role">{user?.role}</span>
          </div>

          <button
            onClick={onLogout}
            className="logout-btn"
            title="Logout"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;