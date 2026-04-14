// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const vertexShader = `
uniform float uTime;
uniform float uSeed;
uniform float uAmplitude;
uniform float uFrequency;
varying vec3 vWorldPosition;
varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDisplacement;

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(
    permute(
      permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0)
    )
    + i.x + vec4(0.0, i1.x, i2.x, 1.0)
  );

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec3 pos = position;
  vec3 direction = normalize(position);
  float primaryNoise = snoise(direction * uFrequency + vec3(uSeed, uTime * 0.18, uSeed * 0.5));
  float secondaryNoise = snoise(direction * (uFrequency * 1.85) - vec3(uTime * 0.12, uSeed * 0.25, uTime * 0.09));
  float fineNoise = snoise(direction * (uFrequency * 3.4) + vec3(uTime * 0.24, uSeed * 1.7, uTime * 0.06));
  float displacement = primaryNoise * uAmplitude + secondaryNoise * (uAmplitude * 0.55) + fineNoise * (uAmplitude * 0.25);

  pos += normal * displacement;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec3 normalW = normalize(mat3(modelMatrix) * normal);

  vWorldPosition = worldPosition.xyz;
  vNormalW = normalW;
  vViewDir = normalize(cameraPosition - worldPosition.xyz);
  vDisplacement = displacement;

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uRefractionIndex;
uniform vec3 uTintA;
uniform vec3 uTintB;
uniform vec3 uTintC;
uniform float uOpacity;
varying vec3 vWorldPosition;
varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDisplacement;

void main() {
  vec3 normal = normalize(vNormalW);
  vec3 viewDir = normalize(vViewDir);
  vec3 lightDirA = normalize(vec3(-0.35, 0.92, 0.45));
  vec3 lightDirB = normalize(vec3(0.65, -0.18, 0.88));

  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
  vec3 refracted = refract(-viewDir, normal, 1.0 / uRefractionIndex);

  float gradient = 0.5 + 0.5 * normal.y;
  vec3 baseColor = mix(uTintA, uTintB, gradient);

  vec3 iridescence = 0.5 + 0.5 * cos(
    vec3(0.0, 2.0, 4.0)
    + fresnel * 6.28318
    + vDisplacement * 11.0
    + uTime * 0.42
    + refracted.z * 3.5
  );
  vec3 glassColor = mix(baseColor, uTintC, fresnel * 0.72);
  glassColor += iridescence * 0.18;

  float specA = pow(max(dot(reflect(-lightDirA, normal), viewDir), 0.0), 64.0);
  float specB = pow(max(dot(reflect(-lightDirB, normal), viewDir), 0.0), 36.0);
  float internalGlow = 0.5 + 0.5 * sin((refracted.x + refracted.y + refracted.z + uTime * 0.35) * 10.0);
  vec3 highlight = vec3(1.0, 0.99, 1.0) * specA + vec3(0.78, 0.88, 1.0) * specB;
  vec3 caustic = mix(uTintB, uTintC, internalGlow) * 0.18;

  vec3 color = glassColor + highlight + caustic * (0.35 + fresnel * 0.65);
  color += fresnel * 0.12;

  float alpha = uOpacity + fresnel * 0.48 + specA * 0.18 + specB * 0.12;
  gl_FragColor = vec4(color, clamp(alpha, 0.16, 0.92));
}
`;

function LiquidBlob({
  position,
  scale,
  seed,
  amplitude,
  frequency,
  speed,
  tints,
}) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSeed: { value: seed },
    uAmplitude: { value: amplitude },
    uFrequency: { value: frequency },
    uRefractionIndex: { value: 1.17 },
    uTintA: { value: new THREE.Color(tints[0]) },
    uTintB: { value: new THREE.Color(tints[1]) },
    uTintC: { value: new THREE.Color(tints[2]) },
    uOpacity: { value: 0.22 },
  }), [amplitude, frequency, seed, tints]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * speed;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * 0.18;
      meshRef.current.rotation.x = Math.sin(elapsed * 0.12) * 0.18;
      meshRef.current.position.y = position[1] + Math.sin(elapsed * 0.3) * 0.18;
      meshRef.current.position.x = position[0] + Math.cos(elapsed * 0.17) * 0.12;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1.45, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

function LiquidGlassScene() {
  return (
    <>
      <fog attach="fog" args={['#050914', 5.5, 12]} />
      <LiquidBlob
        position={[-1.9, 0.45, -0.6]}
        scale={1.6}
        seed={0.17}
        amplitude={0.3}
        frequency={1.9}
        speed={0.9}
        tints={['#f6fbff', '#7ea4ff', '#b58bff']}
      />
      <LiquidBlob
        position={[2.15, -1.15, -1.4]}
        scale={0.92}
        seed={1.73}
        amplitude={0.22}
        frequency={2.4}
        speed={1.15}
        tints={['#eef7ff', '#89c7ff', '#9a84ff']}
      />
    </>
  );
}

function StaticBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(104,144,255,0.22),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_80%_78%,rgba(139,92,246,0.18),transparent_26%),linear-gradient(180deg,#030611_0%,#040918_42%,#060d1f_100%)]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,6,17,0.1)_56%,rgba(3,6,17,0.42)_100%)]" />
    </>
  );
}

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Prevent background rendering failures from taking down the entire app.
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

function canCreateWebGLContext() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'default',
    });

    renderer.dispose();
    return true;
  } catch {
    return false;
  }
}

export default function LiquidGlassBackground() {
  const [shouldRenderCanvas, setShouldRenderCanvas] = useState(false);

  useEffect(() => {
    setShouldRenderCanvas(canCreateWebGLContext());
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" aria-hidden="true">
      <StaticBackdrop />
      {shouldRenderCanvas ? (
        <CanvasErrorBoundary>
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
            camera={{ position: [0, 0, 6], fov: 34 }}
          >
            <LiquidGlassScene />
          </Canvas>
        </CanvasErrorBoundary>
      ) : null}
    </div>
  );
}
