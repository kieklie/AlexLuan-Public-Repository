# 个人简历网站建设方案

## 一、项目概览

| 项目 | 说明 |
|------|------|
| 项目名称 | 栾宜伟 - 个人简历网站 |
| 技术栈 | HTML5 + CSS3 + Vanilla JavaScript（纯前端，零依赖） |
| 部署方式 | GitHub Pages（免费托管，无需服务器） |
| 数据存储 | 所有数据硬编码于 HTML/JS 中，无需数据库 |
| 设计风格 | 明亮渐变色 + 流畅动画 + 丰富交互 |

---

## 二、页面结构设计（单页应用 SPA）

整个网站为 **一个 HTML 文件**，通过锚点导航实现各板块之间的平滑滚动，共分为 **8 个板块**：

### 1. Hero 首屏区域
- **全屏渐变背景**（紫色 → 蓝色 → 青色动态渐变，背景色缓慢流动）
- 打字机效果逐字显示姓名「栾宜伟」及一句话介绍
- 悬浮的粒子/光点动画作为背景装饰（Canvas 实现）
- 向下滚动引导箭头（弹跳动画）
- **社交链接图标**：GitHub（[kieklie](https://github.com/kieklie)）、邮箱（悬停放大 + 发光效果）

### 2. 关于我 (About)
- 左侧：个人头像（圆形，悬停旋转 + 光晕效果）
- 右侧：个人基本信息卡片（姓名、出生年月、联系方式等）
- 卡片采用**毛玻璃 (glassmorphism)** 风格，半透明渐变边框
- 滚动进入视口时触发 **淡入滑动动画 (fade-in-up)**

### 3. 教育背景 (Education)
- 时间线 (Timeline) 布局
- 安徽大学（双一流/211）信息展示
- GPA、奖项荣誉以**徽章 (badge)** 形式展示
- 时间线节点带有**脉冲动画**
- 滚动触发逐条展现

### 4. 工作与实习经历 (Experience)
- **卡片式布局**，每段经历一张卡片
- 卡片悬停时 **3D 倾斜效果 (tilt)**，鼠标跟随角度变化
- 卡片边框带有**彩虹渐变流光动画**
- 包含以下经历：
  - 上海微创软件 — 技术支持工程师（2024.03 - 2025.04）
  - 爱荔枝科技 — 测试实习生（2023.02 - 2023.05）
  - 生活万岁影视传媒 — 剪辑师（2023.05 - 2024.02）
  - 生活万岁影视传媒 — 纪录片摄影助理（2023.07）
- 每张卡片展开/收起详情（点击交互）

### 5. 项目经历 (Projects)
- **网格 (Grid) 瀑布流布局**
- 每个项目为一个可交互卡片，包含：
  - 项目名称 + 类型标签（毕业论文/个人项目/论文）
  - 技术栈标签（带颜色的 tag）
  - 项目简介
  - 悬停翻转展示详情（3D 翻转卡片效果）
- 包含以下项目：
  - 水稻病害知识图谱（毕业论文）— WebScraper / BiLSTM+CRF
  - 微信聊天机器人（个人项目）— Node / Wechaty
  - 数字化校园网络建设（论文）— IoT 架构
  - 静态网页设计（个人项目）— HTML + CSS
  - C语言游戏设计（论文）— C / EasyX

### 6. 技能与证书 (Skills & Certificates)
- **技能部分**：
  - 环形进度条或动态柱状图展示技能熟练度
  - 分类展示：编程语言（C / Python / Go / PowerShell）、软件工具（Cursor / Office / AE / PR 等）
  - 进度条带有**填充动画**，滚动到视口时触发
- **证书部分**：
  - 证书以**画廊/轮播 (Carousel)** 形式展示
  - 展示 4 张证书图片（certificate1 ~ certificate3 + certificate-RPA）
  - 点击证书可**弹出灯箱 (Lightbox)** 查看大图
  - 证书卡片悬停时**发光边框 + 微微浮起**效果
  - 证书列表：
    - Introduction to Model Context Protocol — Skilljar No. x52q8ojivtp8（certificate1.jpg）
    - Claude 101 — Anthropic（certificate2.jpg）
    - Claude Code in Action — Skilljar No. q2fw62ks5zu6（certificate3.jpg）
    - 影刀 RPA 初级认证 — 编号 YD2025108268（certificate-RPA.jpg）

### 7. 个人兴趣 (Interests & Hobbies)
- **游戏展示区**：
  - 饥荒 (Don't Starve) — 展示游戏截图 + 简短心得
  - 卡片式布局，悬停放大 + 光影效果
- **电竞热情**：
  - CS2 电竞直播观看爱好
  - 最喜欢的选手：**monesy**（展示选手信息/引用语）
  - 可选：嵌入比赛精彩瞬间 GIF 或图片
- **游戏截图画廊**：
  - 网格 (Grid) 布局展示饥荒游戏截图
  - 点击可**弹出灯箱 (Lightbox)** 查看大图
  - ✅ 截图已提供（4张）：`饥荒幽灵.jpg`、`饥荒毕业.png`、`饥荒游乐园.png`、`饥荒种地.png`
- **Steam 主页链接**：
  - 醒目的 Steam 图标按钮，悬停动画
  - ✅ 链接地址：`https://steamcommunity.com/profiles/76561198983980478/`
- **生活照片展示区**：
  - 照片网格/轮播展示
  - ✅ 照片已提供（3张）：`个人照.jpg`、`旅游照.jpg`、`生活照.jpg`

### 8. 页脚 (Footer)
- GitHub 链接按钮（醒目、带图标、悬停动画）
- 邮箱联系方式（点击可直接发送邮件 mailto:）
- 「回到顶部」按钮（平滑滚动）
- 渐变分割线 + 版权信息

---

## 三、视觉设计规范

### 配色方案（明亮渐变主题）

| 用途 | 色值 |
|------|------|
| 主渐变（背景） | `#667eea` → `#764ba2`（蓝紫渐变） |
| 辅渐变（卡片/按钮） | `#f093fb` → `#f5576c`（粉红渐变） |
| 强调渐变 | `#4facfe` → `#00f2fe`（青蓝渐变） |
| 活力渐变 | `#43e97b` → `#38f9d7`（绿青渐变） |
| 暖色渐变 | `#fa709a` → `#fee140`（粉黄渐变） |
| 文字主色 | `#2d3748`（深灰） |
| 文字辅色 | `#718096`（中灰） |
| 背景色 | `#f7fafc`（极浅灰/白） |

### 字体
- 中文标题：系统默认（`"PingFang SC", "Microsoft YaHei", sans-serif`）
- 英文/代码：`"Fira Code", "JetBrains Mono", monospace`（通过 Google Fonts 引入）

---

## 四、动画与交互效果清单

| 效果 | 实现方式 | 应用位置 |
|------|----------|----------|
| 背景渐变流动 | CSS `@keyframes` + `background-size` 动画 | Hero 首屏 |
| 粒子飘浮 | Canvas 2D 绘制 + requestAnimationFrame | Hero 背景 |
| 打字机效果 | JS 逐字渲染 + 闪烁光标 | Hero 标题 |
| 滚动淡入 | Intersection Observer API + CSS transform | 所有板块 |
| 3D 卡片倾斜 | JS 鼠标事件 + CSS `perspective` / `rotateX/Y` | 经历卡片 |
| 翻转卡片 | CSS `backface-visibility` + `rotateY(180deg)` | 项目卡片 |
| 进度条填充 | CSS `width` 动画 + Intersection Observer 触发 | 技能展示 |
| 彩虹流光边框 | CSS `@keyframes` + `background` 渐变旋转 | 卡片边框 |
| 轮播滑动 | JS 控制 `transform: translateX()` | 证书展示 |
| 灯箱弹出 | CSS `opacity` + `scale` 过渡 + JS 控制 | 证书大图 |
| 悬停发光 | CSS `box-shadow` 过渡 | 按钮/卡片 |
| 平滑滚动 | CSS `scroll-behavior: smooth` | 导航锚点 |
| 弹跳箭头 | CSS `@keyframes` bounce | Hero 底部 |
| 导航栏吸顶 | JS `scroll` 事件 + CSS `position: sticky` | 顶部导航 |
| 鼠标跟随光标 | JS `mousemove` + 自定义光标元素 | 全局（可选） |
| 图片网格画廊 | CSS Grid + 悬停 `scale` + `box-shadow` 过渡 | 兴趣板块（游戏截图/生活照） |
| 画廊灯箱 | CSS `opacity` + `scale` 过渡 + JS 控制 | 兴趣板块（点击大图） |
| 图标悬停动画 | CSS `transform` + `filter` 发光效果 | 兴趣板块（Steam 链接） |

---

## 五、文件目录结构

```
Resume/
├── index.html              # 主页面（单页应用，所有内容）
├── css/
│   └── style.css           # 所有样式（渐变、动画、响应式）
├── js/
│   └── main.js             # 所有交互逻辑（粒子、滚动、轮播等）
├── assets/
│   ├── images/
│   │   ├── 栾宜伟_ 电子报名照 .jpg  # 个人头像（✅ 已提供）
│   │   ├── certificate1.jpg          # Introduction to Model Context Protocol 证书
│   │   ├── certificate2.jpg          # Claude 101 证书
│   │   ├── certificate3.jpg          # Claude Code in Action 证书
│   │   ├── certificate-RPA.jpg       # 影刀 RPA 初级认证证书
│   │   ├── 饥荒幽灵.jpg              # 饥荒游戏截图（✅ 已提供）
│   │   ├── 饥荒毕业.png              # 饥荒游戏截图（✅ 已提供）
│   │   ├── 饥荒游乐园.png            # 饥荒游戏截图（✅ 已提供）
│   │   ├── 饥荒种地.png              # 饥荒游戏截图（✅ 已提供）
│   │   ├── 个人照.jpg                # 生活照片（✅ 已提供）
│   │   ├── 旅游照.jpg                # 生活照片（✅ 已提供）
│   │   └── 生活照.jpg                # 生活照片（✅ 已提供）
│   └── favicon.ico              # 网站图标
├── plan.md                 # 本方案文件
├── README.md               # GitHub 项目说明
└── .gitignore              # Git 忽略规则
```

---

## 六、部署方案：GitHub Pages

### 步骤
1. 在 GitHub 创建仓库（如 `resume` 或 `portfolio`）
2. 将项目文件推送到仓库的 `main` 分支
3. 进入仓库 Settings → Pages → 选择 `main` 分支 → 保存
4. 等待几分钟后，网站将在 `https://kieklie.github.io/<仓库名>/` 上线

### 优势
- 完全免费，无需服务器
- 自动 HTTPS
- 支持自定义域名（可选）
- 推送代码即自动更新网站

---

## 七、证书处理方案

由于证书原始格式为 PDF，浏览器无法直接在卡片中优雅展示，已全部转换为 JPG 图片：

### 方案：PDF → JPG 图片
- 使用截图工具或 PDF 阅读器将每张证书导出为 JPG 图片
- 将图片放入 `assets/images/` 目录
- 在网站中以图片形式展示（支持灯箱放大查看）
- 当前已完成全部 4 张证书的转换（certificate1.jpg、certificate2.jpg、certificate3.jpg、certificate-RPA.jpg）

### 免费转换网站ilovepdf.com

---

## 八、您需要准备的材料

| 材料 | 说明 | 状态 |
|------|------|------|
| 个人头像照片 | `栾宜伟_ 电子报名照 .jpg` | ✅ 已提供 |
| GitHub 用户名/链接 | [kieklie](https://github.com/kieklie) | ✅ 已提供 |
| 证书 JPG 图片 | 4 张 PDF 证书已全部转换为 JPG | ✅ 已完成 |
| 一句话自我介绍 | 展示在首屏（如"热爱技术的全栈开发者"） | ❌ 待提供 |
| Steam 主页链接 | `https://steamcommunity.com/profiles/76561198983980478/` | ✅ 已提供 |
| 游戏截图 | 饥荒截图已提供（4张），CS2 无截图不展示 | ✅ 已提供 |
| 生活照片 | 3 张已提供：`个人照.jpg`、`旅游照.jpg`、`生活照.jpg` | ✅ 已提供 |

---

## 九、响应式适配

网站将完整适配以下设备：

| 设备 | 断点 | 适配策略 |
|------|------|----------|
| 桌面端 | ≥ 1024px | 完整布局，所有动画效果 |
| 平板端 | 768px - 1023px | 双列改单列，保留核心动画 |
| 手机端 | < 768px | 单列堆叠，简化动画（性能优化） |

---

## 十、开发计划

| 阶段 | 内容 | 预估 |
|------|------|------|
| Phase 1 | HTML 结构搭建 + 内容填充 | — |
| Phase 2 | CSS 样式（渐变、布局、响应式） | — |
| Phase 3 | JS 交互（粒子、滚动动画、轮播、3D 效果） | — |
| Phase 4 | 证书图片替换 + 细节打磨 | — |
| Phase 5 | GitHub 仓库创建 + Pages 部署 | — |

---

> **备注**：本方案采用纯前端技术（HTML + CSS + JS），无任何框架依赖，无需 Node.js 构建工具，代码推送到 GitHub 即可通过 GitHub Pages 直接访问。所有数据均硬编码在前端代码中，不涉及服务器和数据库。
