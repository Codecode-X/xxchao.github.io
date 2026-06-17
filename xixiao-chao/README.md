# 息小吵

> 先让情绪停一停，再把彼此的话听清楚。

情侣矛盾的结构化表达和 AI 中立调解工具。

## 架构说明

本网站是一个**纯前端应用**，部署在 GitHub Pages 上。

- **没有后端服务器**
- **没有数据库**
- **没有云端存储服务**
- 所有数据只保存在当前浏览器的 `localStorage` 或 `sessionStorage`
- 两台设备之间通过人工复制"提交码""结果码"传递信息
- AI 调解需要用户自行配置 AI API

## 技术栈

- Vite + React + TypeScript
- Tailwind CSS
- React Router (HashRouter - 兼容 GitHub Pages)
- Web Crypto API (AES-GCM 加密)
- Web Speech API (语音转文字)
- localStorage / sessionStorage

## 本地开发

```bash
npm install
npm run dev
```

## 构建与部署

### 构建生产版本

```bash
npm install
npm run build
```

构建结果在 `dist/` 目录中，可直接部署。

### 部署到 GitHub Pages

#### 方式一：使用 gh-pages 包

```bash
# 安装 gh-pages
npm install -D gh-pages

# 在 package.json 中添加部署脚本
# "deploy": "gh-pages -d dist"

# 构建
npm run build

# 部署
npm run deploy
```

#### 方式二：使用 GitHub Actions

1. 在仓库中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

2. 在 GitHub 仓库 Settings > Pages 中：
   - Source 选择 "GitHub Actions"

#### 重要配置

Vite 已配置 `base: './'` 以适配 GitHub Pages 的子路径部署。如果你的仓库名不是默认路径，请修改 `vite.config.ts` 中的 `base` 配置：

```typescript
// 例如部署到 https://用户名.github.io/xixiao-chao/
export default defineConfig({
  base: '/xixiao-chao/',
  ...
})
```

## 业务流程

```
A 方创建房间 → 生成房间代码和房间密钥
→ A 方将代码和密钥发送给 B 方
→ B 方加入房间
→ 双方分别完成四轮结构化问题
→ 双方分别确认最终提交
→ B 方生成提交码发给 A 方
→ A 方导入 B 方提交码
→ A 方调用 AI 调解
→ A 方生成结果码发给 B 方
→ B 方导入结果码查看内容
→ 可选：反馈迭代（最多3轮）
→ 可选：达成共识 → 生成和解备忘
```

## 隐私说明

- 息小吵不会将回答保存到自有服务器，因为本网站没有服务器
- 回答默认仅保存在当前设备中
- 只有当你主动复制并发送提交码时，加密后的信息才会被另一台设备导入
- 开始 AI 调解后，双方提交内容会由当前浏览器发送至用户配置的 AI 服务
- AI API Key 不写入源代码和仓库，由用户运行时填写

## 代码格式

提交码格式：`XXC1.加密内容`
结果码格式：`XXR1.加密内容`
反馈码格式：`XXF1.加密内容`
追问请求码：`XXQ1.加密内容`
追问提交码：`XXS1.加密内容`
共识确认码：`XXA1.加密内容`

所有加密使用 AES-GCM + PBKDF2 密钥派生，基于 Web Crypto API。

## 禁止事项

本网站不包含以下功能：

- 后端服务器 / 数据库 / 云端存储
- 自动跨设备同步 / 实时状态 / 实时聊天
- 用户注册 / 用户登录
- 责任比例 / 输赢判断 / 关系评分
- 会员 / 付费 / 广告 / 排行榜
- 将真实 API Key 写入源代码