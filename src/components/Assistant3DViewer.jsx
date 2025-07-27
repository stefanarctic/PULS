import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const MODEL_PATH = "/Modele Asistent/bebu.glb";

function Model() {
  const { scene } = useGLTF(MODEL_PATH);
  return <primitive object={scene} scale={2.2} />;
}

const Assistant3DViewer = () => (
  <Canvas style={{ width: "100%", height: "100%", background: "transparent" }} camera={{ position: [0, 0, 4] }}>
    <ambientLight intensity={0.7} />
    <directionalLight position={[5, 5, 5]} intensity={0.7} />
    <Suspense fallback={null}>
      <Model />
    </Suspense>
    <OrbitControls enablePan={false} enableZoom={true} />
  </Canvas>
);

export default Assistant3DViewer; 