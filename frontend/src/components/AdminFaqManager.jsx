import { useEffect, useState } from 'react';
import { createFaq, getFaqs, updateFaq } from '../services/communityApi';

const EMPTY_FORM = { question: '', answer: '' };

export default function AdminFaqManager() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadFaqs = () => {
    getFaqs()
      .then(setFaqs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await updateFaq(editingId, form);
        setSuccess('Q&A updated.');
      } else {
        await createFaq(form);
        setSuccess('Q&A added.');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadFaqs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-faq-manager">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h4>{editingId ? 'Edit Q&A' : 'Add a Q&A'}</h4>
        <label>
          Question
          <input
            type="text"
            required
            maxLength={180}
            value={form.question}
            onChange={(event) => setForm({ ...form, question: event.target.value })}
          />
        </label>
        <label>
          Answer
          <textarea
            required
            maxLength={2000}
            rows="5"
            value={form.answer}
            onChange={(event) => setForm({ ...form, answer: event.target.value })}
          />
        </label>
        {error && <p className="customize-error" role="alert">{error}</p>}
        {success && <p className="community-success" role="status">{success}</p>}
        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add Q&A'}
          </button>
          {editingId && (
            <button className="btn btn-secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-faq-list">
        <h4 className="admin-section-title">Store questions</h4>
        {loading ? (
          <p>Loading Q&amp;As...</p>
        ) : (
          faqs.map((faq) => (
            <article className="admin-faq-card" key={faq._id}>
              <div>
                <h5>{faq.question}</h5>
                <p>{faq.answer}</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => {
                  setEditingId(faq._id);
                  setForm({ question: faq.question, answer: faq.answer });
                  setError('');
                  setSuccess('');
                }}
              >
                Edit
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
