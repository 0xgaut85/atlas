import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface VoxelizeOptions {
  sampleCount?: number;
  cubeSize?: number;
  jitter?: number;
}

export interface VoxelData {
  positions: Float32Array;
  phases: Float32Array;
  count: number;
}

/**
 * Voxelize a mesh by sampling points on its surface and converting them to cube positions.
 * This creates the "instanced cubes" look matching the grid aesthetic.
 */
export function voxelizeMesh(
  mesh: THREE.Mesh,
  options: VoxelizeOptions = {}
): VoxelData {
  const {
    sampleCount = 8000,
    cubeSize = 0.4,
    jitter = 0.2
  } = options;

  const sampler = new MeshSurfaceSampler(mesh).build();
  
  const positions = new Float32Array(sampleCount * 3);
  const phases = new Float32Array(sampleCount);
  const tempPosition = new THREE.Vector3();

  for (let i = 0; i < sampleCount; i++) {
    sampler.sample(tempPosition);
    
    // Add slight jitter for organic look
    if (jitter > 0) {
      tempPosition.x += (Math.random() - 0.5) * jitter;
      tempPosition.y += (Math.random() - 0.5) * jitter;
      tempPosition.z += (Math.random() - 0.5) * jitter;
    }
    
    positions[i * 3] = tempPosition.x;
    positions[i * 3 + 1] = tempPosition.y;
    positions[i * 3 + 2] = tempPosition.z;
    
    phases[i] = Math.random();
  }

  return {
    positions,
    phases,
    count: sampleCount
  };
}

/**
 * Voxelize an entire group (e.g., loaded GLTF scene) by combining all meshes.
 */
export function voxelizeGroup(
  group: THREE.Object3D,
  options: VoxelizeOptions = {}
): VoxelData {
  const meshes: THREE.Mesh[] = [];
  
  group.traverse((obj) => {
    if ((obj as any).isMesh) {
      meshes.push(obj as THREE.Mesh);
    }
  });

  if (meshes.length === 0) {
    throw new Error('No meshes found in group to voxelize');
  }

  // Combine all meshes into one for sampling
  const geometries: THREE.BufferGeometry[] = [];
  meshes.forEach((mesh) => {
    const cloned = mesh.geometry.clone();
    cloned.applyMatrix4(mesh.matrixWorld);
    geometries.push(cloned);
  });

  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
  const tempMesh = new THREE.Mesh(mergedGeometry);
  
  const result = voxelizeMesh(tempMesh, options);
  
  // Cleanup
  mergedGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return result;
}

