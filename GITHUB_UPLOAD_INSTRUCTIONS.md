# GitHub Upload Instructions for American-Adages-Society Repository

## ⚠️ IMPORTANT: Upload Files to ROOT Level

The issue with the `American-Adages-Society` repository is that files were uploaded into a subdirectory. They need to be at the **root level** of the repository.

## ✅ Correct Structure (What You Need)

When you upload to `American-Adages-Society`, the structure should be:

```
American-Adages-Society/          ← Repository root
├── app/                          ← At root level
├── components/                    ← At root level
├── lib/                          ← At root level
├── public/                       ← At root level
├── package.json                  ← At root level
├── next.config.js                ← At root level
├── tailwind.config.ts            ← At root level
├── tsconfig.json                 ← At root level
├── postcss.config.js             ← At root level
├── next-env.d.ts                 ← At root level
├── vercel.json                   ← At root level
├── README.md                     ← At root level
└── .gitignore                    ← At root level
```

## ❌ Wrong Structure (Current Problem)

Currently it looks like:
```
American-Adages-Society/
└── American Adages Society Website/  ← WRONG! Files are nested here
    ├── app/
    ├── components/
    └── ...
```

## 📝 Steps to Fix

### Option 1: Upload Directly to Root (Recommended)

1. Go to your GitHub repository: `https://github.com/sebastiankiteka/American-Adages-Society`

2. Delete the existing `American Adages Society Website` folder (if it exists)

3. Click "Add file" → "Upload files"

4. **Upload ALL files from your local folder** directly to the root:
   - Select all files and folders from `C:\Users\Seb\Desktop\American Adages Society Website\`
   - Drag them into GitHub
   - **Make sure they go to the root, NOT into a subdirectory**

5. Commit the changes

### Option 2: Use Git Commands

If you have git set up locally:

```bash
# Navigate to your local project folder
cd "C:\Users\Seb\Desktop\American Adages Society Website"

# Initialize git (if not already)
git init

# Add the correct remote (replace with your repo URL)
git remote add origin https://github.com/sebastiankiteka/American-Adages-Society.git

# Add all files
git add .

# Commit
git commit -m "Fix: Move files to root level for Vercel deployment"

# Force push to replace the nested structure
git push -u origin main --force
```

⚠️ **Warning**: `--force` will overwrite the existing repository. Make sure you want to do this!

## ✅ After Uploading

1. Verify in GitHub that:
   - `app/` folder is at root level
   - `package.json` is at root level
   - No nested "American Adages Society Website" folder

2. Go to Vercel and:
   - Settings → General
   - Verify Root Directory is `./` (empty or `./`)
   - Framework Preset is "Next.js"
   - Click "Redeploy"

3. The deployment should now work! 🎉

