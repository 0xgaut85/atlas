'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { voxelizeGroup } from '@/lib/three/voxelize';

const BRAND = '#ff0000';
const CUBE_COLOR = '#ffffff'; // White color for cubes
const TARGET_STATUE_SIZE = 40; // Size to scale the statue to

type DisplayMode = 'cubes' | 'statue' | 'statue-voxel';

interface AtlasHeroProps {
  mode?: DisplayMode;
}

export default function AtlasHero({ mode = 'cubes' }: AtlasHeroProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    console.log('AtlasHero: Initializing...');

    // ----- Renderer -----
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Style canvas
    const c = renderer.domElement;
    c.style.position = 'absolute';
    c.style.inset = '0';
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.display = 'block';
    el.appendChild(c);

    console.log('AtlasHero: Renderer ready');

    // ----- Scenes -----
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(new THREE.Color('#191304'), 0.018);

    const backScene = new THREE.Scene();
    const backCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Camera
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 2000);
    camera.position.set(0, 26, 112);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    console.log('AtlasHero: Scene ready');

    // ----- Background gradient -----
    const gradientUniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uBrand: { value: new THREE.Color(BRAND) },
    };
    
    const gradientMat = new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: gradientUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uBrand;
        
        void main() {
          vec2 uv = vUv;
          
          // Diagonal gradient
          float diag = clamp((uv.x - uv.y) * 0.9 + 0.55, 0.0, 1.0);
          vec3 col0 = vec3(0.10, 0.08, 0.03);
          vec3 col1 = vec3(0.18, 0.14, 0.05);
          vec3 lin = mix(col0, col1, diag);
          
          // Off-center radial glow
          vec2 center = vec2(0.30, 0.41);
          float dist = distance(uv, center);
          float rad = smoothstep(0.95, 0.0, dist * 1.25);
          vec3 glow = pow(uBrand, vec3(2.2)) * (0.15 + 0.65 * rad);
          
          // Animated grain
          float grain = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233)) + uTime * 0.45) * 43758.5453) * 0.03;
          
          vec3 col = mix(vec3(0.03, 0.02, 0.01), lin + glow + grain, 0.85);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    
    const gradientQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), gradientMat);
    backScene.add(gradientQuad);

    console.log('AtlasHero: Background ready');

    // ----- Grid geometry for particles - Increased density -----
    const GRID_W = 300, GRID_D = 200, SEG_X = 384, SEG_Z = 256;
    const gridGeo = new THREE.PlaneGeometry(GRID_W, GRID_D, SEG_X, SEG_Z);
    gridGeo.rotateX(-Math.PI / 2);

    console.log('AtlasHero: Grid geometry ready');

    // ----- Node cubes (at every grid vertex) -----
    const pos = gridGeo.attributes.position as THREE.BufferAttribute;
    const numCubes = pos.count;
    
    // Create instanced mesh with small cubes
    const cubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
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
          
          // Apply wave displacement - More waves, faster movement
          float n1 = snoise(vec3(gridPos.x * 0.04 + t * 0.025, gridPos.z * 0.06, t * 0.08));
          float n2 = snoise(vec3(gridPos.x * 0.12 + 20.0, gridPos.z * 0.04 - 17.0, t * 0.15)) * 0.6;
          float n3 = snoise(vec3(gridPos.x * 0.06 - 30.0, gridPos.z * 0.08 + 25.0, t * 0.12)) * 0.4;
          
          // Multiple wave layers - faster and more complex
          float wave1 = sin(gridPos.x * 0.12 + t * 1.0) * 0.5;
          float wave2 = sin(gridPos.z * 0.15 + t * 0.85) * 0.4;
          float wave3 = sin((gridPos.x + gridPos.z) * 0.08 + t * 1.2) * 0.3;
          float wave4 = cos(gridPos.x * 0.09 - gridPos.z * 0.07 + t * 0.95) * 0.35;
          float wave = wave1 + wave2 + wave3 + wave4;
          
          float depthAtten = smoothstep(-80.0, 80.0, gridPos.z);
          float amp = mix(1.0, 0.2, depthAtten);
          // Increased amplitude for more movement
          gridPos.y += (n1 + n2 + n3 + wave) * 4.5 * amp;
          
          // Faster rotation with more variation
          float rot = sin(t * 0.5 + instancePhase * 6.28318) * 0.5 + cos(t * 0.35 + instancePhase * 3.14159) * 0.2;
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
          
          // Twinkle effect - faster twinkling
          float tw = 0.75 + 0.25 * sin(uTime * 1.0 + vPhase * 6.28318) + 0.15 * sin(uTime * 0.8 + vPhase * 3.14159);
          float att = clamp(vDepth / 240.0, 0.2, 1.0);
          
          vec3 col = uBrand * light * tw * att * 0.85;
          float alpha = tw * att * 0.75;
          
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    
    const nodes = new THREE.InstancedMesh(cubeGeo, cubeMat, numCubes);
    
    // Set instance positions and phases
    const dummy = new THREE.Object3D();
    const instancePositions = new Float32Array(numCubes * 3);
    const instancePhases = new Float32Array(numCubes);
    
    for (let i = 0; i < numCubes; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      instancePositions[i * 3] = x;
      instancePositions[i * 3 + 1] = y;
      instancePositions[i * 3 + 2] = z;
      
      instancePhases[i] = Math.random();
      
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
    }
    
    cubeGeo.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3));
    cubeGeo.setAttribute('instancePhase', new THREE.InstancedBufferAttribute(instancePhases, 1));
    
    nodes.position.set(0, -6, 50);
    scene.add(nodes);

    console.log('AtlasHero: Nodes ready');

    // ----- Statue loading (statue or statue-voxel modes) -----
    let statueGroup: THREE.Group | null = null;
    let statueVoxelMesh: THREE.InstancedMesh | null = null;

    if (mode === 'statue' || mode === 'statue-voxel') {
      const loader = new GLTFLoader();
      
      loader.load(
        '/models/atlas.glb',
        (gltf) => {
          console.log('AtlasHero: Statue loaded');
          statueGroup = gltf.scene;

          if (mode === 'statue') {
            // Regular statue mode - apply white material to all meshes
            statueGroup.traverse((obj) => {
              if ((obj as any).isMesh) {
                const mesh = obj as THREE.Mesh;
                const whiteMat = new THREE.MeshStandardMaterial({
                  color: 0xffffff,
                  metalness: 0.05,
                  roughness: 0.3,
                  dithering: true,
                });
                whiteMat.emissive = new THREE.Color(0xffffff);
                whiteMat.emissiveIntensity = 0.25;
                mesh.material = whiteMat;
                mesh.castShadow = false;
                mesh.receiveShadow = false;
              }
            });

            // Center and scale statue
            const box = new THREE.Box3().setFromObject(statueGroup);
            const size = new THREE.Vector3();
            box.getSize(size);
            const scale = TARGET_STATUE_SIZE / Math.max(size.x, size.y, size.z);
            statueGroup.scale.setScalar(scale);

            // Recalculate box after scaling
            box.setFromObject(statueGroup);
            const center = new THREE.Vector3();
            box.getCenter(center);
            statueGroup.position.sub(center);

            // Position statue prominently in the scene
            statueGroup.position.set(0, 5, 20);

            scene.add(statueGroup);
            console.log('AtlasHero: Statue added to scene');
          } else if (mode === 'statue-voxel') {
            // Voxelized statue mode - convert to instanced cubes with same animation
            console.log('AtlasHero: Voxelizing statue...');
            
            try {
              // Voxelize with more samples for better definition
              const voxelData = voxelizeGroup(statueGroup, {
                sampleCount: 12000,
                cubeSize: 0.4,
                jitter: 0.1
              });

              // Create instanced mesh using THE SAME geometry and material as grid cubes
              const voxelCubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
              
              // IMPORTANT: Share the same shader uniforms so animation syncs
              const voxelCubeMat = new THREE.ShaderMaterial({
                uniforms: cubeUniforms, // Reuse the same uniforms!
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                vertexShader: cubeMat.vertexShader,
                fragmentShader: cubeMat.fragmentShader,
              });
              
              statueVoxelMesh = new THREE.InstancedMesh(
                voxelCubeGeo,
                voxelCubeMat,
                voxelData.count
              );

              // Set up instance attributes
              voxelCubeGeo.setAttribute(
                'instancePosition',
                new THREE.InstancedBufferAttribute(voxelData.positions, 3)
              );
              voxelCubeGeo.setAttribute(
                'instancePhase',
                new THREE.InstancedBufferAttribute(voxelData.phases, 1)
              );

              // Set instance matrices
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

              // Position statue prominently - higher and closer to camera
              statueVoxelMesh.position.set(0, 10, 30);

              scene.add(statueVoxelMesh);
              console.log('AtlasHero: Voxelized statue added to scene');
            } catch (error) {
              console.error('AtlasHero: Voxelization failed', error);
            }
          }
        },
        (progress) => {
          console.log(
            'AtlasHero: Loading statue...',
            Math.round((progress.loaded / progress.total) * 100) + '%'
          );
        },
        (error) => {
          console.error('AtlasHero: Failed to load statue', error);
        }
      );
    }

    // Keep grid cubes visible in all modes
    // The statue will be positioned to coexist with the animated grid

    // ----- Sizing -----
    const sizeToEl = () => {
      const w = el.clientWidth || window.innerWidth || 1500;
      const h = el.clientHeight || window.innerHeight || 500;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      gradientUniforms.uResolution.value.set(w, h);
      return { w, h };
    };
    
    const { w, h } = sizeToEl();

    // ----- Post FX -----
    const composer = new EffectComposer(renderer);
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.85, 1.0, 0.74);
    composer.addPass(bloom);

    console.log('AtlasHero: Composer ready');

    // ----- Resize -----
    const onSize = () => {
      const { w, h } = sizeToEl();
      composer.setSize(w, h);
      bloom.setSize(w, h);
    };
    const ro = new ResizeObserver(onSize);
    ro.observe(el);

    // ----- Loop -----
    const clock = new THREE.Clock();
    let raf = 0;
    
    const loop = () => {
      const t = clock.getElapsedTime();
      
      // Update all uniforms - this animates BOTH grid cubes AND voxel statue cubes
      gradientUniforms.uTime.value = t;
      cubeUniforms.uTime.value = t;
      
      // Animate grid cubes - faster horizontal movement with more amplitude
      nodes.position.x = Math.sin(t * 0.2) * 3.5 + Math.cos(t * 0.15) * 1.5;
      nodes.position.z = Math.sin(t * 0.18) * 2.0;
      
      // Animate statue (subtle rotation only - cubes already wave via shader)
      if (statueGroup) {
        statueGroup.rotation.y = Math.sin(t * 0.15) * 0.2;
        statueGroup.position.y = 5 + Math.sin(t * 0.3) * 1.5;
      }
      
      if (statueVoxelMesh) {
        // Subtle rotation - the individual cubes animate via shader
        statueVoxelMesh.rotation.y = Math.sin(t * 0.15) * 0.15;
      }
      
      // Render: background first, then scene with bloom
      renderer.autoClear = true;
      renderer.clear();
      renderer.render(backScene, backCam);
      renderer.autoClear = false;
      composer.render();
      
      raf = requestAnimationFrame(loop);
    };
    
    console.log('AtlasHero: Starting loop');
    raf = requestAnimationFrame(loop);

    // ----- Cleanup -----
    return () => {
      console.log('AtlasHero: Cleanup');
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (wrapRef.current && c.parentNode === wrapRef.current) {
        wrapRef.current.removeChild(c);
      }
      gridGeo.dispose();
      cubeGeo.dispose();
      cubeMat.dispose();
      nodes.dispose();
      gradientQuad.geometry.dispose();
      gradientMat.dispose();
      
      // Cleanup statue resources
      if (statueGroup) {
        statueGroup.traverse((obj) => {
          if ((obj as any).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.geometry?.dispose();
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
              } else {
                mesh.material.dispose();
              }
            }
          }
        });
        scene.remove(statueGroup);
      }
      
      if (statueVoxelMesh) {
        statueVoxelMesh.geometry.dispose();
        (statueVoxelMesh.material as THREE.Material).dispose();
        scene.remove(statueVoxelMesh);
      }
    };
  }, [mode]);

  return <div ref={wrapRef} className="absolute inset-0" />;
}
