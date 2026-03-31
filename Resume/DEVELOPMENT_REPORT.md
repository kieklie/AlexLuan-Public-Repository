# 个人简历网站 - 开发报告

> 基于纯前端技术构建的单页简历展示项目，零框架依赖，无构建工具，适合部署至 GitHub Pages 等静态托管平台。

---

## 项目概述

### 目标

- 构建一份**可视化、交互丰富**的个人简历展示网站
- 采用**纯 HTML/CSS/JS** 实现，降低部署与维护成本
- 提供良好的**无障碍与触摸设备**体验
- 展示前端基础能力：Canvas 动画、CSS 布局、原生 JavaScript 交互

### 技术选型

| 技术 | 说明 |
|------|------|
| **HTML5** | 语义化标签、无障碍属性（ARIA、role） |
| **CSS3** | 渐变、动画、Flex/Grid、backdrop-filter、CSS 变量 |
| **Vanilla JavaScript** | 无 React/Vue 等框架，直接 DOM 操作 |
| **Canvas API** | 粒子效果、流体模拟、像素风动画 |

**零依赖**：不引入 npm、Webpack、Vite 等构建工具，直接通过 `index.html` 引用资源即可运行。

---

## 功能模块

### 1. Hero 首屏

- **背景层**：Navier-Stokes 流体模拟（鼠标驱动 + 空闲漩涡）
- **粒子层**：星云紫蓝色常驻星点 + 鼠标轨迹粒子 + 快速划动爆发效果
- **战机动画**：像素风战机在卡片上方飞行，带白色拖尾
- **打字机效果**：主标题与副标题逐字显示
- **Slogan 排斥**：鼠标/触摸靠近时文字向四周排斥
- **视差滚动**：VIEW RESUME 箭头随滚动淡出并上移

### 2. 导航与布局

- ** sticky 导航**：滚动时背景模糊、边框高亮
- **当前区块高亮**：基于 IntersectionObserver 自动切换激活链接
- **响应式汉堡菜单**：小屏折叠，支持 `aria-expanded` 与 `aria-controls`
- **平滑滚动**：锚点点击平滑滚动，关闭菜单

### 3. 教育背景

- **双图层头像**：点击切换报名照/生活照，3D 卡片倾斜（鼠标/触摸跟随）
- **时间线**：垂直时间轴，脉冲圆点、渐变连线
- **毛玻璃卡片**：`backdrop-filter: blur` 实现

### 4. 工作经历

- **3D 倾斜卡片**：鼠标悬停时卡片随指针倾斜
- **点击展开**：可展开/收起详情列表
- **彩虹流光边框**：hover 时径向渐变高亮

### 5. 项目经历

- **翻转卡片**：hover 时 180° 翻转，正面简介、背面亮点
- **标签系统**：技术栈标签（Python、Node.js、Neo4j 等）
- **响应式网格**：`repeat(auto-fit, minmax(260px, 1fr))` 自适应

### 6. 技能与证书

- **进度条动画**：进入视口后按 `data-progress` 填充
- **证书轮播**：左右按钮切换，灯箱预览
- **灯箱**：`role="dialog"`、焦点陷阱、Esc 关闭、焦点恢复

### 7. 个人兴趣

- **游戏/电竞展示**：卡片 + 引用块
- **图片画廊**：特色布局（左大图 + 右三图），点击灯箱放大
- **生活照片**：自适应网格展示

### 8. 通用交互

- **邮箱复制**：点击邮箱链接复制到剪贴板并提示「已复制」
- **回到顶部**：滚动至 70% 后显示
- **回到首页**：右下角固定按钮
- **文档标题轮播**：定时切换中英文标题

---

## 技术实现要点

### 动画与性能

- **requestAnimationFrame**：统一主循环，按需注册回调（流体、粒子、战机）
- **IntersectionObserver**：滚动淡入、进度条触发、导航高亮、首屏可见性
- **防抖**：resize 事件 120ms 防抖，减少 canvas 重绘
- **节流**：视差滚动用 rAF 节流

### 无障碍 (a11y)

- `:focus-visible` 样式，键盘导航可见
- 灯箱：`role="dialog"`、`aria-modal="true"`、焦点陷阱、关闭后恢复焦点
- 汉堡菜单：`aria-expanded`、`aria-controls`、`aria-label`
- 图片 `alt`、按钮 `aria-label`

### 触摸支持

- Slogan 排斥：`touchmove` / `touchend` / `touchcancel`
- Avatar 3D 倾斜：同上
- 粒子画布：`touchmove` 参与轨迹生成

### 样式系统

- **CSS 变量**：`--neon-primary-rgb`、`--card-bg-rgb`、`--slate-rgb` 等，便于主题扩展
- **媒体查询**：767px / 1023px 断点，移动端布局与动画简化

---

## 项目结构

```
Resume/
├── index.html          # 单页主结构
├── favicon.svg         # 网站图标
├── css/
│   └── style.css       # 样式表（~1950 行）
├── js/
│   └── main.js         # 交互逻辑（~1570 行）
├── assets/
│   └── images/         # 图片资源（头像、证书、截图等）
├── DEVELOPMENT_REPORT.md   # 本开发报告
├── README.md           # 项目说明
└── .gitignore
```

---

## 本地运行与部署

### 本地预览

直接在浏览器中打开 `index.html`，无需启动服务器。

### 部署至 GitHub Pages

1. 将项目推送到 GitHub 仓库
2. 进入 **Settings → Pages**
3. 选择 `main` 分支作为源
4. 访问 `https://<username>.github.io/<repo>/`

---

## 浏览器兼容

- 现代浏览器：Chrome、Firefox、Safari、Edge
- `backdrop-filter` 在部分旧版 Safari 需 `-webkit-` 前缀（已包含）
- 流体效果在 `pointer: fine` 设备（桌面）启用，触摸设备可选用简化粒子效果

---

## License

MIT
