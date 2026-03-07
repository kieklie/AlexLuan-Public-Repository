# 详细开发计划 (dev-plan.md)

> 本文档是面向实际编码的 **逐步骤开发计划**，与 `plan.md` 的宏观方案形成互补。  
> 每个 Phase 拆分为具体可执行的 Task，带有明确的文件路径和实现要点。

---

## Phase 1：HTML 结构搭建

> 文件：`index.html`  
> 目标：完成 8 个板块的完整 HTML 语义结构，所有文字内容硬编码到位。

### Task 1.1 — 文档骨架与全局元素

- 创建 `index.html`，设置 `<!DOCTYPE html>` + `lang="zh-CN"` + `<meta charset="UTF-8">`
- `<head>` 引入：
  - `css/style.css`（外部样式表）
  - Google Fonts：`Fira Code` / `JetBrains Mono`
  - `<meta name="viewport">` 移动端适配
  - `<title>` 栾宜伟 - 个人简历
  - `<link rel="icon" href="assets/favicon.ico">`
- `<body>` 底部引入 `js/main.js`（defer）

### Task 1.2 — 顶部导航栏 `<nav>`

- 固定/粘性导航 `<nav class="navbar">`
- Logo/姓名 `<a class="nav-logo">` 链接回顶部
- 导航链接 `<ul class="nav-links">`，锚点对应 8 个板块 `#hero` `#about` `#education` `#experience` `#projects` `#skills` `#interests` `#footer`
- 移动端汉堡菜单按钮 `<button class="nav-toggle">`

### Task 1.3 — Hero 首屏 `<section id="hero">`

- `<canvas id="particles-canvas">`（粒子动画画布）
- `<div class="hero-content">`
  - `<h1 class="typewriter">`：姓名「栾宜伟」
  - `<p class="subtitle">`：一句话介绍（占位）
  - 社交图标区 `<div class="social-links">`：GitHub（href → `https://github.com/kieklie`）、邮箱 mailto
- `<a class="scroll-down-arrow" href="#about">`：向下箭头 SVG

### Task 1.4 — 关于我 `<section id="about">`

- `<div class="about-container">`（flex 左右布局）
  - 左：`<div class="avatar-wrapper">` → `<img src="assets/images/avatar.jpg">`
  - 右：`<div class="info-card glass">`
    - 姓名、出生年月、籍贯、联系方式（邮箱/电话）、学历

### Task 1.5 — 教育背景 `<section id="education">`

- `<div class="timeline">`
  - `<div class="timeline-item">`（每段教育经历一个节点）
    - 安徽大学 — 物联网工程 — 2019.09 ~ 2023.06
    - 双一流/211 徽章、GPA 信息、奖项徽章

### Task 1.6 — 工作与实习经历 `<section id="experience">`

- `<div class="experience-grid">`
  - 4 张 `<div class="exp-card">`，每张包含：
    - 公司名、职位、时间跨度
    - `<div class="exp-details">`（可展开的详情区域）
    - 4 段经历按时间倒序排列

### Task 1.7 — 项目经历 `<section id="projects">`

- `<div class="projects-grid">`
  - 5 张 `<div class="project-card flip-card">`，每张包含：
    - `<div class="flip-front">`：项目名 + 类型标签 + 技术栈 tag + 简介
    - `<div class="flip-back">`：详细描述

### Task 1.8 — 技能与证书 `<section id="skills">`

- **技能部分** `<div class="skills-section">`
  - 分类容器：编程语言、软件工具
  - 每项：`<div class="skill-item">` → 名称 + `<div class="progress-bar">` + 百分比
- **证书部分** `<div class="certificates-section">`
  - 轮播容器 `<div class="carousel">`
    - 4 张 `<div class="cert-card">` → `<img src="assets/images/certificateX.jpg">`
    - 左右切换按钮 `<button class="carousel-prev/next">`
  - 灯箱遮罩 `<div class="lightbox" id="lightbox">`

