'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { voxelizeGroup } from '@/lib/three/voxelize';

const CUBE_COLOR = '#ffffff';

export default function AtlasStatue() {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    console.log('AtlasStatue: Initializing...');

    // ----- Renderer -----
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance' 
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping; // Disable tone mapping for transparency
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const c = renderer.domElement;
    c.style.position = 'absolute';
    c.style.inset = '0';
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.display = 'block';
    el.appendChild(c);

    // ----- Scene -----
    const scene = new THREE.Scene();
    scene.background = null; // Explicitly transparent
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 80);
    camera.lookAt(0, 0, 0);

    // Ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    console.log('AtlasStatue: Scene ready');

    // ----- Cube shader material (same as grid) -----
    const cubeUniforms = {
      uTime: { value: 0 },
      uBrand: { value: new THREE.Color(CUBE_COLOR) },
    };
    
    const cubeMat = new THREE.ShaderMaterial({
      uniforms: cubeUniforms,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        // Simplex 3D noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
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
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));
          vec4 x_ = floor(j * (1.0 / 7.0));
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = (x_ * 2.0 + 0.5) / 7.0 - 1.0;
          vec4 y = (y_ * 2.0 + 0.5) / 7.0 - 1.0;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a1.xy, h.y);
          vec3 p2 = vec3(a0.zw, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        uniform float uTime;
        attribute vec3 instancePosition;
        attribute float instancePhase;
        varying float vDepth;
        varying float vPhase;
        varying vec3 vNormal;
        
        void main() {
          vec3 gridPos = instancePosition;
          float t = uTime;
          
          // Apply wave displacement
          float n1 = snoise(vec3(gridPos.x * 0.03 + t * 0.015, gridPos.z * 0.05, t * 0.05));
          float n2 = snoise(vec3(gridPos.x * 0.08 + 20.0, gridPos.z * 0.02 - 17.0, t * 0.09)) * 0.5;
          float wave = sin(gridPos.x * 0.08 + t * 0.6) * 0.4 + sin(gridPos.z * 0.11 + t * 0.45) * 0.3;
          
          gridPos.y += (n1 + n2 + wave) * 2.0;
          
          // Apply cube vertex position with slight rotation
          float rot = sin(t * 0.3 + instancePhase * 6.28318) * 0.3;
          mat3 rotMat = mat3(
            cos(rot), 0.0, sin(rot),
            0.0, 1.0, 0.0,
            -sin(rot), 0.0, cos(rot)
          );
          vec3 rotatedPos = rotMat * position;
          vec3 finalPos = gridPos + rotatedPos;
          
          vec4 mv = modelViewMatrix * vec4(finalPos, 1.0);
          gl_Position = projectionMatrix * mv;
          
          vDepth = -mv.z;
          vPhase = instancePhase;
          vNormal = normalize(normalMatrix * (rotMat * normal));
        }
      `,
      fragmentShader: `
        precision highp float;
        
        uniform float uTime;
        uniform vec3 uBrand;
        varying float vDepth;
        varying float vPhase;
        varying vec3 vNormal;
        
        void main() {
          // Simple lighting
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
          float light = dot(vNormal, lightDir) * 0.5 + 0.5;
          
          // Twinkle effect
          float tw = 0.78 + 0.22 * sin(uTime * 0.6 + vPhase * 6.28318);
          float att = clamp(vDepth / 120.0, 0.3, 1.0);
          
          vec3 col = uBrand * light * tw * att * 0.9;
          float alpha = tw * att * 0.8;
          
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    // ----- Statue loading and voxelization -----
    let statueVoxelMesh: THREE.InstancedMesh | null = null;

    const loader = new GLTFLoader();
    loader.load(
      '/models/atlas.glb',
      (gltf) => {
        console.log('AtlasStatue: Statue loaded, voxelizing...');
        const statueGroup = gltf.scene;

        // Scale down the statue to 27.5% of original size (32.4% - 15%)
        statueGroup.scale.setScalar(0.275);
        statueGroup.updateMatrixWorld(true);

        try {
          const voxelData = voxelizeGroup(statueGroup, {
            sampleCount: 15000,
            cubeSize: 0.35,
            jitter: 0.08
          });

          const voxelCubeGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
          
          statueVoxelMesh = new THREE.InstancedMesh(
            voxelCubeGeo,
            cubeMat,
            voxelData.count
          );

          voxelCubeGeo.setAttribute(
            'instancePosition',
            new THREE.InstancedBufferAttribute(voxelData.positions, 3)
          );
          voxelCubeGeo.setAttribute(
            'instancePhase',
            new THREE.InstancedBufferAttribute(voxelData.phases, 1)
          );

          const dummy = new THREE.Object3D();
          for (let i = 0; i < voxelData.count; i++) {
            dummy.position.set(
              voxelData.positions[i * 3],
              voxelData.positions[i * 3 + 1],
              voxelData.positions[i * 3 + 2]
            );
            dummy.updateMatrix();
            statueVoxelMesh.setMatrixAt(i, dummy.matrix);
          }

          statueVoxelMesh.instanceMatrix.needsUpdate = true;
          statueVoxelMesh.position.set(0, -30, 0); // Move statue down more

          scene.add(statueVoxelMesh);
          console.log('AtlasStatue: Voxelized statue added');
        } catch (error) {
          console.error('AtlasStatue: Voxelization failed', error);
        }
      },
      undefined,
      (error) => {
        console.error('AtlasStatue: Failed to load', error);
      }
    );

    // ----- Sizing -----
    const sizeToEl = () => {
      const w = el.clientWidth || 800;
      const h = el.clientHeight || 800;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      return { w, h };
    };
    
    const { w, h } = sizeToEl();

    // ----- Resize -----
    const onSize = () => {
      const { w, h } = sizeToEl();
    };
    const ro = new ResizeObserver(onSize);
    ro.observe(el);

    // ----- Loop -----
    const clock = new THREE.Clock();
    let raf = 0;
    
    const loop = () => {
      const t = clock.getElapsedTime();
      
      cubeUniforms.uTime.value = t;
      
      if (statueVoxelMesh) {
        statueVoxelMesh.rotation.y = Math.sin(t * 0.2) * 0.2;
      }
      
      // Render directly without composer for transparency
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    
    console.log('AtlasStatue: Starting loop');
    raf = requestAnimationFrame(loop);

    // ----- Cleanup -----
    return () => {
      console.log('AtlasStatue: Cleanup');
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (wrapRef.current && c.parentNode === wrapRef.current) {
        wrapRef.current.removeChild(c);
      }
      if (statueVoxelMesh) {
        statueVoxelMesh.geometry.dispose();
        (statueVoxelMesh.material as THREE.Material).dispose();
        scene.remove(statueVoxelMesh);
      }
    };
  }, []);

  return <div ref={wrapRef} className="absolute inset-0 bg-transparent" style={{ backgroundColor: 'transparent' }} />;
}

