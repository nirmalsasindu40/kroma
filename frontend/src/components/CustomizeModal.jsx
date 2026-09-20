import { useRef, useState } from 'react';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB — keeps localStorage happy pre-checkout

export default function CustomizeModal({ product, onClose, onConfirm }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image is too large — please choose one under 3MB.');
      return;
    }

    setError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result); // base64 data URL
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!preview) {
      setError('Upload an image first.');
      return;
    }
    onConfirm({ customDesign: preview, customFileName: fileName });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Customize: {product.name}</h3>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="customize-preview">
            <div className="customize-preview-base">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <path d="M21 15l-5-5-9 9" />
                </svg>
              )}
              {preview && (
                <img src={preview} alt="Your design" className="customize-preview-overlay" />
              )}
            </div>
            <p className="customize-preview-caption">
              {preview ? 'Live preview — your design on this product' : 'Upload an image to see a preview'}
            </p>
          </div>

          <div className="customize-upload">
            <label className="customize-upload-label" htmlFor="design-upload-input">
              {fileName || 'Choose an image (JPG, PNG — under 3MB)'}
            </label>
            <input
              id="design-upload-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {error && <p className="customize-error">{error}</p>}
            <p className="customize-note">
              Your design is only saved to our servers after checkout — until then it stays
              in your browser.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm}>
            Add to Cart with This Design
          </button>
        </div>
      </div>
    </div>
  );
}
