import * as THREE from 'three';

/**
 * StickerParticleSystem
 * 
 * Hệ thống hạt sticker 3D (s_01.png -> s_12.png) bay lượn, rơi và xoay trong không gian 3D.
 * Hỗ trợ tạo burst sticker khi người dùng click vào màn hình.
 * 
 * Thuộc tính vật lý chính trích xuất từ source code gốc:
 * - spawnWidth: 32, spawnHeight: 24
 * - clickSpawnWidth: 24, clickSpawnHeight: 24
 * - positionY: 24
 * - fallDistance: 48
 * - zDepth: 4, zOffset: -6
 * - windStrength: 1.8, windFrequency: 0.3
 * - scale: 1.4, clickScale: 1.4
 * - rotationSpeed: 0.8
 * - fallSpeed: 1.8
 */

export const StickerVertexShader = /* glsl */ `
  attribute vec4 uvRect; // xy = uv offset, zw = uv scale
  attribute vec3 aVelocity;
  attribute float aRotationSpeed;
  attribute float aScale;

  varying vec2 vAtlasUv;
  varying float vAlpha;

  void main() {
    vAtlasUv = uvRect.xy + uv * uvRect.zw;
    
    // Instance transformation
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position * aScale, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const StickerFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vAtlasUv;
  uniform sampler2D uTextureAtlas;
  uniform float uOpacity;

  void main() {
    vec4 tex = texture2D(uTextureAtlas, vAtlasUv);
    if (tex.a < 0.05) discard;
    gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
  }
`;

export class StickerSimulation {
  constructor(scene, camera, textureUrls = []) {
    this.scene = scene;
    this.camera = camera;
    this.textureUrls = textureUrls;
    this.particles = [];
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.config = {
      spawnWidth: 32,
      spawnHeight: 24,
      positionY: 24,
      fallDistance: 48,
      zDepth: 4,
      zOffset: -6,
      windStrength: 1.8,
      windFrequency: 0.3,
      scale: 1.4,
      rotationSpeed: 0.8,
      fallSpeed: 1.8
    };
  }

  /**
   * Spawn a burst of stickers at screen coordinates (clientX, clientY)
   */
  burstAtScreen(x, y, count = 4) {
    const ndcX = (x / window.innerWidth) * 2 - 1;
    const ndcY = -(y / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera({ x: ndcX, y: ndcY }, this.camera);

    const worldPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.plane, worldPoint);

    for (let i = 0; i < count; i++) {
      this.spawnParticle({
        x: worldPoint.x + (Math.random() - 0.5) * 4,
        y: worldPoint.y + (Math.random() - 0.5) * 4,
        z: worldPoint.z + (Math.random() - 0.5) * 2,
        isBurst: true
      });
    }
  }

  spawnParticle(override = {}) {
    const particle = {
      x: override.x ?? (Math.random() - 0.5) * this.config.spawnWidth,
      y: override.y ?? this.config.positionY + Math.random() * 5,
      z: override.z ?? this.config.zOffset + (Math.random() - 0.5) * this.config.zDepth,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.5 + Math.random() * this.config.fallSpeed),
      rotSpeedX: (Math.random() - 0.5) * this.config.rotationSpeed,
      rotSpeedY: (Math.random() - 0.5) * this.config.rotationSpeed,
      rotSpeedZ: (Math.random() - 0.5) * this.config.rotationSpeed,
      textureIndex: Math.floor(Math.random() * 12),
      scale: this.config.scale * (0.8 + Math.random() * 0.4)
    };
    this.particles.push(particle);
  }

  update(time) {
    const wind = Math.sin(time * this.config.windFrequency) * this.config.windStrength;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += (p.vx + wind * 0.05);
      p.y += p.vy * 0.1;
      p.rotX += p.rotSpeedX * 0.02;
      p.rotY += p.rotSpeedY * 0.02;
      p.rotZ += p.rotSpeedZ * 0.02;

      // Reset when particle falls below threshold
      if (p.y < -this.config.fallDistance) {
        p.y = this.config.positionY;
        p.x = (Math.random() - 0.5) * this.config.spawnWidth;
      }
    }
  }
}
