import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getInventoryCounts } from '../services/api';
import { getCategories } from '../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [inventoryCounts, setInventoryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('All Equipment');
  const navigate = useNavigate();
  const [categoryOptions, setCategoryOptions] = useState(['All Equipment']);

  useEffect(() => {
    // Load products from API first, then fallback to sample data
    loadProducts();
    loadCategories();
    loadInventoryCounts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts({ published_only: true });
      if (response.data && response.data.length > 0) {
        setProducts(response.data);
        return;
      }
    } catch (error) {
      console.log('API not available, using fallback data');
    }
    
    // No fallback data - use only real API data
    setProducts([]);
  };

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter(product => {
      const inSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const cat = getCategory(product);
      const inCategory = category === 'All Equipment' || cat === category;
      return inSearch && inCategory;
    });
    setFilteredProducts(filtered);
  }, [products, searchTerm, category]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      if (response.data) {
        setCategoryOptions(['All Equipment', ...response.data]);
      }
    } catch (error) {
      console.log('Categories API not available');
    }
  };

  const loadInventoryCounts = async () => {
    try {
      const response = await getInventoryCounts();
      const countsMap = {};
      response.data.forEach(item => {
        countsMap[item.product_id] = item.active;
      });
      setInventoryCounts(countsMap);
    } catch (error) {
      console.log('Inventory counts API not available');
    }
  };


  const getCategory = (p) => p.category || 'Equipment';
  const getImage = (p) => {
  console.log('Getting image for product:', p.name, 'image_url:', p.image_url);
  
  if (p.image_url && p.image_url.trim()) {
    console.log('Using provided image_url:', p.image_url);
    return p.image_url;
  }
  
  // Embedded SVG images that will always work - no external dependencies
  const name = (p.name || '').toLowerCase();
  console.log('Product name for image matching:', name);
  
  if (name.includes('backhoe') || name.includes('back hoe')) {
    console.log('Matched backhoe, using embedded backhoe SVG');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f0f0f0"/>
        <g transform="translate(50 50)">
          <rect x="50" y="100" width="200" height="80" fill="#ffc900" rx="8"/>
          <rect x="20" y="80" width="100" height="60" fill="#ffc900" rx="4"/>
          <rect x="220" y="60" width="80" height="100" fill="#ffc900" rx="4"/>
          <circle cx="80" cy="200" r="30" fill="#333"/>
          <circle cx="220" cy="200" r="30" fill="#333"/>
          <text x="150" y="90" font-family="Arial" font-size="16" fill="#333" text-anchor="middle">Backhoe Loader</text>
        </g>
      </svg>
    `);
  }
  if (name.includes('excavator')) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmMGYwIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSI+CjxyZWN0IHg9IjgwIiB5PSIxMjAiIHdpZHRoPSIxNDAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZmM5MDAiIHJ4PSI4Ii8+CjxyZWN0IHg9IjIwMCIgeT0iODAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iI2ZmYzkwMCIgcng9IjQiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMjAwIiByPSIyNSIgZmlsbD0iIzMzMyIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjI1IiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkV4Y2F2YXRvcjwvdGV4dD4KPC9nPgo8L3N2Zz4K';
  }
  if (name.includes('loader')) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmMGYwIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSI+CjxyZWN0IHg9IjYwIiB5PSIxMDAiIHdpZHRoPSIxODAiIGhlaWdodD0iNzAiIGZpbGw9IiNmZmM5MDAiIHJ4PSI4Ii8+CjxyZWN0IHg9IjIwIiB5PSI4MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmZjOTAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI5MCIgY3k9IjIwMCIgcj0iMzAiIGZpbGw9IiMzMzMiLz4KPGNpcmNsZSBjeD0iMjEwIiBjeT0iMjAwIiByPSIzMCIgZmlsbD0iIzMzMyIvPgo8dGV4dCB4PSIxNTAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRlcjwvdGV4dD4KPC9nPgo8L3N2Zz4K';
  }
  // Default construction equipment image
  console.log('Using default construction equipment SVG');
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmMGYwIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSI+CjxyZWN0IHg9IjUwIiB5PSIxMDAiIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiNmZmM5MDAiIHJ4PSI4Ii8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iMjAwIiByPSIzMCIgZmlsbD0iIzMzMyIvPgo8Y2lyY2xlIGN4PSIyMjAiIGN5PSIyMDAiIHI9IjMwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29uc3RydWN0aW9uIEVxdWlwbWVudDwvdGV4dD4KPC9nPgo8L3N2Zz4K';
};

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // React to URL query param changes (e.g., from header search)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search') || '';
    setSearchTerm(searchParam);
  }, []);

  const categories = categoryOptions;

  if (loading) {
    return (
      <div className="products-container">
        <div className="products-header">
          <h1>Equipment Catalog</h1>
          <p>Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-catalog">
      <div className="catalog-hero">
        <div className="hero-content">
          <h1>Professional Equipment Rental</h1>
          <p>Quality construction machinery for your projects</p>
        </div>
      </div>
      <div className="catalog-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Equipment Catalog</h1>
            <p>Discover our comprehensive range of professional construction equipment</p>
          </div>
        </div>
        
        <div className="filter-container">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="equipment-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="equipment-card">
              <div className="equipment-image">
                <img 
                  src={product.image_url || getImage(product)} 
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Equipment+Image';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', product.name)}
                />
                <div className="equipment-type">{getCategory(product)}</div>
                <div className="availability-badge">
                  <span className={`status ${(inventoryCounts[product.id] || 0) > 0 ? 'available' : 'unavailable'}`}>
                    {(inventoryCounts[product.id] || 0) > 0 ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div className="equipment-info">
                <div className="equipment-header">
                  <h3>{product.name}</h3>
                  <div className="sku">SKU: {product.sku}</div>
                </div>
                <p className="equipment-description">{product.description}</p>
                
                {product.specifications && (
                  <div className="specifications">
                    <h4>Specifications</h4>
                    <p>{product.specifications}</p>
                  </div>
                )}
                
                
                <div className="card-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate(`/booking/${product.id}`)}
                    disabled={(inventoryCounts[product.id] || 0) === 0}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-equipment">
          <div className="no-equipment-icon">🏗️</div>
          <h3>No equipment found</h3>
          <p>{searchTerm ? 'Try adjusting your search terms or browse all categories' : 'No equipment available at the moment'}</p>
          {searchTerm && (
            <button 
              className="btn-secondary"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;