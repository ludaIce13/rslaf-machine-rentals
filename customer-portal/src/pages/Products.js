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
  console.log('FIXED VERSION - Getting image for product:', p.name, 'image_url:', p.image_url);
  
  if (p.image_url && p.image_url.trim()) {
    console.log('Using provided image_url:', p.image_url);
    return p.image_url;
  }
  
  // Simple, guaranteed to work image
  const name = (p.name || '').toLowerCase();
  console.log('FIXED VERSION - Product name for image matching:', name);
  
  // Create a simple, guaranteed working image
  const createEquipmentImage = (equipmentType, color = '#ffc900') => {
    const svg = `
      <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa"/>
            <stop offset="100%" style="stop-color:#e9ecef"/>
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill="url(#bg)"/>
        <g transform="translate(50, 50)">
          <rect x="50" y="80" width="200" height="60" fill="${color}" rx="8"/>
          <rect x="30" y="70" width="80" height="40" fill="${color}" rx="4"/>
          <rect x="220" y="60" width="60" height="80" fill="${color}" rx="4"/>
          <circle cx="80" cy="160" r="20" fill="#333"/>
          <circle cx="220" cy="160" r="20" fill="#333"/>
          <text x="150" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">${equipmentType}</text>
        </g>
      </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  if (name.includes('backhoe') || name.includes('back hoe')) {
    console.log('FIXED VERSION - Using backhoe SVG');
    return createEquipmentImage('BACKHOE LOADER', '#ffc900');
  }
  if (name.includes('excavator')) {
    console.log('FIXED VERSION - Using excavator SVG');
    return createEquipmentImage('EXCAVATOR', '#ff6b35');
  }
  if (name.includes('loader')) {
    console.log('FIXED VERSION - Using loader SVG');
    return createEquipmentImage('LOADER', '#28a745');
  }
  // Default construction equipment image
  console.log('FIXED VERSION - Using default equipment SVG');
  return createEquipmentImage('CONSTRUCTION EQUIPMENT', '#6c757d');
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
                  src={getImage(product)} 
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('FIXED VERSION - Image failed to load:', e.target.src);
                    const fallbackSvg = `
                      <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="250" fill="#f8f9fa"/>
                        <g transform="translate(50, 50)">
                          <rect x="50" y="80" width="200" height="60" fill="#6c757d" rx="8"/>
                          <circle cx="80" cy="160" r="20" fill="#333"/>
                          <circle cx="220" cy="160" r="20" fill="#333"/>
                          <text x="150" y="50" text-anchor="middle" font-family="Arial" font-size="14" fill="#333">EQUIPMENT</text>
                        </g>
                      </svg>
                    `;
                    e.target.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fallbackSvg);
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