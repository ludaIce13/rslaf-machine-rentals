import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getInventoryByProduct, createInventoryItem, updateInventoryItem, deleteInventoryItem, getInventoryCounts, uploadProductImage } from '../services/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [categoriesList, setCategoriesList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    daily_rate: '',
    hourly_rate: '',
    sku: '',
    image_url: '',
    published: true,
    category: ''
  });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [creating, setCreating] = useState(false);
  // Units drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitForm, setUnitForm] = useState({ label: '', location: '', active: true });
  const [savingUnit, setSavingUnit] = useState(false);
  const [counts, setCounts] = useState({}); // product_id -> {active,total}
  // Edit product modal
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    // Validate critical environment variables
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.warn('REACT_APP_API_URL not set - using fallback backend URL');
    }
    
    fetchProducts();
    fetchCategories();
    fetchCounts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUnitsDrawer = async (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
    await loadUnits(product.id);
  };

  const closeUnitsDrawer = () => {
    setDrawerOpen(false);
    setSelectedProduct(null);
    setUnits([]);
    setUnitForm({ label: '', location: '', active: true });
  };

  const loadUnits = async (productId) => {
    try {
      const res = await getInventoryByProduct(productId);
      setUnits(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load units', e);
    }
  };

  const addUnit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSavingUnit(true);
    try {
      await createInventoryItem({
        product_id: selectedProduct.id,
        label: unitForm.label,
        location: unitForm.location,
        active: !!unitForm.active,
      });
      setUnitForm({ label: '', location: '', active: true });
      await loadUnits(selectedProduct.id);
      await fetchCounts();
    } catch (e) {
      console.error('Failed to create unit', e);
      alert('Failed to create unit');
    } finally {
      setSavingUnit(false);
    }
  };

  const toggleUnitActive = async (it) => {
    try {
      await updateInventoryItem(it.id, { active: !it.active });
      await loadUnits(selectedProduct.id);
      await fetchCounts();
    } catch (e) {
      console.error('Failed to update unit', e);
      alert('Failed to update unit');
    }
  };

  const renameUnit = async (it, next) => {
    try {
      console.log('Saving unit:', it.id, next); // Debug log
      const response = await updateInventoryItem(it.id, { label: next.label, location: next.location });
      console.log('Save response:', response); // Debug log
      await loadUnits(selectedProduct.id);
      await fetchCounts();
      // Clear the edit fields after successful save
      setUnits(prev => prev.map(u => u.id === it.id ? {...u, _editLabel: undefined, _editLoc: undefined} : u));
    } catch (e) {
      console.error('Failed to rename unit', e);
      alert('Failed to rename unit: ' + (e.response?.data?.detail || e.message));
    }
  };

  const removeUnit = async (it) => {
    if (!window.confirm('Delete this unit? This cannot be undone.')) return;
    try {
      console.log('Deleting unit:', it.id); // Debug log
      const response = await deleteInventoryItem(it.id);
      console.log('Delete response:', response); // Debug log
      await loadUnits(selectedProduct.id);
      await fetchCounts();
    } catch (e) {
      console.error('Failed to delete unit', e);
      alert('Failed to delete unit: ' + (e.response?.data?.detail || e.message));
    }
  };

  const openEdit = (product) => {
    setEditData({ ...product });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditData(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editData.name,
        sku: editData.sku,
        description: editData.description,
        image_url: editData.image_url,
        category: editData.category,
        published: !!editData.published,
        daily_rate: parseFloat(editData.daily_rate || 0),
        hourly_rate: parseFloat(editData.hourly_rate || 0),
        min_hours: editData.min_hours != null && editData.min_hours !== '' ? parseInt(editData.min_hours, 10) : null,
        max_hours: editData.max_hours != null && editData.max_hours !== '' ? parseInt(editData.max_hours, 10) : null,
      };
      await updateProduct(editData.id, payload);
      await fetchProducts();
      closeEdit();
    } catch (e) {
      console.error('Failed to save product', e);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This will also delete all associated inventory units and cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteProduct(product.id);
      await fetchProducts();
      await fetchCounts();
      alert('Product deleted successfully!');
    } catch (e) {
      console.error('Failed to delete product', e);
      
      // Handle specific error cases
      if (e.response?.status === 401 || e.response?.status === 403) {
        alert('Authentication failed. Please log out and log back in, then try again.');
      } else if (e.response?.status === 404) {
        alert('Product not found. It may have already been deleted.');
        await fetchProducts(); // Refresh the list
      } else {
        alert(`Failed to delete product: ${e.response?.data?.detail || e.message}`);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategoriesList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await getInventoryCounts();
      console.log('Counts response:', res); // Debug log
      const data = res.data || res || []; // Handle both res.data and direct response
      const byId = {};
      data.forEach((r) => { byId[r.product_id] = { active: r.active, total: r.total }; });
      console.log('Counts by ID:', byId); // Debug log
      setCounts(byId);
    } catch (e) {
      console.error('Failed to load counts', e);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      available: 'bg-green-100 text-green-800 border border-green-200',
      reserved: 'bg-orange-100 text-orange-800 border border-orange-200',
      maintenance: 'bg-red-100 text-red-800 border border-red-200',
      rented: 'bg-blue-100 text-blue-800 border border-blue-200'
    };

    return (
      <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${statusStyles[(status || 'available').toLowerCase()] || statusStyles.available}`}>
        {(status || 'Available').charAt(0).toUpperCase() + (status || 'Available').slice(1)}
      </span>
    );
  };

  const getProductImage = (product) => {
    // ALWAYS use the uploaded image if it exists
    if (product?.image_url && product.image_url.trim()) {
      let imageUrl = product.image_url.trim();
      
      // If it's a relative path, convert to full URL using backend server
      if (imageUrl.startsWith('/static/')) {
        const backendUrl = process.env.REACT_APP_API_URL || 'https://rslaf-backend.onrender.com';
        imageUrl = `${backendUrl}${imageUrl}`;
      }
      
      return imageUrl;
    }
    
    // Neutral equipment SVG fallback only if no image was uploaded
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa"/>
            <stop offset="100%" style="stop-color:#e9ecef"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg)"/>
        <g transform="translate(50, 75)">
          <rect x="50" y="60" width="200" height="60" fill="#6c757d" rx="8"/>
          <rect x="30" y="50" width="80" height="40" fill="#6c757d" rx="4"/>
          <rect x="220" y="40" width="60" height="80" fill="#6c757d" rx="4"/>
          <circle cx="80" cy="140" r="20" fill="#333"/>
          <circle cx="220" cy="140" r="20" fill="#333"/>
          <text x="150" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">EQUIPMENT</text>
        </g>
      </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  // Create product (merged Products functionality)
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...formData,
        daily_rate: parseFloat(formData.daily_rate || 0),
        hourly_rate: parseFloat(formData.hourly_rate || 0),
        category: showNewCategory ? newCategory : formData.category,
      };
      
      console.log('Creating product with payload:', payload);
      const response = await createProduct(payload);
      console.log('Product created successfully:', response);
      
      setFormData({ name: '', description: '', daily_rate: '', hourly_rate: '', sku: '', image_url: '', published: true, category: '' });
      setShowNewCategory(false);
      setNewCategory('');
      setShowForm(false);
      await fetchProducts();
      await fetchCategories();
      alert('Product created successfully!');
    } catch (err) {
      console.error('Failed to create product', err);
      alert(`Failed to create product: ${err.response?.data?.detail || err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const mockProducts = [
    { id: 1, name: 'Projector Model X100', category: 'Projectors', daily_rate: 50, status: 'Available' },
    { id: 2, name: 'Sound System Pro 2000', category: 'Audio Equipment', daily_rate: 80, status: 'Reserved' },
    { id: 3, name: 'Camera Kit Deluxe', category: 'Cameras', daily_rate: 120, status: 'Available' },
    { id: 4, name: 'Lighting Kit Basic', category: 'Lighting', daily_rate: 40, status: 'Maintenance' },
    { id: 5, name: 'Microphone Set Wireless', category: 'Audio Equipment', daily_rate: 60, status: 'Available' },
    { id: 6, name: 'Tripod Heavy Duty', category: 'Accessories', daily_rate: 20, status: 'Available' },
    { id: 7, name: 'Projector Screen Large', category: 'Accessories', daily_rate: 30, status: 'Available' },
    { id: 8, name: 'Sound System Compact', category: 'Audio Equipment', daily_rate: 70, status: 'Rented' }
  ];

  const displayProducts = products;
  const categories = ['All Categories', ...new Set(displayProducts.map(p => p.category).filter(Boolean))];

  const filteredProducts = displayProducts.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || (product.category || '') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        <button onClick={() => setShowForm((v)=>!v)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <span className="text-lg">+</span>
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="w-full border border-gray-300 rounded-lg p-2" value={formData.name} onChange={(e)=>setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input className="w-full border border-gray-300 rounded-lg p-2" value={formData.sku} onChange={(e)=>setFormData({ ...formData, sku: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate ($)</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg p-2" value={formData.daily_rate} onChange={(e)=>setFormData({ ...formData, daily_rate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg p-2" value={formData.hourly_rate} onChange={(e)=>setFormData({ ...formData, hourly_rate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <input type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                try {
                  const res = await uploadProductImage(f);
                  const url = res.data?.url || res.data?.path || '';
                  if (url) setFormData({ ...formData, image_url: url });
                } catch (err) {
                  console.error('Upload failed', err);
                  alert('Failed to upload image');
                }
              }} className="w-full" />
              {formData.image_url && (
                <div className="mt-2 text-xs text-gray-600 break-all">Uploaded: {formData.image_url}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="flex gap-2">
                {!showNewCategory ? (
                  <select className="flex-1 border border-gray-300 rounded-lg p-2" value={formData.category} onChange={(e)=>setFormData({ ...formData, category: e.target.value })}>
                    <option value="">Select a category</option>
                    {categoriesList.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input className="flex-1 border border-gray-300 rounded-lg p-2" value={newCategory} onChange={(e)=>setNewCategory(e.target.value)} placeholder="New category name" />
                )}
                <button type="button" onClick={()=>setShowNewCategory(v=>!v)} className="px-3 py-2 border border-gray-300 rounded-lg">{showNewCategory ? 'Use existing' : '+ New'}</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="published" type="checkbox" checked={formData.published} onChange={(e)=>setFormData({ ...formData, published: e.target.checked })} />
              <label htmlFor="published" className="text-sm text-gray-700">Published</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-2" rows={3} value={formData.description} onChange={(e)=>setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <button disabled={creating} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{creating ? 'Creating...' : 'Create Product'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="relative">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // Switch to neutral SVG fallback if the provided URL fails
                  const fallbackSvg = `
                    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                      <rect width="400" height="300" fill="#f8f9fa"/>
                      <g transform="translate(50, 75)">
                        <rect x="50" y="60" width="200" height="60" fill="#6c757d" rx="8"/>
                        <circle cx="80" cy="140" r="20" fill="#333"/>
                        <circle cx="220" cy="140" r="20" fill="#333"/>
                        <text x="150" y="30" text-anchor="middle" font-family="Arial" font-size="14" fill="#333">EQUIPMENT</text>
                      </g>
                    </svg>
                  `;
                  e.target.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fallbackSvg);
                }}
              />
              {getStatusBadge(product.status)}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-semibold">{(product.hourly_rate || 0) > 0 ? `$${product.hourly_rate}/hour` : `$${product.daily_rate}/day`}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                    {(counts[product.id]?.active || 0)} active / {(counts[product.id]?.total || 0)} total
                  </span>
                  <button onClick={() => openUnitsDrawer(product)} className="text-blue-600 hover:text-blue-700 text-sm">
                    Units
                  </button>
                  <button onClick={() => openEdit(product)} className="text-gray-700 hover:text-gray-900 text-sm">Edit</button>
                  <button onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No items found matching your criteria</div>
        </div>
      )}

      {/* Side Drawer for Units */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={closeUnitsDrawer} />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Units • {selectedProduct?.name}</h3>
              <button onClick={closeUnitsDrawer} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <h4 className="font-medium mb-2">Add Unit</h4>
              <form onSubmit={addUnit} className="grid grid-cols-1 gap-3 mb-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Label</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2" value={unitForm.label} onChange={(e)=>setUnitForm({ ...unitForm, label: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2" value={unitForm.location} onChange={(e)=>setUnitForm({ ...unitForm, location: e.target.value })} />
                </div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={unitForm.active} onChange={(e)=>setUnitForm({ ...unitForm, active: e.target.checked })} />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <button disabled={savingUnit} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">{savingUnit ? 'Saving...' : 'Add Unit'}</button>
              </form>

              <h4 className="font-medium mb-2">Existing Units</h4>
              {units.length === 0 ? (
                <div className="text-gray-500 text-sm">No units yet.</div>
              ) : (
                <div className="space-y-2">
                  {units.map((it) => (
                    <div key={it.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Label</label>
                          <input 
                            className="w-full font-medium border border-gray-300 focus:border-blue-500 rounded px-2 py-1" 
                            value={it._editLabel ?? it.label} 
                            onChange={(e)=>setUnits(prev=>prev.map(u=>u.id===it.id?{...u,_editLabel:e.target.value}:u))} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Location</label>
                          <input 
                            className="w-full border border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm" 
                            value={it._editLoc ?? (it.location || '')} 
                            onChange={(e)=>setUnits(prev=>prev.map(u=>u.id===it.id?{...u,_editLoc:e.target.value}:u))} 
                            placeholder="Enter location" 
                          />
                        </div>
                        <div className="text-xs text-gray-500">Unit ID: #{it.id}</div>
                        <div className="flex items-center justify-between gap-2">
                          <button 
                            onClick={() => toggleUnitActive(it)} 
                            className={`px-3 py-1 rounded text-white text-sm font-medium ${it.active ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'}`}
                          >
                            {it.active ? 'Active' : 'Inactive'}
                          </button>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => renameUnit(it, { label: it._editLabel ?? it.label, location: it._editLoc ?? it.location })} 
                              className="px-3 py-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => removeUnit(it)} 
                              className="px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={closeEdit} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl border border-gray-200">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit Product • #{editData?.id}</h3>
                <button onClick={closeEdit} className="text-gray-600 hover:text-gray-900">✕</button>
              </div>
              <form onSubmit={saveEdit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input className="w-full border rounded p-2" value={editData?.name || ''} onChange={(e)=>setEditData({...editData, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input className="w-full border rounded p-2" value={editData?.sku || ''} onChange={(e)=>setEditData({...editData, sku: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Daily Rate ($)</label>
                  <input type="number" step="0.01" className="w-full border rounded p-2" value={editData?.daily_rate ?? ''} onChange={(e)=>setEditData({...editData, daily_rate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
                  <input type="number" step="0.01" className="w-full border rounded p-2" value={editData?.hourly_rate ?? ''} onChange={(e)=>setEditData({...editData, hourly_rate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Hours</label>
                  <input type="number" step="1" min="1" className="w-full border rounded p-2" value={editData?.min_hours ?? ''} onChange={(e)=>setEditData({...editData, min_hours: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Hours (optional)</label>
                  <input type="number" step="1" className="w-full border rounded p-2" value={editData?.max_hours ?? ''} onChange={(e)=>setEditData({...editData, max_hours: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input className="w-full border rounded p-2" value={editData?.category || ''} onChange={(e)=>setEditData({...editData, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input className="w-full border rounded p-2" value={editData?.image_url || ''} onChange={(e)=>setEditData({...editData, image_url: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea className="w-full border rounded p-2" rows={3} value={editData?.description || ''} onChange={(e)=>setEditData({...editData, description: e.target.value})} />
                </div>
                <label className="inline-flex items-center gap-2 md:col-span-2">
                  <input type="checkbox" checked={!!editData?.published} onChange={(e)=>setEditData({...editData, published: e.target.checked})} />
                  <span>Published</span>
                </label>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={closeEdit} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
