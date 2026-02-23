# 便宜电力与核聚变：交互式教学网页

一个极简几何美学风格的全栈交互式教学 Web 应用，探讨「如果电力变得接近免费，世界会怎样」以及「核聚变能否实现这一切」。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Three.js + Framer Motion + Tailwind CSS + D3.js
- **后端**：Node.js + Express + SQLite (better-sqlite3) + Drizzle ORM

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
cd server
npm run db:migrate
npm run db:seed
cd ..

# 启动开发服务器（前后端并发）
npm run dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001
