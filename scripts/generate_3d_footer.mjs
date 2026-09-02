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

// 1. Backup original cnt.gltf
const modelDir = path.join(process.cwd(), 'public', 'model');
const originalFile = path.join(modelDir, 'cnt.gltf');
const backupFile = path.join(modelDir, 'cnt_original.gltf');

if (!fs.existsSync(backupFile) && fs.existsSync(originalFile)) {
  fs.copyFileSync(originalFile, backupFile);
  console.log('Backed up original cnt.gltf -> cnt_original.gltf');
}

// 2. Load Pacifico font
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Pacifico-Regular.ttf');
const fontBuffer = fs.readFileSync(fontPath);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));

function textToShapes(text, fontSize, xOffset, yOffset) {
  const otPath = font.getPath(text, xOffset, yOffset, fontSize);
  const shapePath = new THREE.ShapePath();
  for (const cmd of otPath.commands) {
    if (cmd.type === 'M') shapePath.moveTo(cmd.x, cmd.y);
    else if (cmd.type === 'L') shapePath.lineTo(cmd.x, cmd.y);
    else if (cmd.type === 'C') shapePath.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
    else if (cmd.type === 'Q') shapePath.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
    else if (cmd.type === 'Z') shapePath.closePath();
  }
  return shapePath.toShapes(true);
}

// Create 2 lines: "Vạn Sự" and "Như Ý"
const fontSize = 80;
const shapesLine1 = textToShapes("Vạn Sự", fontSize, 0, 0);
const shapesLine2 = textToShapes("Như Ý", fontSize, 20, 95);
const allShapes = [...shapesLine1, ...shapesLine2];

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


const geometry = new THREE.ExtrudeGeometry(allShapes, extrudeSettings);
geometry.computeVertexNormals();

// In Three.js font Y is inverted from opentype
geometry.scale(1, -1, 1);
geometry.center();

// Target bounds matching original cnt.gltf: width ~72, height ~45, depth ~18
geometry.computeBoundingBox();
const sz = new THREE.Vector3();
geometry.boundingBox.getSize(sz);
console.log('Vạn Sự Như Ý raw size:', sz);

const targetWidth = 72;
const scale = targetWidth / sz.x;
geometry.scale(scale, scale, scale);

geometry.computeBoundingBox();
const finalSz = new THREE.Vector3();
geometry.boundingBox.getSize(finalSz);
console.log('Vạn Sự Như Ý scaled size:', finalSz);

const material = new THREE.MeshStandardMaterial({
  color: 0x009dff,
  roughness: 0.1,
  metalness: 0.8
});
const mesh = new THREE.Mesh(geometry, material);
mesh.name = "van_su_nhu_y";

// Match original hierarchy: scale 0.01
const rootGroup = new THREE.Group();
rootGroup.scale.set(0.01, 0.01, 0.01);
rootGroup.add(mesh);

const scene = new THREE.Scene();
scene.add(rootGroup);

const exporter = new GLTFExporter();
try {
  const gltf = await exporter.parseAsync(scene, { binary: false });
  fs.writeFileSync(originalFile, JSON.stringify(gltf));
  console.log(`Successfully exported "VẠN SỰ NHƯ Ý" 3D model to ${originalFile}!`);

} catch (err) {
  console.error('Export error:', err);
}