### Task 1.9 — 个人兴趣 `<section id="interests">`

- **游戏展示区** `<div class="games-showcase">`
  - 饥荒卡片（仅保留饥荒，不展示 CS2）
- **电竞区** `<div class="esports">`
  - monesy 选手信息卡片 / 引用语
- **截图画廊** `<div class="gallery-grid">`
  - ✅ 饥荒截图已提供（4张）：
    - `assets/images/饥荒幽灵.jpg`
    - `assets/images/饥荒毕业.png`
    - `assets/images/饥荒游乐园.png`
    - `assets/images/饥荒种地.png`
- **Steam 链接** `<a class="steam-btn" href="https://steamcommunity.com/profiles/76561198983980478/">` 图标 + 文字
- **生活照片** `<div class="life-photos-grid">`
  - ✅ 照片已提供（3张）：
    - `assets/images/个人照.jpg`
    - `assets/images/旅游照.jpg`
    - `assets/images/生活照.jpg`

### Task 1.10 — 页脚 `<footer id="footer">`

- GitHub 链接按钮（href → `https://github.com/kieklie`）
- 邮箱 mailto 链接
- 回到顶部按钮 `<a href="#hero">`
- 版权信息 `<p class="copyright">`

---

## Phase 2：CSS 样式实现

> 文件：`css/style.css`  
> 目标：完成所有视觉样式，包括渐变、动画关键帧、响应式断点。

### Task 2.1 — 全局重置与 CSS 变量

- `*` 盒模型 `box-sizing: border-box`，清除默认 margin/padding
- `:root` 定义 CSS 变量：
  - `--gradient-primary: linear-gradient(135deg, #667eea, #764ba2)`
  - `--gradient-secondary: linear-gradient(135deg, #f093fb, #f5576c)`
  - `--gradient-accent: linear-gradient(135deg, #4facfe, #00f2fe)`
  - `--gradient-vibrant: linear-gradient(135deg, #43e97b, #38f9d7)`
  - `--gradient-warm: linear-gradient(135deg, #fa709a, #fee140)`
  - `--text-primary: #2d3748`
  - `--text-secondary: #718096`
  - `--bg-color: #f7fafc`
- `html { scroll-behavior: smooth; }`
- `body` 字体栈：`"PingFang SC", "Microsoft YaHei", sans-serif`

### Task 2.2 — 导航栏样式

- `.navbar`：`position: sticky; top: 0; z-index: 1000;` 毛玻璃背景 `backdrop-filter: blur(10px)`
- `.nav-links a`：悬停下划线动画（`::after` 伪元素 + `scaleX` 过渡）
- `.navbar.scrolled`：滚动后添加阴影 + 更不透明的背景
- 移动端：`.nav-toggle` 显示，`.nav-links` 折叠/展开

### Task 2.3 — Hero 首屏样式

- `#hero`：`min-height: 100vh; display: flex; align-items: center; justify-content: center;`
- 渐变背景 `background: var(--gradient-primary); background-size: 400% 400%;`
- `@keyframes gradientFlow`：`background-position` 流动动画
- `.typewriter` 光标闪烁：`border-right` + `@keyframes blink`
- `#particles-canvas`：绝对定位铺满，`pointer-events: none`
- `.scroll-down-arrow`：`@keyframes bounce` 弹跳
- `.social-links a`：悬停 `transform: scale(1.2)` + `filter: drop-shadow()` 发光

### Task 2.4 — 关于我样式

- `.about-container`：`display: flex; gap: 3rem; align-items: center;`
- `.avatar-wrapper img`：`border-radius: 50%; width: 200px;`
  - 悬停：`transform: rotate(5deg) scale(1.05)` + `box-shadow` 光晕
- `.glass`（毛玻璃卡片）：`background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);`
- `.fade-in-up`：初始 `opacity: 0; transform: translateY(30px);` → 过渡到 `opacity: 1; transform: translateY(0);`

