# Sweet Vue Admin - 企业级后台管理系统

> 基于 Vue 3 + Element Plus + TypeScript 的现代化后台管理系统

[![GitHub stars](https://img.shields.io/github/stars/1650987523/sweet-vue-admin)](https://github.com/1650987523/sweet-vue-admin/stargazers) [![GitHub forks](https://img.shields.io/github/forks/1650987523/sweet-vue-admin)](https://github.com/1650987523/sweet-vue-admin/network) [![GitHub license](https://img.shields.io/github/license/1650987523/sweet-vue-admin)](https://github.com/1650987523/sweet-vue-admin/blob/main/LICENSE) [![Node](https://img.shields.io/badge/node-%3E%3D20.19.0-green)](https://nodejs.org/) [![Vue](https://img.shields.io/badge/vue-3.5.22-green)](https://vuejs.org/) [![Element Plus](https://img.shields.io/badge/element--plus-2.11.2-green)](https://element-plus.org/) [![TypeScript](https://img.shields.io/badge/typescript-5.6.3-green)](https://www.typescriptlang.org/)

---

## 📖 项目简介

**Sweet Vue Admin** 是一个基于 Vue 3 + Element Plus + TypeScript 的企业级后台管理系统模板，采用了最新的前端技术栈，无需依靠 HBuilderX，通过命令行方式运行。

项目内置了完整的权限管理系统、商品管理、订单管理、退款管理等核心业务模块，提供了代码提示、自动格式化、统一配置、代码片段等辅助功能，让你开发后台系统拥有 **best** 体验。

## ✨ 技术栈

- **框架**: Vue 3.5.22
- **构建工具**: Vite 7.1.5
- **UI 组件库**: Element Plus 2.11.2
- **语言**: TypeScript 5.6.3
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.5.1
- **HTTP 客户端**: Axios 1.12.2
- **CSS 框架**: TailwindCSS 4.1.14
- **代码规范**: ESLint + Prettier + Stylelint
- **图标**: Iconify + UnoCSS

## 🎯 核心功能

### 系统管理

- ✅ 用户管理 - 支持用户增删改查、角色分配
- ✅ 角色管理 - 支持角色权限配置
- ✅ 菜单管理 - 动态路由、菜单配置
- ✅ 部门管理 - 组织架构管理
- ✅ 字典管理 - 数据字典配置
- ✅ 权限管理 - 按钮级权限控制

### 产品管理

- ✅ 商品管理 - 商品 CRUD、规格属性管理
- ✅ 商品分类 - 多级分类管理
- ✅ 商品属性 - 规格模板管理
- ✅ 轮播图 - 多门店轮播图配置
- ✅ 门店管理 - 多门店隔离支持
- ✅ 二维码 - 桌码二维码生成

### 订单管理

- ✅ 订单列表 - 多条件搜索、状态筛选
- ✅ 订单详情 - 完整订单信息展示
- ✅ 完成订单 - 制作中订单可完成
- ✅ 申请退款 - 支持部分退款
- ✅ 退款管理 - 退款申请审核
- ✅ 退款审核 - 支持修改退款金额

### 基础功能

- ✅ 登录/注册 - 支持账号密码登录
- ✅ 忘记密码 - 密码找回功能
- ✅ 个人中心 - 个人信息修改
- ✅ 工作台 - 数据可视化展示
- ✅ 异常页面 - 403/404/500

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19.0
- pnpm >= 8.8.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/1650987523/sweet-vue-admin.git

# 进入项目目录
cd sweet-vue-admin

# 安装依赖
pnpm install
```

### 启动项目

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm serve
```

### 代码检查

```bash
# ESLint 检查
pnpm lint

# 自动修复格式问题
pnpm lint:fix

# Prettier 格式化
pnpm lint:prettier

# Stylelint 检查
pnpm lint:stylelint
```

## 📁 项目结构

```
sweet-vue-admin/
├── public/                 # 静态资源
├── scripts/               # 构建脚本
├── src/
│   ├── api/               # API 接口定义
│   │   ├── order/        # 订单相关 API
│   │   ├── product/      # 产品相关 API
│   │   └── system/       # 系统相关 API
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   │   └── core/         # 核心组件
│   ├── composables/       # 组合式函数
│   ├── directives/        # 自定义指令
│   ├── enums/             # 枚举定义
│   ├── hooks/             # 自定义 Hooks
│   ├── layouts/           # 布局组件
│   ├── locales/           # 国际化配置
│   ├── router/            # 路由配置
│   ├── store/             # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── .env.production        # 生产环境变量
├── .eslintrc.cjs          # ESLint 配置
├── package.json           # 项目依赖配置
├── tsconfig.json          # TypeScript 配置
└── vite.config.ts         # Vite 配置
```

## 🔧 环境配置

### 开发环境 (.env.development)

```env
VITE_BASE_URL = /
VITE_API_URL = http://localhost:8080
```

### 生产环境 (.env.production)

```env
VITE_BASE_URL = /
VITE_API_URL = http://101.201.57:8082
VITE_DROP_CONSOLE = true
```

## 📦 部署

### Docker 部署

```bash
# 构建镜像
docker build -t sweet-vue-admin .

# 运行容器
docker run -d -p 80:80 sweet-vue-admin
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://101.201.57:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 开发规范

### 代码风格

- 使用 TypeScript 编写类型安全的代码
- 使用 ESLint + Prettier 统一代码格式
- 使用 Stylelint 规范样式代码
- 使用 Git Hooks 提交前自动检查

### 提交规范

项目使用 commitizen 规范提交信息：

```bash
pnpm commit
```

提交类型：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建/工具链相关

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 开源协议

MIT License

## 🙏 致谢

感谢以下优秀开源项目：

- [Vue 3](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)

---

## 📮 联系方式

- GitHub: [1650987523](https://github.com/1650987523)
- 项目地址：https://github.com/1650987523/sweet-vue-admin
