# 贪吃蛇游戏 🐍

一个功能丰富的网页版贪吃蛇游戏，支持多种游戏模式、历史记录、移动端适配等功能。

## 功能特性

### 🎮 游戏模式
- **经典模式**：传统的贪吃蛇玩法，碰到墙壁或自己游戏结束
- **循环模式**：碰到墙壁会从另一侧出现，只有碰到自己才会死亡

### 🎯 游戏玩法
- 使用方向键（↑↓←→）或WASD控制蛇的移动
- 移动端支持触摸控制按钮
- 吃到红色小食物：+10分，蛇身+1节
- 吃到金色大食物：+30分，蛇身+3节
- 大食物随机出现（30%概率）

### ⏸️ 游戏控制
- **开始游戏**：开始新游戏
- **暂停**：暂停当前游戏
- **继续**：继续暂停的游戏
- **重新开始**：重新开始游戏

### 📊 历史记录
- 自动保存游戏分数和时间
- 按游戏模式分别记录
- 显示最高分记录（🏆标识）
- 支持清除历史记录

### 🎨 界面特色
- 精美的渐变色设计
- 流畅的动画效果
- 自定义弹出框，符合整体风格
- 响应式设计，适配各种屏幕尺寸
- 移动端优化，支持触摸操作

## 快速开始

### 方法一：本地运行

1. **直接打开HTML文件**
   - 双击 `snake.html` 文件在浏览器中打开

2. **使用Python HTTP服务器**
   ```bash
   # Windows
   start_server.bat
   
   # 或者手动启动
   python -m http.server 8000
   ```
   然后访问：http://localhost:8000/snake.html

### 方法二：部署到云平台

#### GitHub Pages（免费）
1. 创建GitHub仓库
2. 上传游戏文件
3. 在仓库设置中启用GitHub Pages
4. 获得永久免费访问地址

#### Vercel（免费）
1. 访问 https://vercel.com/
2. 使用GitHub账号登录
3. 导入仓库，自动部署

#### Netlify（免费）
1. 访问 https://www.netlify.com/
2. 拖拽项目文件夹到网站
3. 自动部署

### 方法三：内网穿透（临时公网访问）

#### 使用 ngrok
```bash
ngrok http 8000
```

#### 使用 cpolar（国内推荐）
```bash
cpolar http 8000
```

## 项目结构

```
demo/
├── snake.html          # 游戏主页面
├── snake.css           # 样式文件
├── snake.js            # 游戏逻辑
├── start_server.bat    # 启动脚本（Windows）
├── 部署指南.md         # 详细部署说明
├── README.md           # 项目说明
└── .gitignore          # Git忽略文件
```

## 技术栈

- **HTML5**：页面结构
- **CSS3**：样式和动画
- **JavaScript**：游戏逻辑
- **Canvas API**：游戏渲染
- **LocalStorage**：历史记录存储

## 浏览器兼容性

- Chrome / Edge（推荐）
- Firefox
- Safari
- 移动端浏览器

## 开发说明

### 本地开发
1. 克隆项目到本地
2. 使用HTTP服务器运行（避免CORS问题）
3. 修改代码后刷新浏览器即可

### 自定义配置
- 游戏速度：修改 `snake.js` 中的 `setInterval` 时间间隔
- 画布大小：修改 `snake.html` 中的 `canvas` width/height
- 食物大小：修改 `snake.js` 中的 `gridSize` 变量

## 游戏截图

[在此处添加游戏截图]

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 作者

CodeArts代码智能体

## 致谢

感谢所有为这个项目做出贡献的人！

---

🎮 祝你游戏愉快！QAQ
