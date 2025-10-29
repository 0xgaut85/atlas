'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export default function BubbleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance' 
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.3, 2.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 4;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    scene.environment = pmrem.fromScene(roomEnvironment, 0.04).texture;

    // Neutral lights - no color tint
    const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.15);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.25);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    function createBubble({
      radius = 0.5,
      segments = 192,
      color = 0x080808,
      metalness = 1.0,
      roughness = 0.08,
      clearcoat = 1.0,
      clearcoatRoughness = 0.03,
      envMapIntensity = 1.6,
      noiseAmp = 0.10,
      noiseScale = 0.9,
      noiseSpeed = 0.25
    } = {}) {
      const geo = new THREE.SphereGeometry(radius, segments, Math.floor(segments * 0.66));
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        metalness,
        roughness,
        clearcoat,
        clearcoatRoughness,
        envMapIntensity
      });

      const uniforms = {
        uTime: { value: 0 },
        uAmp: { value: noiseAmp },
        uScale: { value: noiseScale },
        uSpeed: { value: noiseSpeed }
      };

      mat.onBeforeCompile = (shader: any) => {
        shader.uniforms.uTime = uniforms.uTime;
        shader.uniforms.uAmp = uniforms.uAmp;
        shader.uniforms.uScale = uniforms.uScale;
        shader.uniforms.uSpeed = uniforms.uSpeed;

        const simplex = /* glsl */`
          vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
          float snoise(vec3 v){
            const vec2  C = vec2(1.0/6.0, 1.0/3.0);
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
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
            vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m*m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
          }
        `;

        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', `
            #include <common>
            uniform float uTime;
            uniform float uAmp;
            uniform float uScale;
            uniform float uSpeed;
            ${simplex}
          `)
          .replace('#include <begin_vertex>', `
            #include <begin_vertex>
            float n = snoise( position * uScale + vec3(0.0, 0.0, uTime * uSpeed) );
            n = 0.5 + 0.5 * n;
            float d = (n * 2.0 - 1.0) * uAmp;
            transformed += normal * d;
          `);

        mat.userData.shader = shader;
      };

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.uniforms = uniforms;
      return mesh;
    }

    const bubbles: THREE.Mesh[] = [];

    function addBubble(opts: any, anchor: THREE.Vector3, swing: { x: number; y: number }, phase = 0, z = 0) {
      const m = createBubble(opts);
      m.position.set(anchor.x, anchor.y, z);
      (m.userData as any).anchor = anchor.clone();
      (m.userData as any).swing = swing;
      (m.userData as any).phase = phase;
      scene.add(m);
      bubbles.push(m);
    }

    // Create 20 small to very small bubbles distributed across the scene
    const bubbleConfigs = [
      // First row - scattered around
      { radius: 0.15, noiseAmp: 0.20, noiseScale: 1.3, noiseSpeed: 0.15, roughness: 0.06, envMapIntensity: 1.8, pos: [-1.2, 0.8, 0.1], swing: { x: 0.04, y: 0.03 }, phase: 0.0 },
      { radius: 0.18, noiseAmp: 0.22, noiseScale: 1.2, noiseSpeed: 0.18, roughness: 0.08, envMapIntensity: 1.6, pos: [-0.6, 0.6, -0.15], swing: { x: 0.05, y: 0.04 }, phase: 0.5 },
      { radius: 0.12, noiseAmp: 0.20, noiseScale: 1.5, noiseSpeed: 0.20, roughness: 0.07, envMapIntensity: 1.5, pos: [0.2, 0.5, 0.05], swing: { x: 0.06, y: 0.05 }, phase: 1.0 },
      { radius: 0.16, noiseAmp: 0.25, noiseScale: 1.1, noiseSpeed: 0.16, roughness: 0.09, envMapIntensity: 1.7, pos: [0.8, 0.7, -0.12], swing: { x: 0.03, y: 0.04 }, phase: 1.5 },
      { radius: 0.14, noiseAmp: 0.22, noiseScale: 1.4, noiseSpeed: 0.19, roughness: 0.08, envMapIntensity: 1.6, pos: [1.3, 0.6, 0.08], swing: { x: 0.05, y: 0.03 }, phase: 2.0 },
      
      // Second row
      { radius: 0.17, noiseAmp: 0.20, noiseScale: 1.2, noiseSpeed: 0.17, roughness: 0.07, envMapIntensity: 1.5, pos: [-1.1, -0.2, -0.10], swing: { x: 0.04, y: 0.05 }, phase: 0.3 },
      { radius: 0.13, noiseAmp: 0.23, noiseScale: 1.3, noiseSpeed: 0.18, roughness: 0.08, envMapIntensity: 1.7, pos: [-0.4, 0.0, 0.12], swing: { x: 0.06, y: 0.04 }, phase: 0.8 },
      { radius: 0.15, noiseAmp: 0.21, noiseScale: 1.4, noiseSpeed: 0.16, roughness: 0.09, envMapIntensity: 1.6, pos: [0.0, -0.1, -0.08], swing: { x: 0.04, y: 0.05 }, phase: 1.2 },
      { radius: 0.19, noiseAmp: 0.24, noiseScale: 1.1, noiseSpeed: 0.19, roughness: 0.07, envMapIntensity: 1.8, pos: [0.6, 0.1, 0.15], swing: { x: 0.05, y: 0.06 }, phase: 1.7 },
      { radius: 0.11, noiseAmp: 0.20, noiseScale: 1.5, noiseSpeed: 0.20, roughness: 0.08, envMapIntensity: 1.5, pos: [1.1, -0.3, -0.05], swing: { x: 0.03, y: 0.04 }, phase: 2.3 },
      
      // Third row
      { radius: 0.16, noiseAmp: 0.22, noiseScale: 1.3, noiseSpeed: 0.17, roughness: 0.06, envMapIntensity: 1.7, pos: [-0.9, -0.7, 0.09], swing: { x: 0.04, y: 0.05 }, phase: 0.6 },
      { radius: 0.12, noiseAmp: 0.20, noiseScale: 1.4, noiseSpeed: 0.18, roughness: 0.08, envMapIntensity: 1.6, pos: [-0.3, -0.6, -0.13], swing: { x: 0.05, y: 0.04 }, phase: 1.1 },
      { radius: 0.18, noiseAmp: 0.23, noiseScale: 1.2, noiseSpeed: 0.19, roughness: 0.07, envMapIntensity: 1.8, pos: [0.3, -0.5, 0.11], swing: { x: 0.06, y: 0.05 }, phase: 1.6 },
      { radius: 0.14, noiseAmp: 0.21, noiseScale: 1.3, noiseSpeed: 0.16, roughness: 0.09, envMapIntensity: 1.6, pos: [0.9, -0.8, -0.07], swing: { x: 0.04, y: 0.05 }, phase: 2.1 },
      { radius: 0.15, noiseAmp: 0.24, noiseScale: 1.5, noiseSpeed: 0.20, roughness: 0.08, envMapIntensity: 1.7, pos: [1.4, -0.5, 0.13], swing: { x: 0.05, y: 0.04 }, phase: 2.6 },
      
      // Fourth row - very small bubbles
      { radius: 0.10, noiseAmp: 0.18, noiseScale: 1.5, noiseSpeed: 0.21, roughness: 0.09, envMapIntensity: 1.5, pos: [-0.7, -1.2, 0.06], swing: { x: 0.03, y: 0.04 }, phase: 0.9 },
      { radius: 0.11, noiseAmp: 0.19, noiseScale: 1.4, noiseSpeed: 0.19, roughness: 0.10, envMapIntensity: 1.6, pos: [-0.1, -1.0, -0.10], swing: { x: 0.05, y: 0.03 }, phase: 1.4 },
      { radius: 0.13, noiseAmp: 0.22, noiseScale: 1.3, noiseSpeed: 0.17, roughness: 0.08, envMapIntensity: 1.7, pos: [0.5, -1.3, 0.08], swing: { x: 0.04, y: 0.06 }, phase: 1.9 },
      { radius: 0.09, noiseAmp: 0.20, noiseScale: 1.6, noiseSpeed: 0.22, roughness: 0.11, envMapIntensity: 1.5, pos: [1.0, -1.1, -0.09], swing: { x: 0.06, y: 0.05 }, phase: 2.4 },
      { radius: 0.12, noiseAmp: 0.21, noiseScale: 1.4, noiseSpeed: 0.18, roughness: 0.09, envMapIntensity: 1.6, pos: [1.5, -1.4, 0.07], swing: { x: 0.03, y: 0.04 }, phase: 2.9 }
    ];

    bubbleConfigs.forEach((config) => {
      addBubble(
        {
          radius: config.radius,
          noiseAmp: config.noiseAmp,
          noiseScale: config.noiseScale,
          noiseSpeed: config.noiseSpeed,
          roughness: config.roughness,
          envMapIntensity: config.envMapIntensity
        },
        new THREE.Vector3(config.pos[0], config.pos[1], config.pos[2]),
        config.swing,
        config.phase,
        config.pos[2]
      );
    });

    const pointer = new THREE.Vector2();
    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handlePointerMove);

    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();

      for (const b of bubbles) {
        const sw = (b.userData as any).swing;
        const a = (b.userData as any).anchor;
        b.position.x = a.x + Math.sin(t * 0.3 + (b.userData as any).phase) * sw.x;
        b.position.y = a.y + Math.cos(t * 0.25 + (b.userData as any).phase) * sw.y;
        b.rotation.y += 0.001;

        if ((b.material as any).userData.shader) {
          (b.material as any).userData.shader.uniforms.uTime.value = t;
        }
      }

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.25, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointer.y * 0.15, 0.04);
      camera.lookAt(0, 0, 0);

      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }

    let animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
