# LÊ XUÂN THẢO © 2026 - Portfolio 3D & Interactive Web

> Portfolio cá nhân của **Lê Xuân Thảo** (Fullstack / Frontend Developer - Đại Phúc, Thái Nguyên).
> Tích hợp công nghệ đồ họa WebGL 3D, Three.js r184, Custom GLSL Shaders, Lenis Smooth Scroll và tương tác Micro-interactions hiện đại.

---

## ⚡ Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

Dự án đã được thiết lập hoàn chỉnh toàn bộ tài nguyên (Mô hình 3D chữ "xin chào" và "VẠN SỰ NHƯ Ý", hạt sticker rơi tự do, âm thanh BGM, font chữ tiếng Việt, shaders và client bundles).

Mở terminal tại thư mục `d:\luufilelaptrinh\clone` và chạy lệnh:

```bash
# Khởi động server
npm start
# hoặc
node server.mjs
```

Sau đó mở trình duyệt và truy cập:
👉 **[http://localhost:3008/](http://localhost:3008/)**

---

## 👤 Thông Tin Cá Nhân Đã Đồng Bộ

* **Họ và tên**: Lê Xuân Thảo
* **Định vị chuyên môn**: Fullstack / Frontend Developer
* **Địa chỉ**: Đại Phúc, Thái Nguyên
* **Khẩu hiệu chính**: **XÂY DỰNG TRẢI NGHIỆM WEB HIỆN ĐẠI & TINH TẾ**
* **Email liên hệ**: [lethaopxtn@gmail.com](mailto:lethaopxtn@gmail.com)
* **Hotline / SĐT**: [0936 938 848](tel:0936938848)
* **Zalo**: [0936 938 848](https://zalo.me/0936938848)
* **Facebook**: [https://www.facebook.com/thaohaha97/](https://www.facebook.com/thaohaha97/)
* **Múi giờ & Địa điểm HUD**: `GMT+7 VN THÁI NGUYÊN`

---

## 🎨 7 Hệ Thống Animation & Shader 3D Cốt Lõi

1. **Halftone / Dot-Matrix CRT Grid Overlay Shader** (`src/animations/DotMatrixHalftoneOverlay.js`): Lớp phủ lưới điểm toàn màn hình khử răng cưa bằng `fwidth`, đổi màu theo theme.
2. **Hệ Thống 3D Hạt Sticker Rơi & Click Physics Burst** (`src/animations/StickerParticleSystem.js`): 12 sticker rơi trong gió và nổ bung chùm hạt khi click chuột.
3. **3D Typography Scene** (`src/animations/ThreeSceneTypography.js`):
   - **Banner**: Chữ 3D **"xin chào"** dạng ống kim loại bóng loáng, xoay mượt mà theo vị trí cuộn trang.
   - **Footer**: Cụm chữ 3D **"VẠN SỰ NHƯ Ý"** bề thế tráng gương xanh biếc ở chân trang.
   - **Parallax Mouse**: Camera nghiêng theo chuột tạo chiều sâu không gian 3 chiều.
4. **Hyperspace Warp Speed Tunnel** (`src/animations/WarpSpeedTunnelShader.js`): Hiệu ứng đường hầm tốc độ ánh sáng với 64 tia sáng neon phóng từ tâm.
5. **SVG Signature Self-Drawing** (`src/animations/SvgSignatureAnimation.js`): Nét vẽ chữ ký vector tự động vẽ bút ký khi lướt tới.
6. **Chiếu DOM Sang WebGL & Hover Dissolve** (`src/animations/WorkMeshLayerHover.js`): Khớp vị trí thẻ HTML với mặt phẳng 3D và quét sóng hòa trộn ảnh khi hover.
7. **Cyberpunk ASCII Text Scrambler & HUD Toggles** (`src/animations/AsciiTextScramble.js`): Hiệu ứng xáo chữ hacker, icon xoay âm thanh `SOUND[/]` và đồng hồ thời gian thực.

---

## 🛠 Tiện Ích Tạo Chữ 3D Tùy Biến (Custom 3D Generator)

Thư mục [`scripts/`](file:///d:/luufilelaptrinh/clone/scripts/) chứa các công cụ giúp bạn thay đổi chữ 3D bất cứ lúc nào:
* [`scripts/generate_3d_hello.mjs`](file:///d:/luufilelaptrinh/clone/scripts/generate_3d_hello.mjs): Đổi chữ 3D ở Banner (hiện tại là *"xin chào"*).
* [`scripts/generate_3d_footer.mjs`](file:///d:/luufilelaptrinh/clone/scripts/generate_3d_footer.mjs): Đổi cụm chữ 3D ở Footer (hiện tại là *"VẠN SỰ NHƯ Ý"*).

Chỉ cần mở file script, thay đổi chuỗi ký tự trong biến `text` và chạy lại bằng `node scripts/...`!