### Task 2.5 — 教育背景时间线样式

- `.timeline`：垂直线（`::before` 伪元素居中细线）
- `.timeline-item`：左右交替排列（`nth-child(odd/even)`）
- `.timeline-item::before`（圆点节点）+ `@keyframes pulse` 脉冲动画
- `.badge`：`display: inline-block; padding: 0.25em 0.75em; border-radius: 999px; background: var(--gradient-accent); color: white; font-size: 0.85rem;`

### Task 2.6 — 工作经历卡片样式

- `.exp-card`：`padding; border-radius: 1rem; background: white; transition: transform 0.3s, box-shadow 0.3s;`
- `.exp-card::before`（彩虹流光边框）：`@keyframes rainbowBorder` + `background: conic-gradient(...)` + `animation`
- `.exp-details`：`max-height: 0; overflow: hidden; transition: max-height 0.5s;`
  - `.exp-card.active .exp-details { max-height: 500px; }`

### Task 2.7 — 项目卡片翻转样式

- `.flip-card`：`perspective: 1000px;`
- `.flip-card-inner`：`transition: transform 0.6s; transform-style: preserve-3d;`
- `.flip-front, .flip-back`：`backface-visibility: hidden; position: absolute; width/height: 100%;`
- `.flip-back`：`transform: rotateY(180deg);`
- `.flip-card:hover .flip-card-inner`：`transform: rotateY(180deg);`
- `.tag`：技术栈标签 — 不同颜色的小胶囊

### Task 2.8 — 技能进度条 + 证书轮播样式

- `.progress-bar`：外框 `background: #e2e8f0; border-radius: 999px; height: 10px;`
- `.progress-bar-fill`：`width: 0; transition: width 1.5s ease;`（JS 触发时设为目标 `width`）
- `.carousel`：`overflow: hidden; position: relative;`
- `.carousel-track`：`display: flex; transition: transform 0.5s ease;`
- `.cert-card`：悬停 `box-shadow: 0 0 20px rgba(102,126,234,0.5); transform: translateY(-5px);`
- `.lightbox`：`position: fixed; inset: 0; background: rgba(0,0,0,0.8); opacity: 0; pointer-events: none; transition: opacity 0.3s;`
  - `.lightbox.active`：`opacity: 1; pointer-events: all;`

### Task 2.9 — 个人兴趣板块样式

- `.games-showcase`：`display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;`
- 游戏卡片：悬停 `transform: scale(1.03)` + `box-shadow` 光影
- `.gallery-grid`：`display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;`
- 画廊图片悬停：`transform: scale(1.05)` + `box-shadow`
- `.steam-btn`：渐变背景 + 悬停发光 `filter: brightness(1.1)` + `box-shadow`
- `.esports` 引用语：`font-style: italic; border-left: 4px solid var(--gradient-accent);`

### Task 2.10 — 页脚样式

- `#footer`：渐变背景，白色文字
- 顶部渐变分割线 `::before`
- 按钮悬停放大 + 发光

### Task 2.11 — 响应式断点

- `@media (max-width: 1023px)`：
  - `.about-container` 改 `flex-direction: column`
  - `.timeline-item` 取消左右交替，统一单侧
  - 网格列数减少
- `@media (max-width: 767px)`：
  - 所有网格改为单列
  - 导航栏折叠为汉堡菜单
  - 减小 `font-size`、`padding`
  - 禁用部分性能消耗大的动画（粒子、3D 倾斜）

---

## Phase 3：JS 交互实现

> 文件：`js/main.js`  
> 目标：实现所有交互逻辑，包含粒子系统、滚动动画、轮播、3D 效果、灯箱等。

### Task 3.1 — 粒子系统 (Canvas)

