# KeyArena — Serious Typing Performance Platform

KeyArena is a production-grade, keyboard-first typing performance platform built for speed, accuracy, consistency, and deliberate practice. It delivers full feature coverage with zero authentication requirements and 100% local persistence via IndexedDB.

---

## ⚡ Deployment Options

### Option 1: Deploy to Vercel (Recommended — Instant & Free)

Vercel natively supports Next.js with zero configuration.

1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `KeyArena` repository.
4. Leave the default settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click **Deploy**. Your app will be live on `https://your-project.vercel.app` in under 2 minutes.

---

### Option 2: Deploy to Railway

1. Install the Railway CLI or use the web dashboard at [railway.app](https://railway.app).
2. Create a new project and select **"Deploy from GitHub repo"**.
3. Railway automatically detects the `Dockerfile` and builds the container.
4. Set the environment variable:
   - `PORT=3000`
5. Deploy and get your public URL.

---

### Option 3: Deploy with Docker & Docker Compose (VPS / Self-Hosted)

Run the Next.js web application with a single command:

```bash
# Clone repository
git clone <your-repo-url>
cd KeyArena

# Start service in background
docker compose up -d --build
```

- Web App: `http://your-server-ip:3000`

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Run Next.js dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🌟 Key Features

- **Zero-Auth Architecture**: No login, sign-up, or tracking. 100% persistent in browser IndexedDB.
- **Independent Typing Engine (`@keyarena/typing-engine`)**: Mathematically rigorous WPM, Raw WPM, Accuracy, and Consistency algorithms.
- **Fast Keystroke Loop**: Zero-lag typing with instant <kbd>Enter</kbd> or <kbd>Tab</kbd> restart for fresh randomized words.
- **Deliberate Practice Suite**: Missed words, slow words, biwords/n-grams, and character error analytics.
- **Custom Theme Studio**: 8 built-in technical themes (Graphite, Terminal, Amber, Slate, etc.) and a custom color picker.
- **Procedural Web Audio**: Zero-lag mechanical switch sounds synthesized with the Web Audio API.
- **Daily Challenges & Personal Bests**: Deterministic daily challenges seeded by date with shareable links and streak tracking.
- **Data Portability**: Full JSON export and import in Settings.
