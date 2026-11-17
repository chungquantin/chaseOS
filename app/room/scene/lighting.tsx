"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useMemo } from "react";
import { Object3D } from "three";
import { Bloom, EffectComposer, N8AO, TiltShift2, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { Mood } from "../store";
import { WINDOW } from "../layout";

/**
 * Key light comes from outside the left wall, so it only enters through the
 * window: a warm sunbeam by day, a cool moonbeam by night. Everything else is
 * soft fill (hemisphere + environment) plus practical lights in the room.
 */
export function Lighting({ mood }: { mood: Mood }) {
  const day = mood === "day";
  const wz = (WINDOW.z0 + WINDOW.z1) / 2;
  return (
    <>
      <ambientLight intensity={day ? 0.32 : 0.05} color={day ? "#ffe6cc" : "#5b6bb8"} />
      <hemisphereLight args={[day ? "#fff0dc" : "#3c4a8c", day ? "#9a6a4a" : "#120c1c", day ? 1.15 : 0.3]} />

      {/* sun / moon through the window */}
      <directionalLight
        position={[-9, 7.2, wz + 3.2]}
        intensity={day ? 5 : 0.9}
        color={day ? "#ffc98f" : "#8aa2ff"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={4}
        shadow-blurSamples={8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-far={40}
      />
      {/* soft front fill so furniture faces read; no shadow */}
      <directionalLight position={[8, 9, 7]} intensity={day ? 0.75 : 0.12} color={day ? "#ffe9d6" : "#8f9cff"} />

      {/* practical lights for night: warm pools inside, spilling out */}
      {!day && <NightPracticals />}

      <Environment resolution={128} frames={1} environmentIntensity={day ? 0.6 : 0.2}>
        <Lightformer form="rect" intensity={2} color="#fff3e6" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd8b0" position={[-6, 3, 0]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#d8e4ff" position={[6, 3, 6]} rotation-y={-Math.PI / 4} scale={[6, 4, 1]} />
      </Environment>
    </>
  );
}

/**
 * Night: a warm pendant over the table, a desk glow, and a spotlight that
 * shines out through the window so light pools on the ground outside —
 * the "lit diorama at night" look.
 */
function NightPracticals() {
  const windowTarget = useMemo(() => {
    const o = new Object3D();
    o.position.set(-9, -0.4, (WINDOW.z0 + WINDOW.z1) / 2 + 0.6);
    return o;
  }, []);
  const tableTarget = useMemo(() => {
    const o = new Object3D();
    o.position.set(0.6, 0, 0.6);
    return o;
  }, []);
  return (
    <>
      <primitive object={windowTarget} />
      <primitive object={tableTarget} />
      {/* pendant over the jobs table */}
      <spotLight
        position={[0.6, 4.2, 0.6]}
        target={tableTarget}
        angle={0.75}
        penumbra={0.85}
        intensity={70}
        distance={0}
        decay={2}
        color="#ffbf73"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />
      {/* interior light escaping through the window onto the ground */}
      <spotLight
        position={[-2.2, 2.3, (WINDOW.z0 + WINDOW.z1) / 2]}
        target={windowTarget}
        angle={0.55}
        penumbra={0.6}
        intensity={95}
        distance={0}
        decay={2}
        color="#ffc27d"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />
      <pointLight position={[-0.25, 1.6, -3.9]} color="#7d8bff" intensity={3.2} distance={0} decay={2} />
      <pointLight position={[3.05, 1.2, -3.9]} color="#818cf8" intensity={2.2} distance={0} decay={2} />
    </>
  );
}

export function Effects({ mood, quality }: { mood: Mood; quality: "high" | "low" }) {
  const day = mood === "day";
  const bloom = <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={day ? 0.45 : 1.4} radius={0.75} />;
  const tone = <ToneMapping mode={ToneMappingMode.AGX} />;
  // the house is the subject: darken the frame's edges and blur them a little
  const vignette = <Vignette offset={0.22} darkness={day ? 0.5 : 0.82} />;
  // low: skip ambient occlusion and MSAA, the two most expensive passes
  if (quality === "low") {
    return (
      <EffectComposer multisampling={0}>
        {bloom}
        {tone}
        {vignette}
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        aoRadius={0.45}
        distanceFalloff={0.5}
        intensity={day ? 2.4 : 3}
        quality="medium"
        halfRes
        color={day ? "#3b1d0e" : "#0d0820"}
      />
      {bloom}
      <TiltShift2 blur={0.12} taper={0.55} start={[0, 0.5]} end={[1, 0.5]} samples={8} />
      {tone}
      {vignette}
    </EffectComposer>
  );
}
