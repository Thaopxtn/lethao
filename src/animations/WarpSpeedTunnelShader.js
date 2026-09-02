import * as THREE from 'three';

/**
 * WarpSpeedTunnelShader
 * 
 * Hiệu ứng Hyperspace Warp Speed / Anamorphic Glare Streaks xuất hiện ở section "INNOVATE WITH PURPOSE":
 * 
 * Các tham số kỹ thuật:
 * - flareDownsample: 0.5
 * - streakScale: Tỷ lệ co giãn vệt sáng tỏa từ tâm
 * - hotspotPower: Độ hội tụ cường độ sáng ở điểm tâm
 * - threshold: Ngưỡng lọc ánh sáng
 * - swapVelocityTargets(): Chuyển đổi qua lại giữa 2 RenderTarget vận tốc (Velocity ping-pong)
 */

export const WarpSpeedVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const WarpSpeedFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec2 uResolution;
  uniform float uIntensity;

  // Hàm sinh số ngẫu nhiên giả lập hạt photon
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    
    // Tọa độ cực (Polar coordinates) tạo hình phễu đường hầm
    float angle = atan(uv.y, uv.x);
    float dist = length(uv);

    // Biến đổi tia sáng phóng từ tâm ra ngoài theo thời gian và tốc độ cuộn
    float rays = 0.0;
    const int NUM_RAYS = 64;
    
    for (int i = 0; i < NUM_RAYS; i++) {
      float fi = float(i);
      float rayAngle = (fi / float(NUM_RAYS)) * 6.283185;
      float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.283185) - 3.14159);
      
      float rayWidth = 0.015;
      if (angleDiff < rayWidth) {
        float rayOffset = hash(vec2(fi, 1.23));
        float streak = fract(rayOffset + uTime * (0.8 + rayOffset * 1.5) * uSpeed);
        
        // Vệt sáng dài ra khi di chuyển ra xa tâm
        float streakPos = dist - streak;
        if (streakPos > 0.0 && streakPos < 0.35) {
          float brightness = (1.0 - streakPos / 0.35) * (1.0 - angleDiff / rayWidth);
          rays += brightness;
        }
      }
    }

    // Phối màu Neon Cyberpunk: Cyan (#00f2fe) -> Magenta (#4facfe) -> White
    vec3 colorCyan = vec3(0.0, 0.95, 1.0);
    vec3 colorMagenta = vec3(0.75, 0.2, 1.0);
    vec3 finalColor = mix(colorCyan, colorMagenta, sin(angle * 3.0 + uTime) * 0.5 + 0.5);

    finalColor *= rays * uIntensity;
    gl_FragColor = vec4(finalColor, clamp(rays * uIntensity, 0.0, 1.0));
  }
`;

export function createWarpSpeedMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 1.0 },
      uIntensity: { value: 1.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: WarpSpeedVertexShader,
    fragmentShader: WarpSpeedFragmentShader
  });
}
