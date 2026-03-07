/**
 * 栾宜伟 - 个人简历网站交互逻辑
 * 功能：粒子动画、滚动动画、3D 卡片、证书轮播、灯箱等
 */

(function () {
  "use strict";

  /** =============================
   * 工具函数
   * ============================= */
  function debounce(fn, ms) {
    let id = null;
    return function (...args) {
      if (id !== null) clearTimeout(id);
      id = setTimeout(() => {
        id = null;
        fn.apply(this, args);
      }, ms);
    };
  }

  /** =============================
   * 全局常量
   * ============================= */
  const GITHUB_URL = "https://github.com/kieklie";
  const EMAIL_ADDRESS = "3362079920@qq.com";

  const frameCallbacks = [];
  function registerFrameCallback(fn) {
    frameCallbacks.push(fn);
  }
  function mainLoop(timestamp) {
    for (let i = 0; i < frameCallbacks.length; i++) {
      frameCallbacks[i](timestamp);
    }
    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);

  let isHeroVisible = true;
  const heroObserver = new IntersectionObserver((entries) => {
    if (entries[0]) isHeroVisible = entries[0].isIntersecting;
  });

  document.addEventListener("DOMContentLoaded", () => {
    initSocialLinks();
    initCopyEmail();
    initTypingEffect();
    initFighters();
    initParticleCanvas();
    initScrollFadeIn();
    initNavbarScrollAndActiveLink();
    initNavToggle();
    initSmoothScroll();
    initBackToTop();
    initBackToHero();
    initScrollDownArrowVisibility();
    initDocumentTitleRotation();
    initExperienceCards();
    initSkillsProgress();
    initCertificatesCarousel();
    initLightbox();
    initAvatarReveal();
    initMouseRipple();
    initSloganRepulsion();

    const heroEl = document.getElementById("hero");
    if (heroEl) heroObserver.observe(heroEl);
  });

  /** =============================
   * Hero 社交链接
   * ============================= */
  function initSocialLinks() {
    const githubLinks = document.querySelectorAll('[title="GitHub"]');
    githubLinks.forEach((a) => {
      a.href = GITHUB_URL;
    });

    const emailLinks = document.querySelectorAll('[title="Email"]');
    emailLinks.forEach((a) => {
      a.href = `mailto:${EMAIL_ADDRESS}`;
    });
  }

  /** =============================
   * CONTACT 邮箱点击复制并提示 Copied
   * ============================= */
  function initCopyEmail() {
    const links = document.querySelectorAll(".copy-email");
    links.forEach((link) => {
      const text = link.getAttribute("data-copy");
      const originalLabel = link.textContent;
      const originalTitle = link.getAttribute("title") || "点击复制";
      if (!text) return;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            link.textContent = "已复制";
            link.setAttribute("title", "已复制");
            setTimeout(() => {
              link.textContent = originalLabel;
              link.setAttribute("title", originalTitle);
            }, 1500);
          }).catch(() => {
            window.location.href = `mailto:${text}`;
          });
        } else {
          window.location.href = `mailto:${text}`;
        }
      });
    });
  }

  /** =============================
   * 打字机效果
   * ============================= */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function typeText(element, text, speed) {
    return new Promise((resolve) => {
      if (!element || !text) {
        resolve();
        return;
      }
      element.textContent = "";
      let index = 0;
      const timer = setInterval(() => {
        element.textContent += text.charAt(index);
        index += 1;
        if (index >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  async function initTypingEffect() {
    const heroTitle = document.querySelector(".hero-title");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    if (!heroSubtitle) return;

    const primaryText = "ALEX LUAN";
    const secondaryText = "网络工程 · 技术支持 / 测试 / 多媒体创作";

    await sleep(700);
    if (heroTitle) {
      await typeText(heroTitle, primaryText, 120);
    }
    await sleep(400);
    await typeText(heroSubtitle, secondaryText, 20);
  }

  /** =============================
   * 背景战机（与 pixel-fighter.html 一致的像素风战机 + 白色拖尾）
   * ============================= */
  function initFighters() {
    const canvas = document.getElementById("fighter-canvas");
    const heroTitle = document.querySelector(".hero-title--outline");
    if (!canvas || !canvas.getContext || !heroTitle) return;

    const ctx = canvas.getContext("2d");
    const TRAIL_LENGTH_MULTIPLIER = 11;
    const FIGHTER_COUNT = 1;
    const FIGHTER_SPEED = 1.4;
    const SPAWN_DURATION_MS = 1400;
    const EDGE_MARGIN = 48;
    const CENTER_STEER_RATE = 0.04;
    const DIR_CHANGE_MIN_MS = 2000;
    const DIR_CHANGE_MAX_MS = 5000;
    const FLY_MARGIN = 24;
    let fighters = [];
    let bodyLengthPx = 32;
    const heroCard = document.querySelector(".hero-card");

    /** pixel-fighter.html 配色 */
    const PALETTE = {
      e: null,
      b: "#1a0b3d",
      h: "#2a3f8f",
      H: "#3d5fcf",
      w: "#ffffff",
      y: "#ffe44d",
      Y: "#ffb700",
      c1: "#00e5ff",
      c2: "#00b8d4",
      r: "#ff4060",
      p: "#cc44ff",
      P: "#8800cc",
      g: "#44ff88",
      G: "#00aa44",
      m: "#ff88cc",
    };

    /** 战机像素网格：11 列 x 16 行，鹞式形态、尖机头、严格左右对称（无机头前双柱） */
    const SHIP_GRID = [
      ["e","e","e","e","e","w","e","e","e","e","e"],
      ["e","e","e","e","H","w","H","e","e","e","e"],
      ["e","e","e","e","H","y","H","e","e","e","e"],
      ["e","e","e","H","Y","y","Y","H","e","e","e"],
      ["e","e","e","H","H","H","H","H","e","e","e"],
      ["e","e","H","H","c1","H","c1","H","H","e","e"],
      ["e","e","H","H","H","H","H","H","H","e","e"],
      ["H","H","H","r","H","b","b","H","r","H","H"],
      ["H","H","H","H","r","H","H","r","H","H","H"],
      ["e","e","H","H","H","H","H","H","H","e","e"],
      ["e","e","e","H","H","g","G","g","H","H","e"],
      ["e","H","H","G","G","P","P","G","H","H","e"],
      ["e","e","e","H","H","p","H","H","e","e","e"],
      ["e","e","e","e","H","H","H","e","e","e","e"],
      ["e","e","e","e","e","e","e","e","e","e","e"],
      ["e","e","e","e","e","e","e","e","e","e","e"],
    ];

    const COLS = 11;
    const ROWS = 16;

    function getBodyLength() {
      const fs = getComputedStyle(heroTitle).fontSize;
      const px = parseFloat(fs) || 36;
      return Math.max(18, Math.min(36, px * 0.65));
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bodyLengthPx = getBodyLength();
    }

    function randomBetween(a, b) {
      return a + Math.random() * (b - a);
    }

    /** 获取当前帧的飞行区域（canvas 内，且不进入卡片上方以下） */
    function getFlyBounds(canvasEl, w, h) {
      const xMin = FLY_MARGIN;
      const xMax = w - FLY_MARGIN;
      const yMin = FLY_MARGIN;
      let yMax = h - FLY_MARGIN;
      if (heroCard && canvasEl) {
        const cr = canvasEl.getBoundingClientRect();
        const cardR = heroCard.getBoundingClientRect();
        const cardTopInCanvas = cardR.top - cr.top;
        yMax = Math.min(yMax, cardTopInCanvas - FLY_MARGIN);
      }
      if (yMax < yMin + 40) yMax = yMin + 40;
      return { xMin, xMax, yMin, yMax };
    }

    class Fighter {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
      }

      reset() {
        this.x = randomBetween(0.1 * this.w, 0.9 * this.w);
        this.y = randomBetween(0.1 * this.h, 0.5 * this.h);
        this.angle = Math.random() * Math.PI * 2;
        this.nextChangeAt = Date.now() + DIR_CHANGE_MIN_MS + Math.random() * (DIR_CHANGE_MAX_MS - DIR_CHANGE_MIN_MS);
        this.trail = [];
        this.spawnedAt = Date.now();
        this.spawnProgress = 0;
      }

      update(bounds, now) {
        if (this.spawnedAt != null && this.spawnProgress < 1) {
          this.spawnProgress = Math.min(1, (now - this.spawnedAt) / SPAWN_DURATION_MS);
        }
        const b = bounds || {
          xMin: FLY_MARGIN,
          xMax: this.w - FLY_MARGIN,
          yMin: FLY_MARGIN,
          yMax: this.h - FLY_MARGIN,
        };
        const cx = (b.xMin + b.xMax) / 2;
        const cy = (b.yMin + b.yMax) / 2;
        const margin = EDGE_MARGIN;
        const nearEdge =
          this.x < b.xMin + margin ||
          this.x > b.xMax - margin ||
          this.y < b.yMin + margin ||
          this.y > b.yMax - margin;

        if (nearEdge) {
          const targetAngle = Math.atan2(cx - this.x, this.y - cy);
          let delta = targetAngle - this.angle;
          while (delta > Math.PI) delta -= 2 * Math.PI;
          while (delta < -Math.PI) delta += 2 * Math.PI;
          this.angle += delta * CENTER_STEER_RATE;
        } else if (now >= this.nextChangeAt) {
          this.angle = Math.random() * Math.PI * 2;
          this.nextChangeAt = now + DIR_CHANGE_MIN_MS + Math.random() * (DIR_CHANGE_MAX_MS - DIR_CHANGE_MIN_MS);
        }

        this.vx = FIGHTER_SPEED * Math.sin(this.angle);
        this.vy = -FIGHTER_SPEED * Math.cos(this.angle);
        const spawnFreeze = this.spawnProgress != null && this.spawnProgress < 0.35 ? 0 : 1;
        this.x += this.vx * spawnFreeze;
        this.y += this.vy * spawnFreeze;

        this.x = Math.max(b.xMin, Math.min(b.xMax, this.x));
        this.y = Math.max(b.yMin, Math.min(b.yMax, this.y));

        if (this.spawnProgress >= 0.5) {
          this.trail.push({ x: this.x, y: this.y });
        }
        const maxTrailPts = 180;
        const trailLen = bodyLengthPx * TRAIL_LENGTH_MULTIPLIER;
        let sum = 0;
        let i = this.trail.length - 1;
        while (i >= 1) {
          sum += Math.hypot(
            this.trail[i].x - this.trail[i - 1].x,
            this.trail[i].y - this.trail[i - 1].y
          );
          if (sum >= trailLen) break;
          i--;
        }
        while (i > 0) {
          this.trail.shift();
          i--;
        }
        if (this.trail.length > maxTrailPts) this.trail.shift();
      }

      drawTrail(context) {
        if (this.trail.length < 2) return;
        const len = this.trail.length;
        for (let i = 0; i < len - 1; i++) {
          const t = i / len;
          const alpha = 0.4 + t * 0.55;
          context.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          context.lineWidth = Math.max(1.5, bodyLengthPx * 0.22 * (0.4 + t));
          context.shadowBlur = 10;
          context.shadowColor = "rgba(0, 229, 255, 0.9)";
          context.beginPath();
          context.moveTo(this.trail[i].x, this.trail[i].y);
          context.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
          context.stroke();
        }
        context.shadowBlur = 0;
      }

      drawPixelFighter(context) {
        context.save();
        context.translate(this.x, this.y);
        if (this.spawnProgress != null && this.spawnProgress < 1) {
          const s = 0.25 + 0.75 * Math.min(1, this.spawnProgress * 1.4);
          const a = Math.min(1, this.spawnProgress * 1.2);
          context.scale(s, s);
          context.globalAlpha *= a;
        }
        context.rotate(this.angle);
        context.imageSmoothingEnabled = false;

        const bl = bodyLengthPx;
        const gridH = ROWS;
        const cellSize = Math.max(2, Math.floor((bl * 1.35) / gridH));
        const ox = (-COLS / 2) * cellSize;
        const oy = (-ROWS / 2) * cellSize;

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const key = SHIP_GRID[row][col];
            const color = PALETTE[key];
            if (!color) continue;
            context.fillStyle = color;
            context.fillRect(
              ox + col * cellSize,
              oy + row * cellSize,
              cellSize,
              cellSize
            );
          }
        }

        const flameY = oy + ROWS * cellSize;
        const fw = cellSize * 0.55;
        const fh = cellSize * 1.1;
        const flicker = 0.7 + Math.random() * 0.3;
        context.globalAlpha = flicker;
        context.shadowBlur = 10;
        context.shadowColor = "rgba(0, 229, 255, 0.9)";
        context.fillStyle = "#c2f0ff";
        context.fillRect(ox + 4 * cellSize, flameY, fw, fh);
        context.fillRect(ox + 6 * cellSize, flameY, fw, fh);
        context.fillStyle = "#00e5ff";
        context.fillRect(ox + 4 * cellSize, flameY + fh * 0.3, fw * 0.9, fh * 1.2);
        context.fillRect(ox + 6 * cellSize, flameY + fh * 0.3, fw * 0.9, fh * 1.2);
        context.fillStyle = "rgba(170, 68, 255, 0.85)";
        context.fillRect(ox + 4 * cellSize, flameY + fh, fw * 0.7, fh * 0.8);
        context.fillRect(ox + 6 * cellSize, flameY + fh, fw * 0.7, fh * 0.8);
        context.shadowBlur = 0;
        context.globalAlpha = 1;

        context.restore();
      }
    }

    function init() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      bodyLengthPx = getBodyLength();
      const bounds = getFlyBounds(canvas, w, h);
      const xRange = bounds.xMax - bounds.xMin;
      const yRange = bounds.yMax - bounds.yMin;
      fighters = [];
      for (let i = 0; i < FIGHTER_COUNT; i++) {
        const f = new Fighter(w, h);
        f.x = bounds.xMin + xRange * randomBetween(1 / 3, 2 / 3);
        f.y = bounds.yMin + yRange * randomBetween(1 / 3, 2 / 3);
        f.angle = Math.random() * Math.PI * 2;
        f.nextChangeAt = Date.now() + DIR_CHANGE_MIN_MS + Math.random() * (DIR_CHANGE_MAX_MS - DIR_CHANGE_MIN_MS);
        f.trail = [];
        f.spawnedAt = Date.now();
        f.spawnProgress = 0;
        fighters.push(f);
      }
    }

    function animate() {
      if (!isHeroVisible) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const bounds = getFlyBounds(canvas, w, h);
      const now = Date.now();
      ctx.clearRect(0, 0, w, h);
      fighters.forEach((f) => {
        f.update(bounds, now);
        f.drawTrail(ctx);
        f.drawPixelFighter(ctx);
      });
    }

    resizeCanvas();
    init();
    registerFrameCallback(animate);
    window.addEventListener("resize", debounce(() => {
      resizeCanvas();
      init();
    }, 120), { passive: true });
  }

  /** =============================
   * 粒子画布：星云紫蓝 + 常驻星点 + 鼠标轨迹/光晕/爆发
   * ============================= */
  function initParticleCanvas() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    let W, H, dpr = window.devicePixelRatio || 1;

    // 配色方案 C — 星云紫蓝
    const COLORS = [[212, 200, 255], [136, 136, 255], [180, 160, 255]];
    const GLOW = [130, 110, 255];

    function resize() {
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", debounce(resize, 120), { passive: true });

    let mx = W / 2, my = H / 2, px = W / 2, py = H / 2, inside = false;
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX * dpr;
      my = e.clientY * dpr;
      inside = true;
    });
    document.addEventListener("mouseleave", () => (inside = false));
    document.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      if (!t) return;
      mx = t.clientX * dpr;
      my = t.clientY * dpr;
      inside = true;
    }, { passive: true });
    document.addEventListener("touchend", () => (inside = false));

    const particles = [];

    // 常驻漂浮星点
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.75 + Math.random() * 2.1,
      a: 0.075 + Math.random() * 0.21,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
    }));

    let frame = 0;

    function spawn() {
      if (!inside) return;
      const dx = mx - px, dy = my - py;
      const spd = Math.sqrt(dx * dx + dy * dy);
      if (spd < 1.5) return;

      const count = Math.min(7, 1 + Math.floor(spd / 8));
      for (let i = 0; i < count; i++) {
        const col = COLORS[Math.floor(Math.random() * COLORS.length)];
        const a = Math.random() * Math.PI * 2;
        const v = 0.2 + Math.random() * 1.3;
        particles.push({
          x: mx + (Math.random() - 0.5) * 16,
          y: my + (Math.random() - 0.5) * 16,
          vx: Math.cos(a) * v + dx * 0.06,
          vy: Math.sin(a) * v + dy * 0.06,
          r: 1 + Math.random() * 2.8,
          life: 1,
          decay: 0.010 + Math.random() * 0.020,
          col,
          streak: Math.random() < 0.3,
          lx: mx,
          ly: my,
        });
      }
      if (spd > 22) {
        particles.push({
          x: mx, y: my, vx: 0, vy: 0,
          r: 24 + Math.random() * 18,
          life: 0.6,
          decay: 0.032,
          col: COLORS[0],
          burst: true,
          lx: mx,
          ly: my,
        });
      }
      px = mx;
      py = my;
    }

    function render() {
      frame++;
      if (frame % 2 === 0) spawn();

      ctx.clearRect(0, 0, W, H);

      stars.forEach((s) => {
        s.x = (s.x + s.vx + 1) % 1;
        s.y = (s.y + s.vy + 1) % 1;
        const pulse = s.a * (0.6 + 0.4 * Math.sin(frame * 0.022 + s.phase));
        const sx = s.x * W;
        const sy = s.y * H;
        const sr = s.r * dpr;
        const [cr, cg, cb] = s.col;

        const glowR = sr * 4;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        grd.addColorStop(0, `rgba(${cr},${cg},${cb},${pulse * 1.2})`);
        grd.addColorStop(0.25, `rgba(${cr},${cg},${cb},${pulse * 0.5})`);
        grd.addColorStop(0.6, `rgba(${cr},${cg},${cb},${pulse * 0.12})`);
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = `rgba(${cr},${cg},${cb},${pulse * 0.9})`;
        ctx.shadowBlur = sr * 6;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${pulse * 0.95})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const [r, g, b] = p.col;
        const al = p.life;

        if (p.burst) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grd.addColorStop(0, `rgba(${r},${g},${b},${al * 0.28})`);
          grd.addColorStop(0.5, `rgba(${r},${g},${b},${al * 0.1})`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.streak) {
          const grd = ctx.createLinearGradient(p.lx, p.ly, p.x, p.y);
          grd.addColorStop(0, `rgba(${r},${g},${b},0)`);
          grd.addColorStop(1, `rgba(${r},${g},${b},${al * 0.85})`);
          ctx.beginPath();
          ctx.moveTo(p.lx, p.ly);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = grd;
          ctx.lineWidth = p.r * 0.8;
          ctx.shadowColor = `rgba(${GLOW[0]},${GLOW[1]},${GLOW[2]},0.5)`;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
          p.lx = p.x;
          p.ly = p.y;
        } else {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          grd.addColorStop(0, `rgba(${r},${g},${b},${al * 0.85})`);
          grd.addColorStop(0.4, `rgba(${r},${g},${b},${al * 0.3})`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${al * 0.7})`;
          ctx.fill();
        }
      }

      if (inside) {
        const [r, g, b] = COLORS[0];
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 40 * dpr);
        grd.addColorStop(0, `rgba(${r},${g},${b},0.1)`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},0.04)`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mx, my, 40 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    registerFrameCallback(render);
  }

  /** =============================
   * 滚动淡入动画
   * ============================= */
  function initScrollFadeIn() {
    const animatedEls = document.querySelectorAll(".fade-in-up");
    if (!animatedEls.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
      }
    );

    animatedEls.forEach((el) => observer.observe(el));
  }

  /** =============================
   * 导航栏滚动与当前 section 高亮
   * ============================= */
  function initNavbarScrollAndActiveLink() {
    const navbar = document.getElementById("navbar");
    const navLinks = Array.from(
      document.querySelectorAll(".nav-links a[href^='#']")
    );

    function handleScroll() {
      if (!navbar) return;
      const threshold = 40;
      if (window.scrollY > threshold) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const sections = navLinks
      .map((link) => {
        const id = link.getAttribute("href");
        if (!id || !id.startsWith("#")) return null;
        return document.querySelector(id);
      })
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        });
      },
      {
        threshold: 0.35,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /** =============================
   * 移动端汉堡菜单
   * ============================= */
  function initNavToggle() {
    const toggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.classList.toggle("is-open");
      navLinks.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /** =============================
   * 导航点击平滑滚动
   * ============================= */
  function initSmoothScroll() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href^='#']");
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const section = document.querySelector(hash);
      if (!section) return;

      event.preventDefault();
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      const navLinks = document.querySelector(".nav-links");
      if (navLinks && navLinks.classList.contains("is-open")) {
        navLinks.classList.remove("is-open");
        const toggle = document.querySelector(".nav-toggle");
        if (toggle) toggle.classList.remove("is-open");
      }
    });
  }

  /** =============================
   * 回到顶部按钮
   * ============================= */
  function initBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;

    function handleScroll() {
      const shouldShow = window.scrollY > window.innerHeight * 0.7;
      if (shouldShow) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /** =============================
   * 右下角回到首页按钮
   * ============================= */
  function initBackToHero() {
    const link = document.querySelector(".back-to-hero");
    if (!link) return;

    function handleScroll() {
      const inHero = window.scrollY < window.innerHeight * 0.5;
      link.style.opacity = inHero ? "0" : "1";
      link.style.pointerEvents = inHero ? "none" : "auto";
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  /** =============================
   * 首屏底部「VIEW RESUME」滚动离开后淡出
   * ============================= */
  function initScrollDownArrowVisibility() {
    const arrow = document.querySelector(".scroll-down-arrow");
    const hero = document.getElementById("hero");
    if (!arrow || !hero || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            arrow.classList.remove("is-hidden");
          } else {
            arrow.classList.add("is-hidden");
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(hero);

    let rafId = null;
    function handleParallax() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollY = window.scrollY;
        const heroH = hero.offsetHeight;
        if (scrollY > heroH) return;
        const ratio = scrollY * 0.45;
        arrow.style.transform = `translateX(-50%) translateY(-${ratio}px)`;
        arrow.style.opacity = String(Math.max(0, 1 - scrollY / (heroH * 0.6)));
      });
    }
    handleParallax();
    window.addEventListener("scroll", handleParallax, { passive: true });
  }

  /** =============================
   * 标签页 title 动态轮播
   * ============================= */
  function initDocumentTitleRotation() {
    const titles = [
      "栾宜伟 | 个人简历",
      "Alex Luan | Resume",
    ];
    let index = 0;
    setInterval(() => {
      index = (index + 1) % titles.length;
      document.title = titles[index];
    }, 3000);
  }

  /** =============================
   * 工作经历卡片 3D 倾斜 + 展开
   * ============================= */
  function initExperienceCards() {
    const cards = document.querySelectorAll(".exp-card");
    if (!cards.length) return;

    const canUse3D = window.matchMedia("(pointer: fine)").matches;
    const maxTilt = 14;

    cards.forEach((card) => {
      if (canUse3D) {
        card.addEventListener("mousemove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const percentX = (x - centerX) / centerX;
          const percentY = (y - centerY) / centerY;

          const rotateX = percentY * -maxTilt;
          const rotateY = percentX * maxTilt;

          card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      }

      card.addEventListener("click", () => {
        const isActive = card.classList.contains("active");
        cards.forEach((c) => c.classList.remove("active"));
        if (!isActive) {
          card.classList.add("active");
        }
      });
    });
  }

  /** =============================
   * 技能进度条动画
   * ============================= */
  function initSkillsProgress() {
    const fills = document.querySelectorAll(".progress-bar-fill[data-progress]");
    if (!fills.length || !("IntersectionObserver" in window)) return;

    const skillsSection = document.getElementById("skills");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          fills.forEach((fill) => {
            const raw = fill.getAttribute("data-progress") || "0";
            const value = raw.trim();
            const finalWidth = value.endsWith("%") ? value : `${value}%`;
            fill.style.width = finalWidth;
          });

          obs.disconnect();
        });
      },
      {
        threshold: 0.25,
      }
    );

    if (skillsSection) {
      observer.observe(skillsSection);
    } else if (fills[0]) {
      observer.observe(fills[0]);
    }
  }

  /** =============================
   * 证书轮播
   * ============================= */
  function initCertificatesCarousel() {
    const carousel = document.querySelector(".certificates-carousel .carousel");
    const track = document.querySelector(".certificates-carousel .carousel-track");
    if (!carousel || !track) return;

    const slides = track.querySelectorAll(".cert-card");
    if (!slides.length) return;

    const prevBtn = document.querySelector(".certificates-carousel .carousel-prev");
    const nextBtn = document.querySelector(".certificates-carousel .carousel-next");

    let currentIndex = 0;
    const total = slides.length;

    function clampIndex(idx) {
      if (idx < 0) return 0;
      if (idx > total - 1) return total - 1;
      return idx;
    }

    function updateButtons() {
      if (!prevBtn || !nextBtn) return;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === total - 1;
    }

    function goTo(index) {
      currentIndex = clampIndex(index);
      const offset = -currentIndex * 100;
      track.style.transform = `translateX(${offset}%)`;
      updateButtons();
    }

    prevBtn &&
      prevBtn.addEventListener("click", () => {
        goTo(currentIndex - 1);
      });

    nextBtn &&
      nextBtn.addEventListener("click", () => {
        goTo(currentIndex + 1);
      });

    goTo(0);
  }

  /** =============================
   * 灯箱（证书 + 兴趣区图片）
   * ============================= */
  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    const contentEl = lightbox.querySelector(".lightbox-content");
    const imgEl = lightbox.querySelector("img");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    if (!imgEl) return;

    let lastFocusedBeforeOpen = null;

    function getFocusableElements() {
      const selector = "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";
      const container = contentEl || lightbox;
      return Array.from(container.querySelectorAll(selector)).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
    }

    function trapFocus(e) {
      if (e.key !== "Tab" || !lightbox.classList.contains("active")) return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function openLightbox(src, alt, triggerEl) {
      imgEl.src = src;
      if (alt) imgEl.alt = alt;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      lastFocusedBeforeOpen = triggerEl && (triggerEl.closest("a") || triggerEl.closest("[tabindex]") || triggerEl);
      if (!lastFocusedBeforeOpen) lastFocusedBeforeOpen = document.activeElement;
      if (closeBtn) {
        requestAnimationFrame(() => closeBtn.focus());
      }
      document.addEventListener("keydown", trapFocus);
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
      imgEl.src = "";
      document.removeEventListener("keydown", trapFocus);
      if (lastFocusedBeforeOpen && typeof lastFocusedBeforeOpen.focus === "function") {
        lastFocusedBeforeOpen.focus();
      }
      lastFocusedBeforeOpen = null;
    }

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickableImg = target.closest(
        ".cert-card img, .gallery-grid img, .life-photos-grid img"
      );

      if (clickableImg) {
        event.preventDefault();
        const src = clickableImg.getAttribute("src");
        const alt = clickableImg.getAttribute("alt") || "";
        if (src) {
          openLightbox(src, alt, clickableImg);
        }
        return;
      }

      if (target === lightbox) {
        closeLightbox();
      }
    });

    closeBtn &&
      closeBtn.addEventListener("click", () => {
        closeLightbox();
      });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });
  }

  /** =============================
   * 报名照点击揭示个人照 + 头像 3D 卡片倾斜（鼠标跟随）
   * ============================= */
  function initAvatarReveal() {
    const avatarReveal = document.querySelector(".avatar-reveal");
    if (!avatarReveal) return;
    const inner = avatarReveal.querySelector(".avatar-reveal-inner");
    if (!inner) return;

    avatarReveal.addEventListener("click", (e) => {
      e.preventDefault();
      const revealed = avatarReveal.classList.toggle("avatar-reveal--revealed");
      avatarReveal.setAttribute("data-revealed", revealed ? "true" : "false");
    });

    const maxTilt = 14;
    const maxScale = 1.03;

    function getClientXY(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onTiltMove(e) {
      const rect = avatarReveal.getBoundingClientRect();
      const { x: clientX, y: clientY } = getClientXY(e);
      const x = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (clientY - rect.top - rect.height / 2) / (rect.height / 2);
      const rotateY = x * maxTilt;
      const rotateX = -y * maxTilt;
      inner.style.setProperty("--avatar-rotate-x", rotateX + "deg");
      inner.style.setProperty("--avatar-rotate-y", rotateY + "deg");
      inner.style.setProperty("--avatar-scale", String(maxScale));
    }

    function onTiltLeave() {
      inner.style.setProperty("--avatar-rotate-x", "0deg");
      inner.style.setProperty("--avatar-rotate-y", "0deg");
      inner.style.setProperty("--avatar-scale", "1");
    }

    avatarReveal.addEventListener("mousemove", onTiltMove, { passive: true });
    avatarReveal.addEventListener("mouseleave", onTiltLeave);
    avatarReveal.addEventListener("touchmove", onTiltMove, { passive: true });
    avatarReveal.addEventListener("touchend", onTiltLeave, { passive: true });
    avatarReveal.addEventListener("touchcancel", onTiltLeave, { passive: true });
  }

  /** =============================
   * Navier-Stokes 流体模拟（速度场 + 染料场）
   * Diffusion → Advection → Projection 流水线
   * 涡旋约束 + 静止时自动漩涡
   * ============================= */
  const fluidConfig = {
    N: 48,
    M: 27,
    viscosity: 0.0008,
    diffusion: 0.0006,
    dt: 1 / 60,
    decay: 0.994,
    dyeInjection: 0.65,
    mouseForce: 12,
    vorticityStrength: 12,
    idleSwirlStrength: 0.6,
    idleSwirlRadius: 0.35,
    pressureIterations: 10,
    diffusionIterations: 4,
    color: "#22d3ee",
  };

  function initMouseRipple(configOverride) {
    const cfg = { ...fluidConfig, ...configOverride };
    const canvas = document.getElementById("ripple-canvas");
    if (!canvas || !canvas.getContext) return;

    const prefersFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!prefersFinePointer) return;

    const ctx = canvas.getContext("2d");
    const N = cfg.N;
    const M = cfg.M;
    const total = (N + 2) * (M + 2);
    const idx = (i, j) => i * (M + 2) + j;

    let u = new Float32Array(total);
    let v = new Float32Array(total);
    let u0 = new Float32Array(total);
    let v0 = new Float32Array(total);
    let p = new Float32Array(total);
    let div = new Float32Array(total);
    let dye = new Float32Array(total);
    let dye0 = new Float32Array(total);
    let curl = new Float32Array(total);
    let curlX = new Float32Array(total);
    let curlY = new Float32Array(total);

    let mouseX = 0.5;
    let mouseY = 0.5;
    let prevMouseX = 0.5;
    let prevMouseY = 0.5;
    let lastMouseTime = 0;
    const idleThresholdMs = 1500;

    function setBounds(b, x) {
      for (let j = 1; j <= M; j++) {
        x[idx(0, j)] = b === 1 ? -x[idx(1, j)] : x[idx(1, j)];
        x[idx(N + 1, j)] = b === 1 ? -x[idx(N, j)] : x[idx(N, j)];
      }
      for (let i = 1; i <= N; i++) {
        x[idx(i, 0)] = b === 2 ? -x[idx(i, 1)] : x[idx(i, 1)];
        x[idx(i, M + 1)] = b === 2 ? -x[idx(i, M)] : x[idx(i, M)];
      }
      x[idx(0, 0)] = 0.5 * (x[idx(1, 0)] + x[idx(0, 1)]);
      x[idx(0, M + 1)] = 0.5 * (x[idx(1, M + 1)] + x[idx(0, M)]);
      x[idx(N + 1, 0)] = 0.5 * (x[idx(N, 0)] + x[idx(N + 1, 1)]);
      x[idx(N + 1, M + 1)] = 0.5 * (x[idx(N, M + 1)] + x[idx(N + 1, M)]);
    }

    function diffuse(b, x, x0, diff) {
      const a = cfg.dt * diff * N * M;
      for (let k = 0; k < cfg.diffusionIterations; k++) {
        for (let i = 1; i <= N; i++) {
          for (let j = 1; j <= M; j++) {
            x[idx(i, j)] =
              (x0[idx(i, j)] +
                a *
                  (x[idx(i - 1, j)] +
                    x[idx(i + 1, j)] +
                    x[idx(i, j - 1)] +
                    x[idx(i, j + 1)])) /
              (1 + 4 * a);
          }
        }
        setBounds(b, x);
      }
    }

    function advect(b, d, d0, du, dv) {
      const dt0 = cfg.dt * N;
      const dt1 = cfg.dt * M;
      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
          let x = i - dt0 * du[idx(i, j)];
          let y = j - dt1 * dv[idx(i, j)];
          x = Math.max(0.5, Math.min(N + 0.5, x));
          y = Math.max(0.5, Math.min(M + 0.5, y));
          const i0 = Math.floor(x);
          const i1 = i0 + 1;
          const j0 = Math.floor(y);
          const j1 = j0 + 1;
          const s1 = x - i0;
          const s0 = 1 - s1;
          const t1 = y - j0;
          const t0 = 1 - t1;
          d[idx(i, j)] =
            s0 * (t0 * d0[idx(i0, j0)] + t1 * d0[idx(i0, j1)]) +
            s1 * (t0 * d0[idx(i1, j0)] + t1 * d0[idx(i1, j1)]);
        }
      }
      setBounds(b, d);
    }

    function project() {
      const h = 1 / (N * M);
      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
          div[idx(i, j)] =
            -0.5 *
            h *
            (u[idx(i + 1, j)] -
              u[idx(i - 1, j)] +
              v[idx(i, j + 1)] -
              v[idx(i, j - 1)]);
          p[idx(i, j)] = 0;
        }
      }
      setBounds(0, div);
      setBounds(0, p);
      for (let k = 0; k < cfg.pressureIterations; k++) {
        for (let i = 1; i <= N; i++) {
          for (let j = 1; j <= M; j++) {
            p[idx(i, j)] =
              (div[idx(i, j)] +
                p[idx(i - 1, j)] +
                p[idx(i + 1, j)] +
                p[idx(i, j - 1)] +
                p[idx(i, j + 1)]) /
              4;
          }
        }
        setBounds(0, p);
      }
      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
          u[idx(i, j)] -= 0.5 * N * (p[idx(i + 1, j)] - p[idx(i - 1, j)]);
          v[idx(i, j)] -= 0.5 * M * (p[idx(i, j + 1)] - p[idx(i, j - 1)]);
        }
      }
      setBounds(1, u);
      setBounds(2, v);
    }

    function addMouseForce() {
      const i = Math.max(1, Math.min(N, Math.floor(mouseX * (N + 1))));
      const j = Math.max(1, Math.min(M, Math.floor(mouseY * (M + 1))));
      const fx = (mouseX - prevMouseX) * cfg.mouseForce;
      const fy = (mouseY - prevMouseY) * cfg.mouseForce;
      const rad = 4;
      for (let di = -rad; di <= rad; di++) {
        for (let dj = -rad; dj <= rad; dj++) {
          const ni = i + di;
          const nj = j + dj;
          if (ni < 1 || ni > N || nj < 1 || nj > M) continue;
          const dist = Math.sqrt(di * di + dj * dj) / (rad + 1);
          const w = 1 - dist * dist;
          u[idx(ni, nj)] += fx * w;
          v[idx(ni, nj)] += fy * w;
          dye[idx(ni, nj)] = Math.min(1, dye[idx(ni, nj)] + cfg.dyeInjection * w);
        }
      }
    }

    function addIdleSwirl() {
      const now = performance.now();
      if (now - lastMouseTime < idleThresholdMs) return;
      const t = now * 0.001;
      const cx = 0.5 + 0.3 * Math.sin(t * 0.7);
      const cy = 0.5 + 0.3 * Math.cos(t * 0.5);
      const r = cfg.idleSwirlRadius * Math.min(N, M);
      const strength = cfg.idleSwirlStrength * 0.002;
      const i0 = Math.max(1, Math.floor((cx - r / N) * N));
      const i1 = Math.min(N, Math.floor((cx + r / N) * N));
      const j0 = Math.max(1, Math.floor((cy - r / M) * M));
      const j1 = Math.min(M, Math.floor((cy + r / M) * M));
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          const x = i / N - cx;
          const y = j / M - cy;
          const d = Math.sqrt(x * x + y * y) * Math.max(N, M);
          if (d > r) continue;
          const w = 1 - d / r;
          const curl = strength * w;
          u[idx(i, j)] -= y * curl;
          v[idx(i, j)] += x * curl;
          dye[idx(i, j)] = Math.min(1, dye[idx(i, j)] + 0.02 * w);
        }
      }
    }

    function vorticityConfinement() {
      const eps = 0.0001;
      const scale = 0.5 * cfg.vorticityStrength / N;
      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
          curl[idx(i, j)] =
            (v[idx(i + 1, j)] - v[idx(i - 1, j)]) * 0.5 * M -
            (u[idx(i, j + 1)] - u[idx(i, j - 1)]) * 0.5 * N;
        }
      }
      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
          curlX[idx(i, j)] =
            Math.abs(curl[idx(i + 1, j)]) - Math.abs(curl[idx(i - 1, j)]);
          curlY[idx(i, j)] =
            Math.abs(curl[idx(i, j + 1)]) - Math.abs(curl[idx(i, j - 1)]);
          const len =
            Math.sqrt(
              curlX[idx(i, j)] * curlX[idx(i, j)] +
                curlY[idx(i, j)] * curlY[idx(i, j)]
            ) + eps;
          curlX[idx(i, j)] /= len;
          curlY[idx(i, j)] /= len;
          const f = curl[idx(i, j)] * scale;
          u[idx(i, j)] += curlY[idx(i, j)] * f;
          v[idx(i, j)] -= curlX[idx(i, j)] * f;
        }
      }
    }

    function decayFields() {
      for (let k = 0; k < total; k++) {
        u[k] *= cfg.decay;
        v[k] *= cfg.decay;
        dye[k] *= cfg.decay;
      }
    }

    function step() {
      u0.set(u);
      v0.set(v);
      dye0.set(dye);
      addMouseForce();
      addIdleSwirl();
      diffuse(1, u, u0, cfg.viscosity);
      diffuse(2, v, v0, cfg.viscosity);
      vorticityConfinement();
      project();
      u0.set(u);
      v0.set(v);
      advect(1, u, u0, u0, v0);
      advect(2, v, v0, u0, v0);
      project();
      diffuse(0, dye, dye0, cfg.diffusion);
      dye0.set(dye);
      advect(0, dye, dye0, u, v);
      decayFields();
    }

    function render() {
      // 只渲染流体网格本身的尺寸 (N+2)×(M+2)，CSS 负责拉伸到全屏
      // 从 830万像素/帧 降到 5096像素/帧，约减少 1600 倍的 CPU 写入
      const w = N + 2;
      const h = M + 2;
      const imgData = ctx.createImageData(w, h);
      const R = parseInt(cfg.color.slice(1, 3), 16);
      const G = parseInt(cfg.color.slice(3, 5), 16);
      const B = parseInt(cfg.color.slice(5, 7), 16);
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const d = Math.min(1, dye[idx(i, j)]);
          const a = Math.floor(255 * d * 0.9);
          const i4 = (j * w + i) * 4;
          imgData.data[i4]     = R;
          imgData.data[i4 + 1] = G;
          imgData.data[i4 + 2] = B;
          imgData.data[i4 + 3] = a;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    function setupCanvas(canvasEl) {
      function resize() {
        // canvas 物理尺寸 = 流体网格大小，CSS 拉伸到全屏
        canvasEl.width  = N + 2;
        canvasEl.height = M + 2;
        canvasEl.style.width  = window.innerWidth  + "px";
        canvasEl.style.height = window.innerHeight + "px";
        canvasEl.style.imageRendering = "pixelated";
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      resize();
      window.addEventListener("resize", debounce(resize, 120), { passive: true });
    }

    window.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        lastMouseTime = performance.now();
      },
      { passive: true }
    );

    let prevTime = 0;
    function animate(t) {
      if (t - prevTime < 14) return;
      prevTime = t;
      step();
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      render();
    }

    setupCanvas(canvas);
    registerFrameCallback(animate);
  }

  /** =============================
   * Slogan 英文句子：艺术字 + 鼠标文字排斥（两行，第二行字号更大）
   * ============================= */
  function initSloganRepulsion() {
    const sloganEl = document.getElementById("hero-slogan");
    const textWrap = sloganEl?.querySelector(".slogan-text");
    if (!textWrap) return;

    const line1 = sloganEl?.getAttribute("data-slogan-line1");
    const line2 = sloganEl?.getAttribute("data-slogan-line2");
    const lines = [];
    if (line1) lines.push({ text: line1, className: "slogan-line slogan-line1" });
    if (line2) lines.push({ text: line2, className: "slogan-line slogan-line2" });
    if (lines.length === 0) {
      const raw = sloganEl?.getAttribute("data-slogan");
      if (raw) lines.push({ text: raw, className: "slogan-line" });
    }
    if (lines.length === 0) return;

    lines.forEach(({ text, className }) => {
      const lineWrap = document.createElement("span");
      lineWrap.className = className;
      const chars = text.split("");
      chars.forEach((ch) => {
        const span = document.createElement("span");
        span.className = "slogan-char";
        span.textContent = ch === " " ? "\u00A0" : ch;
        lineWrap.appendChild(span);
      });
      textWrap.appendChild(lineWrap);
    });

    const radius = 140;
    const strength = 28;
    let rafId = null;
    let mouseX = -1e4;
    let mouseY = -1e4;

    function updateTransforms() {
      const spans = textWrap.querySelectorAll(".slogan-char");
      spans.forEach((span) => {
        const rect = span.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist >= radius) {
          span.style.transform = "";
          return;
        }
        const t = 1 - dist / radius;
        const force = t * t * strength;
        const nx = dx / dist;
        const ny = dy / dist;
        span.style.transform = `translate(${nx * force}px, ${ny * force}px)`;
      });
      rafId = null;
    }

    function getClientXY(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onMove(e) {
      const { x, y } = getClientXY(e);
      mouseX = x;
      mouseY = y;
      if (rafId == null) rafId = requestAnimationFrame(updateTransforms);
    }

    function onLeave() {
      mouseX = -1e4;
      mouseY = -1e4;
      requestAnimationFrame(updateTransforms);
    }

    const hero = document.getElementById("hero");
    if (hero) {
      hero.addEventListener("mousemove", onMove, { passive: true });
      hero.addEventListener("mouseleave", onLeave, { passive: true });
      hero.addEventListener("touchmove", onMove, { passive: true });
      hero.addEventListener("touchend", onLeave, { passive: true });
      hero.addEventListener("touchcancel", onLeave, { passive: true });
    }
  }
})();
