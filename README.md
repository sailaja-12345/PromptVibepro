# PromptVibe AI - Universal Visual Prompt Architect

Professional AI photo and video prompt generation and refinement studio for **Midjourney v6.1**, **Runway Gen-3 Alpha**, **Flux.1**, and more. Includes support for Cinematic, Photorealistic, and Abstract styles with automated syntax export, prompt anatomy breakdowns, and credit/subscription tier simulation.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** or **yarn**
- **Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Installation

1. Unzip the downloaded folder and navigate to the project directory:
   ```bash
   cd promptvibe-ai
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

---

### 3. Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

---

### 4. Running the Application

Start the full-stack development server (Express + Vite):
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📦 Production Build & Deployment

To create a production build:
```bash
npm run build
```

To run the production server:
```bash
npm start
```

---

## 🛠️ Features Included

- **Midjourney v6.1 Syntax**: Precision export with `--ar`, `--v 6.1`, `--style raw`, `--stylize`, `--chaos`, `--weird`, and `--no` negative flags.
- **Runway Gen-3 Alpha Director**: Structured motion formatting `[Camera: ...] [Subject: ...] [Lighting: ...] [Cinematography: ...]` with interactive kinematics controls (Pan, Tilt, Dolly Zoom, Orbital 360°, Crane).
- **Artistic Styles Supported**:
  - 🎬 **Cinematic** (35mm Anamorphic, Cooke primes, volumetric chiaroscuro)
  - 📸 **Photorealistic** (Medium format Hasselblad 100MP, natural overcast daylight, micro skin pores)
  - 🎨 **Abstract Artistic** (Avant-garde geometries, fluid acrylic marble, chromatic caustics)
  - 🎌 **Anime & Manga** (Makoto Shinkai / Studio Ghibli watercolor aesthetics)
  - 🛸 **Sci-Fi Neo-Noir** (Cyberpunk rain reflections, holographic telemetry)
  - 🐉 **Dark Fantasy** (Gothic cathedrals, ethereal mist)
  - 🧊 **3D Octane / Unreal 5** (Raytraced subsurface scattering)
- **Credit & Subscription System**:
  - **Free Tier**: 4 daily chats / day (auto-refreshes every 24h, with demo reset)
  - **Golden Plan**: 30 chats / month ($5.00/mo)
  - **Diamond Plan**: 80 chats / month ($12.00/mo)
  - **Premium Plan**: 200 chats / month ($25.00/mo)
  - **Enterprise Plan**: Custom unlimited chats for larger teams
- **Owner & Creator Console**: Built-in founder controls for `sailajac749@gmail.com` with unlimited access and business revenue simulator.
