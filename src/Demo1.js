import logo from "./logo.svg";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import { useBox, Physics, usePlane } from "@react-three/cannon";
import { useEffect, useMemo, useRef, useState } from "react";
import Dots from "./Dots.js";
import { Effects } from "./Effect";
import { DoubleSide } from "three";
import { createNoise3D, createNoise2D, createNoise4D } from "simplex-noise";
import { Button } from "@mui/material";

const Box = () => {
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 10, 0] }));
  return (
    <mesh
      onClick={() => {
        api.velocity.set(1, 1, 1);
      }}
      ref={ref}
      position={[0, 10, 0]}>
      <boxBufferGeometry attach="geometry" />
      <meshLambertMaterial attach="material" color="hotpink" />
    </mesh>
  );
};

const Particles = () => {
  const count = 500;

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2;
      sizes[i] = Math.random() < 0.03 ? 2 : 1;
    }

    return [positions, sizes];
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attachObject={["attributes", "position"]}
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <pointsMaterial size={0.2} />
    </points>
  );
};

const Plane = ({ audioRef, analyser }) => {
  const [ref] = usePlane((e) => {
    return { rotation: [-Math.PI / 2, 0, 0] };
  });

  useEffect(() => {
    let positions = ref.current.geometry.attributes.position;
    let count = positions.count;
  }, []);

  const { dataArray, bufferLength } = useMemo(() => {
    console.log(analyser);
    let dataArray = null;
    let bufferLength = 0;

    if (!audioRef.current || !analyser) return { dataArray, bufferLength };

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    return { dataArray, bufferLength };
  }, [analyser]);
  let a = 2;

  const noise2D = createNoise2D();
  const noise3D = createNoise3D();
  const noise4D = createNoise4D();

  useFrame((state) => {
    if (!audioRef.current || !analyser) return;

    let elapsedTime = state.clock.elapsedTime;
    let positions = ref.current.geometry.attributes.position;
    let count = positions.count;

    analyser.getByteFrequencyData(dataArray);

    // console.log(dataArray);

    for (let i = 0; i < count; i++) {
      let i3 = i * 3;
      // console.log(i3);

      const x = positions.array[i3];
      const y = positions.array[i3 + 1];
      const z = positions.array[i3 + 2];
      let avg = dataArray.reduce((acc, c) => acc + c, 0) / dataArray.length;
      let t2 = dataArray[(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 100) * (dataArray.length - 1)];
      const t = elapsedTime - Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 2;

      a = 1 + (Math.sin(avg * 0.11) - 0.5) * 3;

      // positions.array[i3 + 2] = roundedSquareWave(t, 0.1, a, 1 / 10) * 1;
      let frequency = 1 / 18.8;
      let amplitude = 1.5;
      // positions.array[i3 + 2] = noise4D(x * frequency, y * frequency, avg * 0.1, t) * amplitude;
      // for (let i = 0; i < bufferLength; i++) {
      //   barHeight = dataArray[i];
      //   console.log(barHeight);
      // }

      positions.array[i3 + 2] = roundedSquareWave(t, 0.1, a, 1 / 3);
    }

    positions.needsUpdate = true;
    // audioRef.current.play();
  });

  const roundedSquareWave = (t, delta, a, f) => {
    return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
  };

  return (
    <mesh ref={ref} position={[100, 100, 100]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry attach={"geometry"} args={[30, 30, 50, 50]} />
      <meshLambertMaterial attach="material" color="blue" wireframe={true} side={DoubleSide} />
    </mesh>
  );
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function Demo1() {
  let audioRef = useRef();
  let planeRef = useRef();
  let [analyser, setAnaLyser] = useState(null);

  // const handleFileInput = (files) => {
  //   let audio = audioRef.current;
  //   // let f = new File([""], "/m1.mp4");
  //   audio.src = URL.createObjectURL(files[0]);
  //   audio.load();
  //   audio.play();

  //   const audioCtx = new AudioContext();
  //   const analyser = audioCtx.createAnalyser();

  //   const source = audioCtx.createMediaElementSource(audio);
  //   source.connect(analyser);
  //   analyser.connect(audioCtx.destination);

  //   setAnaLyser(analyser);
  //   console.log(analyser);
  //   // analyser.connect(distortion);
  //   // distortion.connect(audioCtx.destination);
  // };
  const start = () => {
    let audio = audioRef.current;
    audio.play();
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    setAnaLyser(analyser);
  };
  return (
    <>
      <Button onClick={() => start()} variant="contained" style={{ zIndex: 2, margin: 10 }}>
        Start
      </Button>
      {/* <Button variant="contained" component="label" style={{ zIndex: 2, margin: 10 }}>
        Choose Audio File
        <input
          hidden
          type="file"
          id="thefile"
          onChange={(e) => {
            handleFileInput(e.target.files);
          }}
          accept="audio/*"
        />
      </Button> */}

      <audio id="audio" ref={audioRef} controls>
        <source src="/m1.mp4" />
      </audio>

      <div id="canvas">
        <Canvas color="#111">
          <color attach="background" args={["black"]} />
          <Dots />
          {/* <Effects /> */}
          {/* <Particles /> */}
          <OrbitControls position={[100, 20, 100]} />
          <Physics>
            {/* <Box /> */}
            <Plane audioRef={audioRef} analyser={analyser} />
            {/* <Particles /> */}
          </Physics>

          <ambientLight intensity={0.5} />
          <spotLight position={[10, 15, 10]} angle={0.3} />
          <PerspectiveCamera
            makeDefault
            zoom={1}
            fov={75}
            aspect={sizes.width / sizes.height}
            position={[0, 20, 20]}
            rotateX={Math.PI / 10}
            near={0.1}
            far={2000}
          />

          {/* <axesHelper /> */}
        </Canvas>
      </div>
    </>
  );
}

export default Demo1;
