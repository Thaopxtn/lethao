import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * ThreeSceneTypography
 * 
 * Quản lý các Model 3D chính trong portfolio:
 * 1. `model/hello.gltf`: Chữ "hello" dạng ống 3D bóng bẩy ở Banner:
 *    - modelPosition: [-0.1, 0, 2]
 *    - scale: desktop 22, mobile 19
 *    - beforeRotation: [0, 240, 0] (deg)
 *    - afterRotation: [0, 90, 0] (deg)
 *    - scrollSyncFactor: 0.72 (xoay mượt theo độ cuộn trang)
 * 2. `model/cursor.glb`: Con trỏ ngôi sao 3D tương tác:
 *    - modelPosition: [11.6, -4.2, -3]
 *    - rotationAxisTilt: [0, 0, 45]
 *    - afterRotation: [0, 720, 0]
 *    - Gradient tint: ["#009dff", "#009dff", "#64c3ff", "#64c3ff"]
 * 3. `model/cnt.gltf`: Chữ "CRAFT TASTE" ở Footer:
 *    - beforeRotation: [-180, 0, 0]
 *    - scale: 19
 *    - Tint: ["#FFFFFF", "#009dff", "#8e9dc4", "#64c3ff"]
 * 
 * Cơ chế Parallax Camera:
 * - parallaxEnabled: true
 * - parallaxStrength: 1.4
 * - parallaxLag: 0.18 (độ trễ quán tính lerp)
 * - parallaxRotate: 0.12
 * - leaveParallaxLag: 0.05
 */

export class Typography3DScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 22);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.loader = new GLTFLoader();
    this.models = {};

    // Parallax state
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;

    this.initLights();
    this.bindEvents();
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x009dff, 2.5);
    dirLight1.position.set(10, 15, 10);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x64c3ff, 1.8);
    dirLight2.position.set(-10, -10, -5);
    this.scene.add(dirLight2);
  }

  async loadModel(key, path) {
    return new Promise((resolve, reject) => {
      this.loader.load(path, (gltf) => {
        const root = gltf.scene;
        this.models[key] = root;
        this.scene.add(root);
        resolve(root);
      }, undefined, reject);
    });
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      // Chuẩn hóa tọa độ chuột [-1, 1]
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress; // 0 (banner) -> 1 (footer)
  }

  render() {
    // Parallax mouse lerp (quán tính mượt mà)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    this.camera.position.x = this.mouse.x * 1.4;
    this.camera.position.y = this.mouse.y * 1.4;
    this.camera.rotation.y = -this.mouse.x * 0.08;
    this.camera.rotation.x = this.mouse.y * 0.08;

    // Cập nhật góc quay chữ "hello" theo cuộn
    if (this.models['hello']) {
      const rotY = THREE.MathUtils.degToRad(240 - this.scrollProgress * (240 - 90));
      this.models['hello'].rotation.y = rotY;
    }

    // Cập nhật con trỏ ngôi sao 3D
    if (this.models['cursor']) {
      this.models['cursor'].rotation.z += 0.01;
      this.models['cursor'].rotation.y = this.mouse.x * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
