# 🧠 Reddit Research Tool

AI-powered Reddit research with secure API key handling.

## 🚀 Deploy to Vercel

### Step 1: Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Drag & drop this folder (or connect via GitHub)
4. Click **Deploy**

### Step 2: Add Your API Key (Secure)
1. In Vercel, go to your project
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-...` (your key)
4. Click **Save**
5. Go to **Deployments** → click **...** → **Redeploy**

That's it! Your API key is now secure on the server.

## 📁 Project Structure
```
REDDIT-RESEARCH-FINAL/
├── index.html          ← Frontend
├── api/
│   └── generate-tags.js ← Serverless function (keeps API key secure)
├── vercel.json         ← Vercel config
└── README.md
```

## 🔒 How Security Works

- Your API key is stored in Vercel's environment variables
- The frontend calls `/api/generate-tags` 
- The serverless function adds the API key server-side
- The key is NEVER exposed to the browser

## 🔑 Get Your API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** → **Create Key**
3. Copy and paste into Vercel environment variables
