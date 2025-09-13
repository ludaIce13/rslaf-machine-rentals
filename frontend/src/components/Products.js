import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, getCategories } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    daily_rate: '',
    sku: '',
    image_url: '',
    published: true,
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      // Set default products for presentation
      const defaultProducts = [
        {
          id: 1,
          name: "CAT 320 Excavator",
          description: "Heavy-duty excavator for construction projects",
          daily_rate: 450,
          sku: "EXC-320",
          category: "Heavy Equipment",
          published: true,
          image_url: null
        },
        {
          id: 2,
          name: "Concrete Mixer",
          description: "Portable concrete mixer for construction",
          daily_rate: 180,
          sku: "MIX-450",
          category: "Heavy Equipment", 
          published: true,
          image_url: null
        },
        {
          id: 3,
          name: "Power Drill Set",
          description: "Professional power drill with attachments",
          daily_rate: 25,
          sku: "DRL-001",
          category: "Power Tools",
          published: true,
          image_url: null
        }
      ];
      
      setProducts(defaultProducts);
      
      // Try to load real products in background
      try {
        const response = await getProducts();
        if (response.data && response.data.length > 0) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error loading real products:', error);
        // Keep default products
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        daily_rate: parseFloat(formData.daily_rate),
        category: showNewCategory ? newCategory : formData.category,
      };
      await createProduct(payload);
      setFormData({ name: '', description: '', daily_rate: '', sku: '', image_url: '', published: true, category: '' });
      setNewCategory('');
      setShowNewCategory(false);
      setShowForm(false);
      loadProducts();
      loadCategories();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (p) => {
    try {
      await updateProduct(p.id, { published: !p.published });
      await loadProducts();
    } catch (e) {
      console.error('Failed to toggle publish', e);
      alert('Failed to toggle publish');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0 }}>Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>SKU:</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Daily Rate ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Image URL:</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!showNewCategory ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="New category name"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  )}
                  <button type="button" onClick={() => setShowNewCategory(!showNewCategory)} style={{ padding: '8px 10px' }}>
                    {showNewCategory ? 'Use existing' : '+ New'}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Published:</label>
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            No products found. Add your first product to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Image</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>SKU</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Daily Rate</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Published</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>#{product.id}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
                      ) : (
                        <span style={{ color: '#6c757d' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{product.name}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>{product.sku}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>${product.daily_rate}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>{product.category || '—'}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>
                      <button onClick={() => togglePublish(product)} style={{
                        backgroundColor: product.published ? '#27ae60' : '#bdc3c7',
                        color: 'white', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer'
                      }}>
                        {product.published ? 'Published' : 'Unpublished'}
                      </button>
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>{product.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
