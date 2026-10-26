
import Product3DEditor from './components/Product3DEditor';
import './App.css';

export default function Test3DPage() {
  return (
    <main
      style={{
        maxWidth: '1000px',
        margin: '40px auto',
        padding: '20px',
      }}
    >
      <h1>3D T-Shirt Preview</h1>

      <p>
        Drag your mouse to rotate the T-shirt.
        Scroll to zoom in and out.
      </p>

      <Product3DEditor />
    </main>
  );
}
