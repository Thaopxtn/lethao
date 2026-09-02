import * as THREE from 'three';

/**
 * DotMatrixHalftoneOverlay
 * 
 * Lớp overlay mô phỏng hiệu ứng dot-matrix / CRT halftone trên toàn màn hình.
 * Được render bằng một full-screen quad (PlaneGeometry(2, 2)) với custom ShaderMaterial.
 * 
 * Cơ chế hoạt động:
 * 1. vUv được chia lưới theo `uPixelSize / uResolution` thành các cell UV.
 * 2. Tính khoảng cách từ tâm mỗi cell (0.5, 0.5) đến pixel hiện tại.
 * 3. Dùng hàm `fwidth()` để khử răng cưa (anti-aliasing) cực mịn cho từng chấm tròn.
 * 4. Bán kính chấm `radius = uRadiusScale * alpha`, thay đổi mượt mà theo độ mờ.
 * 5. Tự động đổi màu chấm theo Theme (Dark: #0F1111 / Light: #FBFAF4).
 */

export const DotMatrixVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const DotMatrixFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPixelSize;
  uniform float uRadiusScale;
  uniform vec2 uResolution;

  void main() {
    float a = clamp(uOpacity, 0.0, 1.0);

    // Tính kích thước ô pixel chuẩn hóa theo độ phân giải màn hình
    vec2 normalizedPixelSize = vec2(
      uPixelSize / max(uResolution.x, 1.0),
      uPixelSize / max(uResolution.y, 1.0)
    );

    vec2 safePixelSize = max(normalizedPixelSize, vec2(1e-6));
    vec2 cellUV = fract(vUv / safePixelSize);

    // Độ mờ (opacity) trực tiếp quyết định bán kính của chấm tròn
    float radius = uRadiusScale * a * 0.5;
    float distanceFromCenter = distance(cellUV, vec2(0.5));

    // Khử răng cưa cực mịn bằng fwidth
    float aa = fwidth(distanceFromCenter) * 1.5;
    float circle = 1.0 - smoothstep(radius - aa, radius + aa, distanceFromCenter);

    if (circle <= 0.001) {
      discard;
    }

    gl_FragColor = vec4(uColor, circle * a);
  }
`;

export function createDotMatrixMaterial({
  pixelSize = 8,
  radiusScale = 0.9,
  theme = 'dark',
  colors = { dark: '#0F1111', light: '#FBFAF4' }
} = {}) {
  const uniforms = {
    uColor: { value: new THREE.Color(theme === 'dark' ? colors.dark : colors.light) },
    uOpacity: { value: 1.0 },
    uPixelSize: { value: pixelSize },
    uRadiusScale: { value: radiusScale },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms,
    vertexShader: DotMatrixVertexShader,
    fragmentShader: DotMatrixFragmentShader
  });

  return {
    material,
    updateResolution(width, height) {
      uniforms.uResolution.value.set(width, height);
    },
    setTheme(newTheme) {
      uniforms.uColor.value.set(newTheme === 'dark' ? colors.dark : colors.light);
    },
    setOpacity(opacity) {
      uniforms.uOpacity.value = opacity;
    }
  };
}
