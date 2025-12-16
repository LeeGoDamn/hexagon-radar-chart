# 六边形雷达图 | Hexagon Radar Chart

一个用于可视化多维能力评估的交互式六边形雷达图工具。支持创建、管理和比较多个能力档案，适用于个人能力评估、团队分析等场景。

## ✨ 功能特性

- 🎯 **六维能力可视化** - 基于六个维度的雷达图展示，直观呈现能力分布
- 📊 **多档案管理** - 创建、编辑、复制和删除多个评估档案
- 🎨 **交互式编辑** - 实时调整各维度数值，图表立即响应
- 💾 **本地存储** - 数据自动保存在浏览器本地，无需后端服务
- 📤 **数据导入导出** - 支持 CSV 格式的批量导入导出
- 🎭 **自定义维度名称** - 可根据需求自定义各维度的名称
- 📱 **响应式设计** - 适配桌面和移动设备

## 🎯 默认维度

1. 业务分析能力
2. 工程能力
3. 模型能力
4. 学习能力
5. 主动性
6. 沟通能力

## 🚀 快速开始

### 在线使用

访问 [GitHub Pages](https://leegodamn.github.io/hexagon-radar-chart/) 直接使用

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/LeeGoDamn/hexagon-radar-chart.git
cd hexagon-radar-chart

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📖 使用说明

1. **创建档案** - 点击"新建档案"按钮，输入名称创建新的能力评估档案
2. **编辑能力值** - 使用滑块调整各维度的能力值（1-5分）
3. **查看图表** - 雷达图会实时更新显示当前档案的能力分布
4. **管理档案** - 可以选择、复制或删除已有的档案
5. **导入导出** - 通过 CSV 格式批量管理档案数据

## 🛠️ 技术栈

- **框架** - React 19 + TypeScript
- **构建工具** - Vite
- **图表库** - D3.js
- **UI 组件** - Radix UI
- **样式** - Tailwind CSS
- **状态管理** - React Hooks + localStorage

## 📁 项目结构

```
hexagon-radar-chart/
├── src/
│   ├── components/        # React 组件
│   │   ├── RadarChart.tsx    # 雷达图组件
│   │   ├── DimensionEditor.tsx # 维度编辑器
│   │   ├── ProfileList.tsx    # 档案列表
│   │   └── ui/               # UI 基础组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/             # 工具函数和类型定义
│   └── styles/          # 样式文件
├── docs/                # GitHub Pages 发布目录
└── public/              # 静态资源
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
