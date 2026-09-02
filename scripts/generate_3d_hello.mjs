import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import opentype from 'opentype.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfill FileReader for Node.js
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then(buf => {
        const base64 = Buffer.from(buf).toString('base64');
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
  };
}



// 1. Backup original hello.gltf
const modelDir = path.join(process.cwd(), 'public', 'model');
const originalFile = path.join(modelDir, 'hello.gltf');
const backupFile = path.join(modelDir, 'hello_original.gltf');

if (!fs.existsSync(backupFile) && fs.existsSync(originalFile)) {
  fs.copyFileSync(originalFile, backupFile);
  console.log('Backed up original hello.gltf -> hello_original.gltf');
}

// 2. Load Pacifico font
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Pacifico-Regular.ttf');
const fontBuffer = fs.readFileSync(fontPath);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));


// Function to convert opentype path to THREE.ShapePath
function opentypePathToThree(otPath) {
  const shapePath = new THREE.ShapePath();
  
  for (const cmd of otPath.commands) {
    if (cmd.type === 'M') {
      shapePath.moveTo(cmd.x, cmd.y);
    } else if (cmd.type === 'L') {
      shapePath.lineTo(cmd.x, cmd.y);
    } else if (cmd.type === 'C') {
      shapePath.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
    } else if (cmd.type === 'Q') {
      shapePath.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
    } else if (cmd.type === 'Z') {
      shapePath.closePath();
    }
  }
  
  return shapePath.toShapes(true);
}

const text = "xin chào";
const fontSize = 100;
const otPath = font.getPath(text, 0, 0, fontSize);
const shapes = opentypePathToThree(otPath);

console.log(`Generated ${shapes.length} shapes for "${text}"`);

// Extrude settings for rounded, pillowy, tube-like 3D look (optimized)
const extrudeSettings = {
  steps: 1,
  depth: 8,
  bevelEnabled: true,
  bevelThickness: 5,
  bevelSize: 4,
  bevelOffset: -0.5,
  bevelSegments: 4,
  curveSegments: 8
};


const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
geometry.computeVertexNormals();

// In Three.js font Y is inverted from opentype
geometry.scale(1, -1, 1);
geometry.center();

// Compute bounding box
geometry.computeBoundingBox();
const box = geometry.boundingBox;
const size = new THREE.Vector3();
box.getSize(size);
console.log('Generated text size before normalization:', size);

// Target size: width around 90, height around 30, depth around 18
const targetWidth = 92;
const scale = targetWidth / size.x;
geometry.scale(scale, scale, scale);

geometry.computeBoundingBox();
const finalSize = new THREE.Vector3();
geometry.boundingBox.getSize(finalSize);
console.log('Final text size:', finalSize);

// Create mesh
const material = new THREE.MeshStandardMaterial({
  color: 0x2266ff,
  roughness: 0.1,
  metalness: 0.8
});
const mesh = new THREE.Mesh(geometry, material);
mesh.name = "xin_chao";

// Match original hierarchy: scale 0.01 * 0.75
const rootGroup = new THREE.Group();
rootGroup.scale.set(0.01, 0.01, 0.01);

const subGroup = new THREE.Group();
subGroup.scale.set(0.75, 0.75, 0.75);

subGroup.add(mesh);
rootGroup.add(subGroup);

const scene = new THREE.Scene();
scene.add(rootGroup);

// Export to glTF
const exporter = new GLTFExporter();
try {
  const gltf = await exporter.parseAsync(scene, { binary: false });
  fs.writeFileSync(originalFile, JSON.stringify(gltf));
  console.log(`Successfully exported "xin chào" 3D model to ${originalFile}!`);

} catch (err) {
  console.error('Export error:', err);
}


