import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBox, FaWarehouse, FaShoppingCart, FaUsers, FaUserCog, FaChartBar, FaCog, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/inventory', label: 'Inventory', icon: FaWarehouse },
    { path: '/orders', label: 'Orders', icon: FaShoppingCart },
    { path: '/customers', label: 'Customers', icon: FaUsers },
    { path: '/users', label: 'Users', icon: FaUserCog },
    { path: '/reports', label: 'Reports', icon: FaChartBar },
    { path: '/settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>SmartRentals</h2>
        <p>Admin Panel</p>
      </div>

      <nav>
        <ul className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={isActive ? 'active' : ''}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;