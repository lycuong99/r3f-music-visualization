import logo from "./logo.svg";
import "./App.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useBox, Physics, usePlane } from "@react-three/cannon";
import { useEffect, useMemo, useRef, useState } from "react";
import Dots from "./Dots.js";
import { Effects } from "./Effect";
import { DoubleSide } from "three";

const Box = () => {
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 10, 0] }));
  return (
    <mesh
      onClick={() => {
        api.velocity.set(1, 1, 1);
      }}
      ref={ref}
      position={[0, 10, 0]}
    >
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

      const t = elapsedTime - Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 25;
      a =
        1 +
        (Math.sin((dataArray.reduce((acc, c) => acc + c, 0) / dataArray.length) * 0.1) - 0.5) * 2;
      positions.array[i3 + 2] = roundedSquareWave(t, 0.1, a, 1 / 3.8) * 2;

      let barHeight;

      // for (let i = 0; i < bufferLength; i++) {
      //   barHeight = dataArray[i];
      //   console.log(barHeight);
      // }

      // positions.array[i3 + 2] = (roundedSquareWave(t, 0.1, dataArray[10] * 0.01, 1 / 3) * 2) ;
    }

    positions.needsUpdate = true;
    // audioRef.current.play();
  });

  const roundedSquareWave = (t, delta, a, f) => {
    return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
  };

  return (
    <mesh ref={ref} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry attach={"geometry"} args={[50, 50, 50, 50]} />
      <meshLambertMaterial attach="material" color="blue" wireframe={false} side={DoubleSide} />
    </mesh>
  );
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function App() {
  let audioRef = useRef();
  let planeRef = useRef();
  let [analyser, setAnaLyser] = useState(null);

  const handleFileInput = (files) => {
    let audio = audioRef.current;

    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    setAnaLyser(analyser);
    console.log(analyser);
    // analyser.connect(distortion);
    // distortion.connect(audioCtx.destination);
  };

  return (
    <>
      <input
        type="file"
        id="thefile"
        onChange={(e) => {
          handleFileInput(e.target.files);
        }}
        accept="audio/*"
      />
      <audio id="audio" ref={audioRef} controls></audio>

      <Canvas color="#111">
        <color attach="background" args={["black"]} />
        <Dots />
        {/* <Effects /> */}
        {/* <Particles /> */}
        <OrbitControls />
        <Physics>
          <Box />
          <Plane audioRef={audioRef} analyser={analyser} />
          {/* <Particles /> */}
        </Physics>
        {/* <Stars /> */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} />
        <perspectiveCamera
          fov={75}
          aspect={sizes.width / sizes.height}
          position={[0, 0, 100]}
          near={0.1}
          far={1000}
        ></perspectiveCamera>

        <axesHelper />
      </Canvas>
    </>
  );
}

export default App;