- 获取 `#particles-canvas`，设置 `width/height` 为窗口大小
- 粒子类 `Particle`：属性 `x, y, radius, speedX, speedY, opacity`
- 初始化 100+ 个粒子，随机位置/大小/速度
- `animate()` 循环：清空画布 → 遍历更新位置 → 绘制圆形 → `requestAnimationFrame`
- 窗口 `resize` 事件重设 canvas 尺寸
- 移动端减少粒子数量（性能优化）

### Task 3.2 — 打字机效果

- 目标元素 `.typewriter`
- 定义文字字符串（姓名 + 介绍）
- `setInterval` 逐字 append 到 `textContent`
- 打完后光标保持闪烁（CSS 处理）
- 支持多行：先打姓名，暂停，再打介绍语

### Task 3.3 — 滚动淡入动画 (Intersection Observer)

- 选取所有 `.fade-in-up` 元素
- 创建 `IntersectionObserver`（`threshold: 0.15`）
- 元素进入视口时添加 `.visible` class → CSS 过渡触发
- 可选：不同元素错开延迟（`transition-delay` 通过 `data-delay` 属性控制）

### Task 3.4 — 导航栏滚动效果

- 监听 `scroll` 事件
- 滚动距离 > 50px 时，`navbar` 添加 `.scrolled` class
- 高亮当前板块对应的导航链接（Intersection Observer 监测各 section）
- 移动端汉堡菜单切换 `.nav-links` 展开/收起

### Task 3.5 — 3D 卡片倾斜效果

- 选取所有 `.exp-card`
- `mousemove` 事件：计算鼠标相对卡片中心的偏移 → 映射为 `rotateX/Y` 角度（±15deg 范围）
- `mouseleave` 事件：重置 `transform` 为 `none`（带过渡）
- 设置卡片 `perspective: 1000px` + `transform-style: preserve-3d`

### Task 3.6 — 经历卡片展开/收起

- 点击 `.exp-card` → toggle `.active` class
- `.exp-details` 的 `max-height` 由 CSS 过渡控制
- 同一时间只展开一张（可选：关闭其他已展开卡片）

### Task 3.7 — 技能进度条填充动画

- Intersection Observer 监测 `.skills-section`
- 进入视口时，遍历所有 `.progress-bar-fill`
- 读取 `data-progress` 属性值 → 设置 `style.width = X%`
- CSS `transition: width 1.5s ease` 驱动动画
- 只触发一次（`observer.unobserve`）

### Task 3.8 — 证书轮播 (Carousel)

- `.carousel-track` 内含 4 张 cert-card
- 维护当前索引 `currentSlide`
- 点击 `.carousel-prev` → `currentSlide--` → `track.style.transform = translateX(-${currentSlide * 100}%)`
- 点击 `.carousel-next` → `currentSlide++`
- 边界处理：循环或禁用按钮
- 可选：自动轮播 `setInterval`（悬停暂停）
- 触摸滑动支持（`touchstart/touchend` 事件）

### Task 3.9 — 灯箱 (Lightbox)

- 点击 `.cert-card img` 或 `.gallery-grid img` → 打开灯箱
- 将点击图片的 `src` 赋给灯箱内 `<img>`
- 添加 `.lightbox.active` class → CSS 淡入
- 点击遮罩或关闭按钮 → 移除 `.active`
- `Escape` 键关闭

### Task 3.10 — 平滑滚动 + 回到顶部

- 导航链接点击拦截默认行为 → `scrollIntoView({ behavior: 'smooth' })`
- 回到顶部按钮：滚动超过一屏高度时显示（`opacity` 过渡）
- 点击后 `window.scrollTo({ top: 0, behavior: 'smooth' })`

### Task 3.11 — 鼠标跟随光标（可选）

- 创建自定义光标 `<div class="custom-cursor">`
- `mousemove` 事件：更新光标元素 `left/top` 位置
- 悬停在可交互元素上时放大光标
- 移动端检测后禁用

---

## Phase 4：内容填充与资源替换

> 目标：将占位内容替换为真实数据和资源文件。

### Task 4.1 — 证书图片接入

