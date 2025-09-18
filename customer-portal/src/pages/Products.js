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
  
  // Return appropriate image based on equipment type
  if (name.includes('backhoe') || name.includes('back hoe')) {
    console.log('FIXED VERSION - Using backhoe image');
    return 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop&auto=format';
  }
  if (name.includes('excavator')) {
    console.log('FIXED VERSION - Using excavator image');
    return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&auto=format';
  }
  if (name.includes('loader')) {
    console.log('FIXED VERSION - Using loader image');
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&auto=format';
  }
  // Default construction equipment image
  console.log('FIXED VERSION - Using default construction image');
  return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format';
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
                    e.target.src = 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop&auto=format';
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