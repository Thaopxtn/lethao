import * as THREE from 'three';

/**
 * WorkMeshLayerHover
 * 
 * Kỹ thuật chiếu hình ảnh DOM lên mặt phẳng 3D WebGL (DOM-to-WebGL mapping):
 * 1. Đọc vị trí DOM bằng `getBoundingClientRect()`.
 * 2. Chiếu tọa độ màn hình (screen pixel) sang tọa độ thế giới 3D của Camera (world space).
 * 3. Render một Mesh Plane trùng khớp hoàn toàn với vị trí thẻ HTML trên trang.
 * 4. Khi hover, ShaderMaterial thực hiện hiệu ứng gợn sóng hòa trộn (dissolve wave)
 *    chuyển tiếp giữa `imageUrl` (ảnh tĩnh ban đầu) và `hoverImageUrl` (ảnh preview khi hover).
 */

export const WorkPlaneVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const WorkPlaneFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uTextureDefault;
  uniform sampler2D uTextureHover;
  uniform float uHoverProgress; // 0.0 -> 1.0
  uniform float uTime;

  void main() {
    // Biến dạng sóng nhẹ theo tiến trình hover
    vec2 wave = vec2(
      sin(vUv.y * 10.0 + uTime * 2.0) * 0.02 * uHoverProgress,
      cos(vUv.x * 10.0 + uTime * 2.0) * 0.02 * uHoverProgress
    );

    vec4 col1 = texture2D(uTextureDefault, vUv + wave);
    vec4 col2 = texture2D(uTextureHover, vUv - wave * 0.5);

    // Dải quét chuyển tiếp từ trên xuống dưới
    float wipe = smoothstep(vUv.y - 0.1, vUv.y + 0.1, uHoverProgress * 1.2);
    vec4 finalColor = mix(col1, col2, wipe);

    gl_FragColor = finalColor;
  }
`;

export function syncDomToWebGlPlane(domElement, mesh, camera, viewportHeight) {
  const rect = domElement.getBoundingClientRect();
  
  // Kích thước thế giới
  const fov = (camera.fov * Math.PI) / 180;
  const planeDistance = camera.position.z;
  const worldHeight = 2 * Math.tan(fov / 2) * planeDistance;
  const worldWidth = worldHeight * camera.aspect;

  const width = (rect.width / window.innerWidth) * worldWidth;
  const height = (rect.height / window.innerHeight) * worldHeight;

  mesh.scale.set(width, height, 1);

  // Vị trí thế giới
  const x = ((rect.left + rect.width / 2) / window.innerWidth - 0.5) * worldWidth;
  const y = -((rect.top + rect.height / 2) / window.innerHeight - 0.5) * worldHeight;

  mesh.position.set(x, y, 0);
}
