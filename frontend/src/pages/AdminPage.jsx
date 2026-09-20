import { useEffect, useState } from 'react';
import { getProducts, resolveImageUrl } from '../services/api';
import { createProduct, updateProduct, deleteProduct } from '../services/adminApi';

const emptyForm = { name: '', category: '', price: '', tag: '' };

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      tag: product.tag || '',
    });
    setFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
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

  return (
    <section className="section admin-page">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Manage Products</h2>
          </div>
        </div>

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
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </label>
            <label>
              Price
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
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
                    <th>Price</th>
                    <th>Tag</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
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
                      <td>${p.price.toFixed(2)}</td>
                      <td>{p.tag || '—'}</td>
                      <td className="admin-table-actions">
                        <button type="button" onClick={() => handleEdit(p)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(p._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
