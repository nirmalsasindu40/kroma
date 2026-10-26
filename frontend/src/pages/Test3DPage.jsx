
import Product3DEditor from "../components/Product3DEditor";

export default function Test3DPage() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1>3D T-shirt Customizer</h1>
      

      <Product3DEditor />
    </main>
  );
}
