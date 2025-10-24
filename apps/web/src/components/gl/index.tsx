import { Effects } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignette-shader";

const PARTICLE_SIZE_256 = 256;
const PARTICLE_SIZE_512 = 512;
const PARTICLE_SIZE_1024 = 1024;

const CAMERA_POSITION_X = 1.262_978_312_331_458_9;
const CAMERA_POSITION_Y = 2.664_606_471_394_044;
const CAMERA_POSITION_Z = -1.817_899_374_328_891_4;
const CAMERA_FOV = 50;
const CAMERA_NEAR = 0.01;
const CAMERA_FAR = 300;

export const Gl = ({ hovering }: { hovering: boolean }) => {
  const {
    speed,
    focus,
    aperture,
    size,
    noiseScale,
    noiseIntensity,
    timeScale,
    pointSize,
    opacity,
    planeScale,
    vignetteDarkness,
    vignetteOffset,
    useManualTime,
    manualTime,
  } = useControls("Particle System", {
    speed: { value: 1.0, min: 0, max: 2, step: 0.01 },
    noiseScale: { value: 0.6, min: 0.1, max: 5, step: 0.1 },
    noiseIntensity: { value: 0.52, min: 0, max: 2, step: 0.01 },
    timeScale: { value: 1, min: 0, max: 2, step: 0.01 },
    focus: { value: 3.8, min: 0.1, max: 20, step: 0.1 },
    aperture: { value: 1.79, min: 0, max: 2, step: 0.01 },
    pointSize: { value: 10.0, min: 0.1, max: 10, step: 0.1 },
    opacity: { value: 0.8, min: 0, max: 1, step: 0.01 },
    planeScale: { value: 10.0, min: 0.1, max: 10, step: 0.1 },
    size: {
      value: PARTICLE_SIZE_512,
      options: [PARTICLE_SIZE_256, PARTICLE_SIZE_512, PARTICLE_SIZE_1024],
    },
    showDebugPlane: { value: false },
    vignetteDarkness: { value: 1.5, min: 0, max: 2, step: 0.1 },
    vignetteOffset: { value: 0.4, min: 0, max: 2, step: 0.1 },
    useManualTime: { value: false },
    manualTime: { value: 0, min: 0, max: 50, step: 0.01 },
  });
  return (
    <div className="h-full w-full" id="webgl">
      <Canvas
        camera={{
          position: [CAMERA_POSITION_X, CAMERA_POSITION_Y, CAMERA_POSITION_Z],
          fov: CAMERA_FOV,
          near: CAMERA_NEAR,
          far: CAMERA_FAR,
        }}
      >
        {/* <Perf position="top-left" /> */}
        <color args={["#000"]} attach="background" />
        <Particles
          aperture={aperture}
          focus={focus}
          introspect={hovering}
          manualTime={manualTime}
          noiseIntensity={noiseIntensity}
          noiseScale={noiseScale}
          opacity={opacity}
          planeScale={planeScale}
          pointSize={pointSize}
          size={size}
          speed={speed}
          timeScale={timeScale}
          useManualTime={useManualTime}
        />
        <Effects disableGamma multisamping={0}>
          <shaderPass
            args={[VignetteShader]}
            uniforms-darkness-value={vignetteDarkness}
            uniforms-offset-value={vignetteOffset}
          />
        </Effects>
      </Canvas>
    </div>
  );
};
