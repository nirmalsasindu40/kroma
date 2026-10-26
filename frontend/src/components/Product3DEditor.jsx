
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Canvas, createPortal } from "@react-three/fiber";
import {
  Bounds,
  Environment,
  Grid,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { SRGBColorSpace, DoubleSide } from "three";

const MAX_DESIGN_SIZE = 3 * 1024 * 1024;
const DESIGN_WIDTH = 0.23;
const DESIGN_POSITION = [0, 1.38, -0.153];
const SHIRT_COLOR = "#85868a";

function ShirtDesign({ src }) {
  const configureTexture = useCallback((texture) => {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
  }, []);
  const texture = useTexture(src, configureTexture);
  const aspectRatio = texture.image.width / texture.image.height;
  const width = Math.min(DESIGN_WIDTH, DESIGN_WIDTH * aspectRatio);
  const height = width / aspectRatio;

  return (
    <mesh position={DESIGN_POSITION} renderOrder={1}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        side={DoubleSide}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function TshirtModel({ design, onLoaded }) {
  const { scene } = useGLTF("/models/tshirt.glb");
  const model = useMemo(() => {
    const clonedScene = scene.clone(true);
    clonedScene.traverse((object) => {
      if (object.isMesh) {
        object.material = Array.isArray(object.material)
          ? object.material.map((material) => material.clone())
          : object.material.clone();
      }
    });
    return clonedScene;
  }, [scene]);
  const designAnchor = model.getObjectByName("Body_Back_Node_5");

  useEffect(() => {
    onLoaded();
  }, [model, onLoaded]);

  useEffect(() => {
    model.traverse((object) => {
      if (object.isMesh) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.color?.set(SHIRT_COLOR));
      }
    });
  }, [model]);

  return (
    <Bounds fit clip margin={1.3}>
      <primitive
        object={model}
        rotation={[0, 0, 0]}
      />
      {design && designAnchor && createPortal(
        <ShirtDesign src={design} />,
        designAnchor
      )}
    </Bounds>
  );
}

class ModelErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Failed to load the 3D T-shirt model:", error);
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export default function Product3DEditor() {
  const [design, setDesign] = useState(null);
  const [designError, setDesignError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [modelStatus, setModelStatus] = useState("loading");
  const handleModelLoaded = useCallback(() => setModelStatus("ready"), []);
  const handleModelError = useCallback(() => setModelStatus("error"), []);

  const handleDesignChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setDesignError("Choose an image file.");
      return;
    }
    if (file.size > MAX_DESIGN_SIZE) {
      setDesignError("Choose an image smaller than 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setDesignError("The selected image could not be read. Please try again.");
        return;
      }
      setDesign({ src: reader.result, name: file.name });
      setDesignError("");
    };
    reader.onerror = () => {
      setDesignError("The selected image could not be read. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDesign = () => {
    setDesign(null);
    setDesignError("");
    setFileInputKey((key) => key + 1);
  };

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          width: "100%",
          height: 500,
          background: "#3C3C3C",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {modelStatus !== "ready" && (
          <div
            role={modelStatus === "error" ? "alert" : "status"}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "grid",
              placeItems: "center",
              padding: 24,
              color: modelStatus === "error" ? "#ff8a80" : "#f5f5f5",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            {modelStatus === "error"
              ? "3D model could not be loaded. Check public/models/tshirt.glb."
              : "Loading 3D T-shirt..."}
          </div>
        )}
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} />

          <Grid
            args={[10, 10]}
            position={[0, -0.55, 0]}
            cellSize={0.2}
            cellThickness={0.55}
            cellColor="#555555"
            sectionSize={1}
            sectionThickness={1}
            sectionColor="#777777"
            fadeDistance={8}
            fadeStrength={1}
            infiniteGrid
          />

          <ModelErrorBoundary onError={handleModelError}>
            <Suspense fallback={null}>
              <TshirtModel
                design={design?.src}
                onLoaded={handleModelLoaded}
              />
              <Environment preset="studio" />
            </Suspense>
          </ModelErrorBoundary>

          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom
            minDistance={0.8}
            maxDistance={8}
          />
        </Canvas>
      </div>

      <section className="product-3d-controls" aria-label="T-shirt design controls">
        <div className="product-3d-upload">
          <div className="product-3d-upload-heading">
            <div>
              <h2>Add your design</h2>
              <p>Upload artwork to preview it on the front of your T-shirt.</p>
            </div>
            <span className="product-3d-file-limit">MAX 3 MB</span>
          </div>
          <input
            key={fileInputKey}
            className="product-3d-file-input"
            id="shirt-design"
            type="file"
            accept="image/*"
            onChange={handleDesignChange}
          />
          {design && (
            <div className="product-3d-selected-file">
              <span className="product-3d-file-name" title={design.name}>{design.name}</span>
              <button
                type="button"
                className="product-3d-remove-design"
                onClick={handleRemoveDesign}
              >
                Remove design
              </button>
            </div>
          )}
          {designError && (
            <p className="product-3d-error" role="alert">{designError}</p>
          )}
        </div>

        <p className="product-3d-instructions">
          <span aria-hidden="true">↻</span>
          Drag the model to rotate it. Scroll to zoom in or out.
        </p>
      </section>
    </div>
  );
}

useGLTF.preload("/models/tshirt.glb");
