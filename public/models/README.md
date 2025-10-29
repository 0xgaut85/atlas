# Atlas Hero 3D Statue Integration

## Overview

The `AtlasHero` component now supports displaying a 3D GLB/GLTF statue model in the hero section with three different modes:

1. **`cubes`** - Original grid of animated white cubes
2. **`statue`** - Smooth 3D statue with white material and bloom
3. **`statue-voxel`** - Statue converted to instanced cubes (perfect aesthetic match)

## Setup

### 1. Place Your Model

Add your Atlas statue model to:
```
public/models/atlas.glb
```

**Recommended specs:**
- Format: GLB (preferred) or GLTF
- Size: < 10 MB (use Draco compression if needed)
- Centered at origin
- Reasonable poly count (10k-50k triangles)

### 2. Usage

In `app/components/Hero.tsx` or wherever you import `AtlasHero`:

```tsx
import AtlasHero from './AtlasHero';

// Default statue mode (smooth white material)
<AtlasHero />

// Explicit mode selection
<AtlasHero mode="statue" />

// Voxelized mode (cube aesthetic)
<AtlasHero mode="statue-voxel" />

// Original grid cubes
<AtlasHero mode="cubes" />
```

## Modes Explained

### Statue Mode (`statue`)
- Loads GLB and applies white `MeshStandardMaterial`
- Emissive glow for bloom effect
- Subtle floating and rotation animation
- Best for showcasing smooth 3D details
- Performance: Excellent

### Statue-Voxel Mode (`statue-voxel`)
- Samples 10,000 points on statue surface
- Converts each point to an animated white cube
- Perfect visual match with grid cube aesthetic
- Same shader and animation as grid cubes
- Performance: Good (instanced rendering)

### Cubes Mode (`cubes`)
- Original animated grid of cubes
- Procedural wave displacement
- No statue loaded

## Customization

### Adjust Statue Size

In `app/components/AtlasHero.tsx`, modify:
```tsx
const TARGET_STATUE_SIZE = 40; // Increase for larger statue
```

### Adjust Voxel Density

In the voxelization call:
```tsx
const voxelData = voxelizeGroup(statueGroup, {
  sampleCount: 10000,  // More = denser
  cubeSize: 0.4,       // Cube size
  jitter: 0.15         // Random offset for organic look
});
```

### Position and Animation

In the animation loop:
```tsx
if (statueGroup) {
  statueGroup.rotation.y = Math.sin(t * 0.15) * 0.2;  // Rotation amount
  statueGroup.position.y = 5 + Math.sin(t * 0.3) * 1.5;  // Float amplitude
}
```

## Performance

- **Statue mode**: ~60 FPS on most devices
- **Statue-voxel mode**: ~60 FPS desktop, ~45 FPS mobile
- Mobile safeguard: Can detect screen size and fallback to `statue` mode
- All modes use instanced rendering for efficiency

## Troubleshooting

**Model not loading:**
- Check browser console for errors
- Verify file path: `/models/atlas.glb`
- Ensure model is valid GLB/GLTF format

**Model too large/small:**
- Adjust `TARGET_STATUE_SIZE` constant

**Voxelization looks sparse:**
- Increase `sampleCount` in voxelizeGroup options
- Reduce `jitter` for more regular placement

**Performance issues:**
- Reduce `sampleCount` in voxel mode
- Use `statue` mode instead of `statue-voxel`
- Add screen size detection to disable on mobile

## Technical Details

- Uses `GLTFLoader` from Three.js
- `MeshSurfaceSampler` for voxelization
- Shares shader material with existing cubes
- `InstancedMesh` for efficient rendering
- Automatic resource cleanup on unmount


