import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";

import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "meshline";
import { Vector3 } from "three";

extend({ MeshLine, MeshLineMaterial });
const roundedSquareWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
};

const Line = ({ points, width, color, order }) => {
  const { size } = useThree();
  const { dataArray, bufferLength, datas } = useContext(MusicVisualizerContext);

  // const simplex = useMemo(() => new SimplexNoise());
  const frequency = 1;
  const amplitude = 5;

  const lineRef = useRef();

  const noise2D = createNoise2D();

  useFrame(({ clock }) => {
    let lines = [];
    let data = datas[order];
    let z = -order * 5;

    for (let i = 0; i < bufferLength; i++) {
      let x = i;
      let y = Math.abs(
        roundedSquareWave(clock.elapsedTime * (z + 1), 0.1, dataArray[i] / 10, 1 / 60)
      );

      let p = new THREE.Vector3(x, y, z);
      lines.push(p);
    }

    lines = [
      new THREE.Vector3(-2, 0, z),
      new THREE.Vector3(-1, 0, z),
      ...lines,
      new THREE.Vector3(bufferLength, 0, z),
      new THREE.Vector3(bufferLength + 1, 0, z),
    ];

    lineRef.current.setPoints(lines);
  });
  return (
    <mesh raycast={MeshLineRaycast}>
      <meshLine attach="geometry" ref={lineRef} />
      <meshLineMaterial
        attach="material"
        transparent
        depthTest={false}
        lineWidth={width}
        color={color}
        side={THREE.DoubleSide}
        // dashArray={1}
        // dashRatio={1}
        // resolution={new THREE.Vector2(size.width, size.height)}
        // near={1}
        // far={1000}
        sizeAttenuation={1}
      />
    </mesh>
  );
};

const Lines = () => {
  const { analyserRef, dataArray, bufferLength, update } = useContext(MusicVisualizerContext);

  useFrame(() => {
    update();
    // console.log(dataArray);
  });

  return (
    <>
      <Line order={0} width={0.5} color={"orange"} />
      <Line order={1} width={0.5} color={"orange"} />
      <Line order={2} width={0.5} color={"orange"} />
      <Line order={3} width={0.5} color={"orange"} />
      <Line order={4} width={0.5} color={"orange"} />
      <Line order={5} width={0.5} color={"orange"} />
      <Line order={6} width={0.5} color={"orange"} />
      <Line order={7} width={0.5} color={"orange"} />
    </>
  );
};

export const MusicVisualizerContext = createContext(null);

const MusicVisualizer = () => {
  // let audio = null;
  let audioRef = useRef();
  let analyserRef = useRef();

  let [analyser, setAnaLyser] = useState(null);

  useLayoutEffect(() => {}, []);

  const { bufferLength, dataArray, datas } = useMemo(() => {
    // if (!audioRef.current) return {};

    let audio = new Audio("/m1.mp4");
    // let audio = audioRef.current;

    let context = new AudioContext();
    let analyser = context.createAnalyser();

    let src = context.createMediaElementSource(audio);
    src.connect(analyser);

    analyser.fftSize = 256;
    analyser.connect(context.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // setAnaLyser(analyser);
    analyserRef.current = analyser;
    audioRef.current = audio;

    let datas = [
      [...dataArray],
      [...dataArray],
      [...dataArray],
      [...dataArray],
      [...dataArray],
      [...dataArray],
      [...dataArray],
      [...dataArray],
    ];

    return { bufferLength, dataArray, datas };
  });

  const startAudio = () => {
    if (audioRef.current) audioRef.current.play();
  };

  const update = () => {
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(dataArray);
      // analyserRef.current.getByteTimeDomainData(dataArray);
      // datas.push(dataArray);
      datas.pop();
      // datas.shift();
      datas.unshift(dataArray);
    }
  };

  const pauseAudio = () => {
    let audio = audioRef.current;
    audio.pause();
  };

  return (
    <>
      <MusicVisualizerContext.Provider
        value={{ analyserRef, dataArray, bufferLength, update, datas }}
      >
        <button onClick={startAudio}>START</button>
        <button onClick={pauseAudio}>PAUSE</button>
        {/* <audio ref={audioRef} /> */}
        <Canvas style={{ heigh: "100vh", width: "100vw" }}>
          <color attach={"background"} args={["#f2f2f2"]} />
          <ambientLight intensity={0.3} />
          <Lines />

          <OrbitControls />
          <axesHelper />

          <gridHelper args={[200, 20]} />
        </Canvas>
      </MusicVisualizerContext.Provider>
    </>
  );
};

export default MusicVisualizer;
