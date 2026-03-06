<div align="center">
  <h1><img src="https://gocartshop.in/favicon.ico" width="20" height="20" alt="GoCart Favicon">
   GoCart</h1>
  <p>
    An open-source multi-vendor e-commerce platform built with Next.js and Tailwind CSS.
  </p>
  <p>
    <a href="https://github.com/GreatStackDev/goCart/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/GreatStackDev/goCart?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/GreatStackDev/goCart/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"></a>
    <a href="https://github.com/GreatStackDev/goCart/issues"><img src="https://img.shields.io/github/issues/GreatStackDev/goCart?style=for-the-badge" alt="GitHub issues"></a>
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🎨 Color System](#-color-system)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📊 Project Management](#-project-management)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## Features

- **Single-Admin E-Commerce Platform:** A centralized platform managed by a single admin, with product management, reservations, and content control.
- **Customer-Facing Storefront:** A beautiful and responsive user interface for customers to browse products and make reservations.
- **Admin Panel:** A comprehensive dashboard for the admin to manage products, reservations, categories, coupons, and site settings.
- **Firebase Integration:** Authentication, Firestore database, Storage for images, and Remote Config for dynamic theming.

## 🎨 Color System <a name="-color-system"></a>

GoCart features a **centralized color configuration system** that makes it easy to customize and maintain your site's color scheme.

### 🚀 Quick Start

Change your entire site's color scheme in 5 minutes:

1. Open `lib/config/colors.js`
2. Find `primary.500` (around line 16)
3. Change it to your color: `'#your-color-here'`
4. Restart the dev server: `npm run dev`
5. Done! 🎉

### 📚 Documentation

- **[Complete Guide](lib/config/COLOR_GUIDE.md)** - Detailed documentation
- **[Available Themes](lib/config/themes.js)** - 8+ pre-built color themes
- **[Color System Archive](archive/color-system/)** - Full palette, migration guide, system overview

### 🎨 Pre-built Themes

Choose from 8+ ready-to-use themes:
- 🌿 Fresh Green (current)
- 🔥 Vibrant Orange
- 💼 Professional Blue
- 💎 Elegant Purple
- ❤️ Warm Red
- 🌙 Deep Indigo
- 💧 Fresh Cyan
- 🎀 Soft Pink

See [themes.js](lib/config/themes.js) for all options.

## 🛠️ Tech Stack <a name="-tech-stack"></a>

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Styling:** Tailwind CSS 4
- **UI Components:** Lucide React for icons
- **State Management:** Redux Toolkit
- **Backend:** Firebase (Auth, Firestore, Storage, Remote Config)
- **Testing:** Jest 30 + Playwright 1.58
- **Color System:** Centralized configuration with theme support

## 🚀 Getting Started <a name="-getting-started"></a>

First, install the dependencies. We recommend using `npm` for this project.

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Tests

```bash
npm test                    # Jest unit/integration tests (194 tests)
npm run test:e2e            # Playwright E2E tests (52 tests, auto-starts dev server)
npm run test:emulator       # Firebase Security Rules tests (72 tests, needs Java 21+)
```

See [project-management/TESTING.md](./project-management/TESTING.md) for full testing documentation.

You can start editing the page by modifying `app/(public)/page.jsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Outfit](https://vercel.com/font), a new font family for Vercel.

---

## 📊 Project Management <a name="-project-management"></a>

All project management and documentation files are organized in the [`project-management/`](./project-management/) folder:

| Document | Purpose |
|----------|---------|
| **[Testing Documentation](./project-management/TESTING.md)** | Test architecture, test plans, and known issues |
| **[Project Status](./project-management/PROJECT_STATUS.md)** | Feature checklist and progress overview |
| **[Archive](./archive/)** | Historical reports, session logs, color system docs |

👉 **New to the project?** Start with [project-management/README.md](./project-management/README.md) for a complete overview.

---

## 🤝 Contributing <a name="-contributing"></a>

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on how to get started.

---

## 📜 License <a name="-license"></a>

This project is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
