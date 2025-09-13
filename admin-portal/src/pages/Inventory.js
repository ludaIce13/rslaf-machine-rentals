import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaSort, FaEllipsisV, FaEdit, FaTrash, FaEye, FaBox, FaWarehouse, FaChartBar, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sample inventory data
  useEffect(() => {
    const sampleInventory = [
      {
        id: 1,
        name: 'Canon EOS R5',
        category: 'Camera',
        model: 'EOS R5',
        quantity: 5,
        rentalPrice: 150,
        status: 'Available',
        lastUpdated: '2025-09-01',
        image: 'https://via.placeholder.com/60x60/38e07b/ffffff?text=Canon'
      },
      {
        id: 2,
        name: 'Sony A7 III',
        category: 'Camera',
        model: 'A7 III',
        quantity: 3,
        rentalPrice: 120,
        status: 'Low Stock',
        lastUpdated: '2025-08-30',
        image: 'https://via.placeholder.com/60x60/ffa500/ffffff?text=Sony'
      },
      {
        id: 3,
        name: 'Nikon Z7 II',
        category: 'Camera',
        model: 'Z7 II',
        quantity: 2,
        rentalPrice: 100,
        status: 'Out of Stock',
        lastUpdated: '2025-08-29',
        image: 'https://via.placeholder.com/60x60/ff6347/ffffff?text=Nikon'
      },
      {
        id: 4,
        name: '24-70mm f/2.8 Lens',
        category: 'Lens',
        model: 'EF 24-70mm f/2.8L',
        quantity: 4,
        rentalPrice: 80,
        status: 'Available',
        lastUpdated: '2025-09-01',
        image: 'https://via.placeholder.com/60x60/38e07b/ffffff?text=Lens'
      },
      {
        id: 5,
        name: '70-200mm f/2.8 Lens',
        category: 'Lens',
        model: 'EF 70-200mm f/2.8L',
        quantity: 3,
        rentalPrice: 90,
        status: 'Low Stock',
        lastUpdated: '2025-08-31',
        image: 'https://via.placeholder.com/60x60/ffa500/ffffff?text=Lens'
      },
      {
        id: 6,
        name: 'Tripod Pro',
        category: 'Accessory',
        model: 'MT055XPRO3',
        quantity: 8,
        rentalPrice: 25,
        status: 'Available',
        lastUpdated: '2025-09-01',
        image: 'https://via.placeholder.com/60x60/38e07b/ffffff?text=Tripod'
      },
      {
        id: 7,
        name: 'Flash Speedlite',
        category: 'Accessory',
        model: 'Speedlite 600EX II',
        quantity: 6,
        rentalPrice: 30,
        status: 'Available',
        lastUpdated: '2025-08-30',
        image: 'https://via.placeholder.com/60x60/38e07b/ffffff?text=Flash'
      },
      {
        id: 8,
        name: 'Memory Card 128GB',
        category: 'Accessory',
        model: 'Extreme Pro',
        quantity: 20,
        rentalPrice: 10,
        status: 'Available',
        lastUpdated: '2025-09-01',
        image: 'https://via.placeholder.com/60x60/38e07b/ffffff?text=SD'
      }
    ];
    setInventory(sampleInventory);
    setFilteredInventory(sampleInventory);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredInventory(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortConfig, inventory]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Low Stock':
        return 'warning';
      case 'Out of Stock':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle">Manage your rental inventory and track stock levels</p>
      </div>
      
      <div className="page-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
            <div className="stat-icon" style={{ color: '#3498db' }}>
              <FaBox />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{inventory.length}</h3>
              <p className="stat-title">Total Products</p>
            </div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: '#e74c3c' }}>
            <div className="stat-icon" style={{ color: '#e74c3c' }}>
              <FaWarehouse />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{inventory.reduce((sum, item) => sum + item.available, 0)}</h3>
              <p className="stat-title">Available Items</p>
            </div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: '#f39c12' }}>
            <div className="stat-icon" style={{ color: '#f39c12' }}>
              <FaChartBar />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{inventory.filter(item => item.status === 'Low Stock').length}</h3>
              <p className="stat-title">Low Stock</p>
            </div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: '#e67e22' }}>
            <div className="stat-icon" style={{ color: '#e67e22' }}>
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{inventory.filter(item => item.status === 'Out of Stock').length}</h3>
              <p className="stat-title">Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Products</h2>
            <div className="section-controls">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn btn-primary">
                <FaPlus /> New Product
              </button>
            </div>
          </div>
          
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Item <FaChevronDown className="sort-icon" />
                  </th>
                  <th onClick={() => handleSort('category')}>
                    Category <FaChevronDown className="sort-icon" />
                  </th>
                  <th onClick={() => handleSort('quantity')}>
                    Quantity <FaChevronDown className="sort-icon" />
                  </th>
                  <th onClick={() => handleSort('rentalPrice')}>
                    Rental Price <FaChevronDown className="sort-icon" />
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status <FaChevronDown className="sort-icon" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-info">
                        <div className="product-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="product-details">
                          <div className="product-name">{item.name}</div>
                          <div className="product-model">{item.model}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>${item.rentalPrice}/day</td>
                    <td>
                      <span className={`status-badge status-${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" title="View" onClick={() => console.log('View', item.id)}>
                          <FaEye />
                        </button>
                        <button className="action-btn" title="Edit" onClick={() => console.log('Edit', item.id)}>
                          <FaEdit />
                        </button>
                        <button className="action-btn" title="Delete" onClick={() => console.log('Delete', item.id)}>
                          <FaTrash />
                        </button>
                        <button className="action-btn" title="More" onClick={() => console.log('More', item.id)}>
                          <FaEllipsisV />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;