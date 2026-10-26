import { useEffect, useState } from 'react';
import { resolveImageUrl } from '../services/api';
import {
  createProduct,
  updateProduct,
  getAllProductsAdmin,
  setProductActive,
  updateProductStock,
} from '../services/adminApi';
import { getAllOrders, updateOrderStatus } from '../services/orderApi';
import { formatPrice } from '../utils/currency';

const LOW_STOCK_THRESHOLD = 10;
const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'];
const DEFAULT_CATEGORIES = [
  'T-Shirts',
  'Mugs',
  'Phone Cases',
  'Hoodies',
  'Tote Bags',
  'Caps',
];

const emptyForm = { name: '', category: '', price: '', tag: '', stock: '' };

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Variant groups being built for the product form, e.g.
  // [{ name: 'Size', options: ['S','M','L'] }, { name: 'Colour', options: ['Black'] }]
  const [variantGroups, setVariantGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupOptionsText, setGroupOptionsText] = useState('');

  // Pending quantity edits in the Inventory tab, keyed by product id.
  const [stockEdits, setStockEdits] = useState({});

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const allCategories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...products.map((p) => p.category).filter(Boolean),
      ...(form.category && !isCustomCategory ? [form.category] : []),
    ])
  );

  const loadProducts = () => {
    setLoading(true);
    getAllProductsAdmin()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadOrders = () => {
    setOrdersLoading(true);
    getAllOrders()
      .then((data) => setOrders(data))
      .catch((err) => setOrdersError(err.message))
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
    setVariantGroups([]);
    setGroupName('');
    setGroupOptionsText('');
    setIsCustomCategory(false);
    setCustomCategory('');
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      tag: product.tag || '',
      stock: product.stock ?? '',
    });
    setVariantGroups(product.variants || []);
    setFile(null);
    setIsCustomCategory(false);
    setCustomCategory('');
    setTab('products');
  };

  // Soft-delete: the product is hidden from customers but stays in the
  // database, so past orders that reference it remain valid.
  const handleToggleActive = async (product) => {
    const makeActive = product.active === false;
    if (!makeActive && !window.confirm('Deactivate this product? It will be hidden from the store.')) return;
    try {
      await setProductActive(product._id, makeActive);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStockSave = async (id) => {
    try {
      await updateProductStock(id, stockEdits[id]);
      setStockEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Adds one variant group (e.g. "Size" with options "S, M, L, XL") to the
  // list being built for this product. Comma-separated options are split,
  // trimmed, and empty entries dropped.
  const addVariantGroup = () => {
    const name = groupName.trim();
    const options = groupOptionsText
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    if (!name || options.length === 0) return;
    setVariantGroups([...variantGroups, { name, options }]);
    setGroupName('');
    setGroupOptionsText('');
  };

  const removeVariantGroup = (index) => {
    setVariantGroups(variantGroups.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const data = new FormData();
    data.append('name', form.name);
    data.append('category', form.category);
    data.append('price', form.price);
    data.append('tag', form.tag);
    data.append('stock', form.stock === '' ? 0 : form.stock);
    data.append('variants', JSON.stringify(variantGroups));
    if (file) data.append('image', file);

    try {
      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await createProduct(data);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      loadOrders();
    } catch (err) {
      setOrdersError(err.message);
    }
  };

  const activeProducts = products.filter((p) => p.active !== false);
  const lowStockProducts = activeProducts.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD);

  return (
    <section className="section admin-page">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Store Admin</h2>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={tab === 'products' ? 'active' : ''}
            onClick={() => setTab('products')}
          >
            Products
          </button>
          <button
            type="button"
            className={tab === 'inventory' ? 'active' : ''}
            onClick={() => setTab('inventory')}
          >
            Inventory
          </button>
          <button
            type="button"
            className={tab === 'orders' ? 'active' : ''}
            onClick={() => setTab('orders')}
          >
            Orders
          </button>
        </div>

        {tab === 'dashboard' && (
          <div className="admin-dashboard">
            <div className="admin-summary-cards">
              <div className="admin-summary-card">
                <span>Products</span>
                <strong>{activeProducts.length}</strong>
              </div>
              <div className="admin-summary-card">
                <span>Orders</span>
                <strong>{orders.length}</strong>
              </div>
              <div className="admin-summary-card admin-summary-card-warn">
                <span>Low Stock</span>
                <strong>{lowStockProducts.length}</strong>
              </div>
            </div>

            <h4 className="admin-section-title">Recent Orders</h4>
            {ordersLoading ? (
              <p>Loading orders...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o._id}>
                        <td>{o.orderId}</td>
                        <td>
                          <span className={`status-badge status-${o.status}`}>{o.status}</span>
                        </td>
                        <td>{formatPrice(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {lowStockProducts.length > 0 && (
              <>
                <h4 className="admin-section-title">Low Stock Products</h4>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((p) => (
                        <tr key={p._id}>
                          <td>{p.name}</td>
                          <td>{p.category}</td>
                          <td className="admin-stock-low">{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'products' && (
          <div className="admin-layout">
            <form className="admin-form" onSubmit={handleSubmit}>
              <h4>{editingId ? 'Edit product' : 'Add new product'}</h4>

              <label>
                Name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Category
                {!isCustomCategory ? (
                  <select
                    required
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                        setCustomCategory('');
                        setForm({ ...form, category: '' });
                      } else {
                        setForm({ ...form, category: e.target.value });
                      }
                    }}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">+ Add new category...</option>
                  </select>
                ) : (
                  <div className="admin-custom-category-row">
                    <input
                      type="text"
                      required
                      placeholder="Enter new category"
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        setForm({ ...form, category: e.target.value });
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setCustomCategory('');
                        setForm({ ...form, category: '' });
                      }}
                    >
                      Choose from list
                    </button>
                  </div>
                )}
              </label>
              <label>
                Price (Rs.)
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 2500"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label>
                Stock quantity
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 50"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </label>
              <label>
                Tag (optional)
                <input
                  type="text"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                />
              </label>
              <label>
                Image {editingId && '(leave blank to keep current)'}
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
              </label>

              <div className="admin-variant-builder">
                <p className="admin-variant-label">
                  Customisation options (optional) — e.g. Size, Colour
                </p>

                {variantGroups.length > 0 && (
                  <ul className="admin-variant-list">
                    {variantGroups.map((g, i) => (
                      <li key={i}>
                        <strong>{g.name}:</strong> {g.options.join(', ')}
                        <button type="button" onClick={() => removeVariantGroup(i)} aria-label={`Remove ${g.name}`}>
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="admin-variant-inputs">
                  <input
                    type="text"
                    placeholder="Group name (e.g. Size)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Options, comma separated (e.g. S, M, L)"
                    value={groupOptionsText}
                    onChange={(e) => setGroupOptionsText(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addVariantGroup}>
                    Add
                  </button>
                </div>
              </div>

              {error && <p className="customize-error">{error}</p>}

              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="admin-table-wrap">
              {loading ? (
                <p>Loading products...</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price (Rs.)</th>
                      <th>Stock</th>
                      <th>Options</th>
                      <th>Tag</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} className={p.active === false ? 'admin-row-inactive' : ''}>
                        <td>
                          {p.image ? (
                            <img
                              src={resolveImageUrl(p.image)}
                              alt={p.name}
                              className="admin-table-thumb"
                            />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{p.name}</td>
                        <td>{p.category}</td>
                        <td>{formatPrice(p.price)}</td>
                        <td className={(p.stock ?? 0) <= LOW_STOCK_THRESHOLD ? 'admin-stock-low' : ''}>
                          {p.stock ?? 0}
                        </td>
                        <td>
                          {p.variants && p.variants.length > 0
                            ? p.variants.map((g) => g.name).join(', ')
                            : '—'}
                        </td>
                        <td>{p.tag || '—'}</td>
                        <td>
                          <span className={`status-badge ${p.active === false ? 'status-cancelled' : 'status-paid'}`}>
                            {p.active === false ? 'inactive' : 'active'}
                          </span>
                        </td>
                        <td className="admin-table-actions">
                          <button type="button" onClick={() => handleEdit(p)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleToggleActive(p)}>
                            {p.active === false ? 'Activate' : 'Deactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="admin-table-wrap">
            {error && <p className="customize-error">{error}</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current stock</th>
                  <th>Update stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const edited = stockEdits[p._id] !== undefined;
                  return (
                    <tr key={p._id} className={p.active === false ? 'admin-row-inactive' : ''}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td className={(p.stock ?? 0) <= LOW_STOCK_THRESHOLD ? 'admin-stock-low' : ''}>
                        {p.stock ?? 0}
                        {(p.stock ?? 0) <= LOW_STOCK_THRESHOLD && ' (low)'}
                      </td>
                      <td>
                        <div className="admin-stock-edit">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={edited ? stockEdits[p._id] : p.stock ?? 0}
                            onChange={(e) => setStockEdits({ ...stockEdits, [p._id]: e.target.value })}
                          />
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={!edited}
                            onClick={() => handleStockSave(p._id)}
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'orders' && (
          <div className="admin-table-wrap">
            {ordersError && <p className="customize-error">{ordersError}</p>}
            {ordersLoading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>{o.orderId}</td>
                      <td>{o.user?.name || o.user?.email || 'Unknown'}</td>
                      <td>
                        {o.items.map((it) => `${it.name} x${it.quantity}`).join(', ')}
                      </td>
                      <td>{formatPrice(o.total)}</td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className={`status-select status-${o.status}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
