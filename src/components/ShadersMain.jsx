import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
// import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

const Scene = ({ vertex, fragment }) => {
  const meshRef = useRef();

  // Set the initial aspect ratio to fit the plane
  //   const [aspectRatio, setAspectRatio] = useState(
  //     window.innerWidth / window.innerHeight
  //   );

  //   useEffect(() => {
  //     const handleResize = () => {
  //       setAspectRatio(window.innerWidth / window.innerHeight);
  //     };

  //     window.addEventListener("resize", handleResize);
  //     return () => window.removeEventListener("resize", handleResize);
  //   }, []);

  // Load the noise texture and update the shader uniform
  //   const noiseTexture = useTexture("/images/noise2.png");
  useFrame((state) => {
    const { width, height } = state.size;
    // Update the iResolution uniform with the current canvas size
    meshRef.current.material.uniforms.iResolution.value.set(width, height);

    let time = state.clock.getElapsedTime();

    // start from 20 to skip first 20 seconds ( optional )
    meshRef.current.material.uniforms.iTime.value = time + 20;

    // Update mesh scale to cover the entire screen
    const aspectRatio = width / height;
    meshRef.current.scale.set(
      aspectRatio > 1 ? aspectRatio : 1,
      aspectRatio > 1 ? 1 : 1 / aspectRatio,
      1
    );
  });

  // Define the shader uniforms with memoization to optimize performance
  const uniforms = useMemo(
    () => ({
      iTime: {
        type: "f",
        value: 1.0,
      },
      iResolution: {
        type: "v2",
        value: new THREE.Vector2(8, 8),
      },
      //   iChannel0: {
      //     type: "t",
      //     value: noiseTexture,
      //   },
    }),
    []
  );

  return (
    <mesh ref={meshRef}>
      {/* Set plane geometry to match the aspect ratio of the viewport */}
      <planeGeometry args={[8, 8]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

function ShadersMain() {
  // State variables to store the vertex and fragment shaders as strings
  const [vertex, setVertex] = useState("");
  const [fragment, setFragment] = useState("");

  // Fetch the shaders once the component mounts
  useEffect(() => {
    // fetch the vertex and fragment shaders from public folder
    axios.get("/shaders/vertexShader.glsl").then((res) => setVertex(res.data));
    axios
      .get("/shaders/voxeltunnel/fragmentShader.glsl")
      .then((res) => setFragment(res.data));
  }, []);

  // If the shaders are not loaded yet, return null (nothing will be rendered)
  if (vertex == "" || fragment == "") return null;
  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <Scene vertex={vertex} fragment={fragment} />
    </Canvas>
  );
}

export default ShadersMain;
