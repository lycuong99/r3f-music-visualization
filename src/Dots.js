import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useBox, Physics, usePlane } from "@react-three/cannon";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const Dots = () => {
  const ref = useRef(); // Reference to our InstancedMesh

  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3();
    const transform = new THREE.Matrix4();

    const positions = [...Array(10000)].map((_, i) => {
      const position = new THREE.Vector3();
      position.x = (i % 100) - 50;
      position.y = Math.floor(i / 100) - 50;
      position.y += (i % 2) * 0.5;
      position.x += Math.random() * 0.3;
      position.y += Math.random() * 0.3;
      position.z = -10;
      return position;
    });

    const right = new THREE.Vector3(1, 0, 0);
    const distances = positions.map((pos) => pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5);

    return { vec, transform, positions, distances };
  }, []);

  const roundedSquareWave = (t, delta, a, f) => {
    return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
  };

  useFrame(({ clock }) => {
    // const scale = 1 + roundedSquareWave(clock.elapsedTime, 0.1, 1, 0.2) * 0.3;

    for (let i = 0; i < 10000; ++i) {
      let dist = distances[i];

      const t = clock.elapsedTime - dist / 25;

      // Oscillates between -0.4 and +0.4 with period of 3.8 seconds
      const wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1 / 3.8);

      // Scale initial position by our oscillator
      vec.copy(positions[i]).multiplyScalar(wave + 1.3);

      transform.setPosition(vec);
      ref.current.setMatrixAt(i, transform);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  //   useLayoutEffect(() => {
  //     const transform = new THREE.Matrix4();

  //     // ref.current.setMatrixAt(0, transform);

  //     for (let i = 0; i < 10000; ++i) {
  //       let x = (i % 100) - 50; // (-50,50)
  //       let y = Math.floor(i / 100) - 50;

  //       // Offset every other column (hexagonal pattern)
  //       //Thụt vào 0.5 nếu là odd row
  //       y += (i % 2) * 0.5;

  //       // Add some noise
  //       x += Math.random() * 0.3;
  //       y += Math.random() * 0.3;

  //       transform.setPosition(x, y, 0);
  //       ref.current.setMatrixAt(i, transform);
  //     }
  //   }, []);
  return (
    <instancedMesh ref={ref} args={[null, null, 10000]}>
      <circleBufferGeometry args={[0.05]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  );
};
export default Dots;
