/**
 * SvgSignatureAnimation
 * 
 * Hiệu ứng chữ ký tự vẽ (Signature self-drawing stroke animation).
 * Dùng SVG đường dẫn vector kết hợp CSS `stroke-dasharray`, `stroke-dashoffset`
 * và `cubic-bezier(0.65, 0, 0.35, 1)` với delay theo từng nét bút.
 */

export const SVG_SIGNATURE_PATHS = [
  {
    order: 0,
    d: "M138.27 11.7729C123.15 39.3885 106.223 85.497 102.06 100.029C98.6588 111.899 98.3721 128.792 98.6271 131.165",
    strokeWidth: 4,
    dur: "0.6s",
    delay: "0.1s"
  },
  {
    order: 1,
    d: "M78.2326 42.073C68.2519 91.6846 24.5171 161.888 11.6117 145.082C-3.90668 124.872 84.4229 80.042 149.127 70.3141C129.181 76.883 121.731 89.3385 127.224 93.3199C137.212 100.559 148.931 80.9071 154.826 68.4373C154.826 68.4373 145.919 84.0047 152.863 86.4553C163.666 90.2674 183.35 47.449 193.768 55.6123C200.863 61.1719 187.995 78.0438 180.889 75.6465C176.521 74.173 179.98 64.5401 184.583 59.6902C186.629 62.1747 192.878 65.6969 201.5 59.9093C210.123 54.1218 217.989 47.6358 220.844 45.1163",
    strokeWidth: 4,
    dur: "1.2s",
    delay: "0.5s"
  },
  {
    order: 2,
    d: "M235.554 43.4299C221.979 37.3731 206.4 60.4017 215.719 63.1233C224.115 65.5752 234.431 48.0119 239.203 40.1227C237.612 42.7522 234.822 53.6736 235.156 66.1976C235.574 81.8524 228.174 116.927 217.431 114.674C206.687 112.422 217.712 80.3645 242.778 57.3701C262.83 38.9746 269.549 28.9006 270.402 26.163C266.375 32.0516 260.249 44.2468 267.959 45.919C275.669 47.5912 298.148 19.8335 308.423 5.74565",
    strokeWidth: 4,
    dur: "0.9s",
    delay: "1.4s"
  },
  {
    order: 3,
    d: "M274.89 10.4194L274.409 16.157",
    strokeWidth: 5,
    dur: "0.2s",
    delay: "2.1s"
  }
];

export const SIGNATURE_CSS = `
  .svg-sign__path {
    opacity: 0;
    fill: none;
    stroke-linecap: butt;
  }
  .svg-sign.is-drawing .svg-sign__path {
    animation:
      svg-sign-show 0s linear var(--path-delay) forwards,
      svg-sign-draw var(--path-dur) cubic-bezier(0.65, 0, 0.35, 1) var(--path-delay) forwards;
  }
  @keyframes svg-sign-draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes svg-sign-show {
    to { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .svg-sign.is-drawing .svg-sign__path {
      animation: none;
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
`;

export function initSignatureAnimation(svgElement) {
  const paths = svgElement.querySelectorAll('.svg-sign__path');
  paths.forEach((path, i) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.setProperty('--path-dur', SVG_SIGNATURE_PATHS[i]?.dur || '0.8s');
    path.style.setProperty('--path-delay', SVG_SIGNATURE_PATHS[i]?.delay || '0s');
  });

  // Kích hoạt animation khi element xuất hiện trong viewport
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      svgElement.classList.add('is-drawing');
      observer.disconnect();
    }
  }, { threshold: 0.2 });

  observer.observe(svgElement);
}