- 确认 `assets/images/` 下 4 张 JPG 文件就绪：
  - `certificate1.jpg` — Introduction to Model Context Protocol
  - `certificate2.jpg` — Claude 101
  - `certificate3.jpg` — Claude Code in Action
  - `certificate-RPA.jpg` — 影刀 RPA 初级认证
- HTML `<img>` 的 `src` 指向正确路径
- 添加 `alt` 文字和 `loading="lazy"`

### Task 4.2 — 个人头像替换 ✅

- ✅ 头像已提供：`assets/images/栾宜伟_ 电子报名照 .jpg`
- 更新 `<img src="assets/images/栾宜伟_ 电子报名照 .jpg" alt="栾宜伟">`

### Task 4.3 — 游戏截图接入 ✅

- ✅ 饥荒截图已提供（4张），直接存放在 `assets/images/` 下（无子目录）：
  - `饥荒幽灵.jpg`
  - `饥荒毕业.png`
  - `饥荒游乐园.png`
  - `饥荒种地.png`
- CS2 无截图，不展示
- 更新 `#interests` 板块中 `.gallery-grid` 内的 `<img>` 标签指向以上文件

### Task 4.4 — 生活照片接入 ✅

- ✅ 生活照已提供（3张），直接存放在 `assets/images/` 下（无子目录）：
  - `个人照.jpg`
  - `旅游照.jpg`
  - `生活照.jpg`
- 更新 `.life-photos-grid` 内的 `<img>` 标签指向以上文件

### Task 4.5 — Steam 链接填充 ✅

- ✅ Steam 链接已提供：`https://steamcommunity.com/profiles/76561198983980478/`
- 更新 `.steam-btn` 的 `href` 属性为以上链接

### Task 4.6 — 一句话自我介绍

- 待用户提供后更新 `.subtitle` 文字内容

### Task 4.7 — Favicon 制作

- 使用在线工具（如 favicon.io）生成 `favicon.ico`
- 放入 `assets/` 目录根目录

---

## Phase 5：部署与优化

> 目标：Git 初始化、推送至 GitHub、开启 Pages、性能优化。

### Task 5.1 — Git 初始化

- `git init`
- 创建 `.gitignore`：
  ```
  .DS_Store
  Thumbs.db
  *.pdf
  node_modules/
  ```
- `git add . && git commit -m "Initial commit: resume website"`

### Task 5.2 — GitHub 仓库创建与推送

- GitHub 上创建新仓库（账号 `kieklie`）
- `git remote add origin https://github.com/kieklie/<仓库名>.git`
- `git push -u origin main`

### Task 5.3 — GitHub Pages 配置

- 仓库 Settings → Pages → Source: `main` branch / `/ (root)`
- 等待部署完成，访问 `https://kieklie.github.io/<仓库名>/` 验证

### Task 5.4 — 创建 README.md

- 项目简介、技术栈、在线预览链接、本地运行说明、文件结构概览

### Task 5.5 — 性能优化检查清单

- [ ] 图片压缩（TinyPNG / Squoosh）：所有 JPG 控制在 200KB 以内
- [ ] 图片设置 `width`/`height` 属性避免布局偏移 (CLS)
- [ ] `<img loading="lazy">` 懒加载非首屏图片
- [ ] CSS/JS 文件压缩（部署前可选 minify）
- [ ] `<meta name="description">` SEO 基础标签
- [ ] Open Graph 标签（社交分享预览）
- [ ] 移动端触摸友好（按钮尺寸 ≥ 44×44px）
- [ ] Lighthouse 跑分 ≥ 90（Performance / Accessibility / Best Practices / SEO）
- [ ] 无控制台错误 / 404 资源

---

> **使用方式**：按照 Phase 1 → 5 顺序执行，每完成一个 Task 可单独测试/预览。Phase 4 的部分 Task 依赖用户提供素材，可在其他 Phase 完成后再逐步补全。
