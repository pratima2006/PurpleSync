# PurpleSync

PurpleSync is a premium, responsive BTS ARMY information hub for voting
windows, schedules, achievements, updates, member references, and official
links.

This version uses local sample data only. It does not include login, a
database, external APIs, real voting verification, or credential collection.

## Folder structure

```text
purplesync/
├── app/
│   ├── Achievements.tsx
│   ├── Home.tsx
│   ├── Links.tsx
│   ├── Members.tsx
│   ├── Schedule.tsx
│   ├── Updates.tsx
│   └── Voting.tsx
├── components/
│   ├── BrandMark.tsx
│   ├── data.ts
│   ├── ErrorBoundary.tsx
│   ├── MetricCard.tsx
│   ├── MobileNav.tsx
│   ├── SearchPanel.tsx
│   ├── SectionHeading.tsx
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   └── types.ts
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Create a production build

```bash
npm run build
npm run preview
```

The production files are written to `dist/`.

## Deploy to Vercel

### Option 1: Vercel dashboard

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Import the repository into Vercel.
4. Keep the framework set to **Vite**.
5. The included `vercel.json` runs `npm install`, then `npm run build`.
6. Deploy.

No environment variables are required for the sample-data version.

### Option 2: Vercel CLI

```bash
npm install
npm run build
npx vercel
npx vercel --prod
```

## GitHub upload

The folder is already a standalone npm project. Upload it without the
workspace-level `pnpm-workspace.yaml`, `pnpm-lock.yaml`, or `node_modules`
directories. GitHub and Vercel only need the files inside this folder.

## Mobile sidebar behavior

On narrow screens, use the menu button in the top bar to open the sidebar.
The sidebar closes when:

- a navigation link is selected;
- the shaded area outside the sidebar is clicked;
- the close button is clicked; or
- the Escape key is pressed.