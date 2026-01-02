# Upload Checklist for GitHub

## ✅ Files to Upload

Upload **everything** in the "American Adages Society Website" folder to GitHub:

### Root Level Files:
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tailwind.config.ts`
- ✅ `tsconfig.json`
- ✅ `postcss.config.js`
- ✅ `next-env.d.ts`
- ✅ `vercel.json`
- ✅ `README.md`
- ✅ `DEPLOYMENT.md`
- ✅ `.gitignore`

### Directories:
- ✅ `app/` (entire folder with all subfolders)
- ✅ `components/` (entire folder)
- ✅ `public/` (entire folder - includes the 3 PDFs)

## 📁 Final Structure Should Look Like:

```
American-Adages-Society-AAS-/
├── app/
│   ├── about/
│   ├── agenda/
│   ├── archive/
│   ├── blog/
│   ├── contact/
│   ├── events/
│   ├── get-involved/
│   ├── transparency/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AdageCard.tsx
│   ├── BlogCard.tsx
│   ├── EventCard.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── public/
│   ├── AAS UT Austin green v2.pdf
│   ├── American Adages Society Logo.pdf
│   └── American_Adages_-_Constitution_and_bylaws.pdf
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── next-env.d.ts
├── vercel.json
├── README.md
└── .gitignore
```

## 🚫 Do NOT Upload:
- `node_modules/` (will be created automatically)
- `.next/` (build folder, created automatically)
- Any `.env` files (if you have them)

## ✅ After Upload, Verify:
1. All files appear in GitHub
2. `app/` folder is visible at root level
3. `public/` folder contains the 3 PDFs
4. `package.json` is at root level

Then proceed to Vercel deployment!

