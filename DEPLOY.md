# Deploy CEO Simulator to the Web

## Option 1: Vercel (Recommended - Easiest)

The project is already configured with `vercel.json`. Just complete authentication:

1. **Login to Vercel** (one-time setup):
   ```bash
   vercel login
   ```
   - This will open a browser window for authentication
   - Follow the prompts to authenticate

2. **Deploy**:
   ```bash
   vercel --prod
   ```
   - When prompted:
     - **Set up and deploy?** → Yes
     - **Which scope?** → Choose your account
     - **Link to existing project?** → No (first time)
     - **Project name?** → `ceo-simulator` (or press Enter)
     - **Directory?** → `./` (press Enter)
     - **Override settings?** → No (press Enter)

3. **Get your URL**: Vercel will provide a live URL like `https://ceo-simulator-xxxx.vercel.app`

4. **Future updates**: Just run `vercel --prod` after making changes

---

## Option 2: Netlify (Alternative)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

---

## Option 3: GitHub Pages

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add to package.json**:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

Your game will be at: `https://<your-username>.github.io/ceo_game/`

---

## Quick Deploy (Already Built)

The project is already built in the `dist/` folder. You can:

- **Upload `dist/` folder** to any static hosting service
- **Use Vercel/Netlify CLI** (requires one-time login)
- **Use their web dashboards** to drag-and-drop the `dist/` folder
