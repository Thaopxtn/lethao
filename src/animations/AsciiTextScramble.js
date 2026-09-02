/**
 * AsciiTextScramble
 * 
 * Bộ máy mã hóa chữ hiệu ứng Hacker/Cyberpunk Scramble:
 * - Tập ký tự ngẫu nhiên: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?/<>[]{}"
 * - Màu highlight ký tự đang scramble:
 *   - Dark theme: ["#c0fe04", "#DFFF81"]
 *   - Light theme: ["#c0fe04", "#607F02"]
 * - Cơ chế: Khi component xuất hiện hoặc trigger, từng chữ cái sẽ quay vòng qua
 *   các ký tự ASCII ngẫu nhiên với độ trễ (letterDelayMs: 80ms) trước khi chốt lại ký tự thật.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?/<>[]{}";

export class TextScrambler {
  constructor(element, options = {}) {
    this.element = element;
    this.targetText = options.text || element.innerText;
    this.letterDelayMs = options.letterDelayMs || 80;
    this.startDelayMs = options.startDelayMs || 0;
    this.scrambleColor = options.color || '#c0fe04';
    this.frame = 0;
    this.queue = [];
    this.timer = null;
  }

  setText(newText) {
    this.targetText = newText;
    const oldText = this.element.innerText;
    const length = Math.max(oldText.length, newText.length);
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 10);
      const end = start + Math.floor(Math.random() * 10);
      this.queue.push({ from, to, start, end, char: '' });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:${this.scrambleColor}">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.element.innerHTML = output;

    if (complete !== this.queue.length) {
      this.frameRequest = requestAnimationFrame(() => this.update());
      this.frame++;
    }
  }
}

/**
 * ASCIISoundToggle
 * 
 * Biểu tượng thanh âm thanh ASCII quay vòng theo nhịp:
 * '|' -> '/' -> '-' -> '\' -> '|'
 */
export class SoundAsciiIndicator {
  constructor(element, audioSrc = '/bgm.mp3') {
    this.element = element;
    this.audio = new Audio(audioSrc);
    this.audio.loop = true;
    this.frames = ['|', '/', '-', '\\'];
    this.frameIndex = 0;
    this.isPlaying = false;
    this.interval = null;

    this.render();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.audio.play().catch(() => {});
    this.isPlaying = true;
    this.interval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.render();
    }, 120);
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    clearInterval(this.interval);
    this.render();
  }

  render() {
    const symbol = this.isPlaying ? this.frames[this.frameIndex] : '·';
    this.element.innerText = `SOUND[${symbol}]`;
  }
}
