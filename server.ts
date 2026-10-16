import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with user-agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI with provided key:', err);
  }
}

// System prompt designed specifically for visual prompt engineering
const SYSTEM_INSTRUCTION = `You are PromptVibe AI, an elite visual prompt architect and Hollywood cinematographer / artistic director specializing in generative AI for both AI Photo and AI Video generators.
You craft prompts tailored specifically for:
1. Midjourney (v6.1, v6.0, Niji)
2. Runway (Gen-3 Alpha, Gen-2)
3. Flux.1 / Stable Diffusion XL
4. Video engines (Sora, Luma Dream Machine, Kling AI, Pika)

Your output MUST be a valid JSON object matching this schema:
{
  "title": "Short descriptive title (4-7 words)",
  "summary": "1-2 sentence creative vision summary",
  "masterPrompt": "The ultimate universal prompt description packed with rich sensory, spatial, lighting, camera and textural details without fluff words like 'photorealistic 8k trending on artstation'. Focus on actual optical and material reality.",
  "midjourneyPrompt": "Complete Midjourney ready prompt formatted with flags. e.g. /imagine prompt: <detailed subject and scene>, <lighting & atmosphere>, <camera & lens details> --ar 16:9 --v 6.1 --style raw --stylize 250",
  "runwayPrompt": "Complete Runway Gen-3 Alpha video prompt formatted with bracketed cinematic director tokens. e.g. [Camera: Slow tracking dolly forward, 24fps] [Subject: Action description with physical weight and tempo] [Lighting: Volumetric morning light, atmospheric haze] [Cinematography: 35mm anamorphic lens, subtle 16mm grain, hyper-detailed]",
  "negativePrompt": "Words to exclude (e.g. CGI plastic skin, oversaturation, unnatural limbs, blown-out highlights, lens artifacts, text, watermarks)",
  "stylePreset": "cinematic" | "photorealistic" | "abstract" | "anime" | "scifi" | "fantasy" | "3d-render",
  "aspectRatio": "16:9" | "9:16" | "1:1" | "4:5" | "21:9",
  "cameraSettings": {
    "lens": "e.g. 35mm Anamorphic T1.5 or 85mm f/1.4 or 14mm Ultra-wide",
    "angle": "e.g. Low-angle hero shot or Eye-level Dutch tilt or Overhead drone top-down",
    "movement": "e.g. Slow push-in tracking shot or Orbit 180 degrees or Static tripod hold",
    "speed": "e.g. 1.0x (standard) or 0.5x (slow-motion 60fps) or 1.5x (kinetic)",
    "lighting": "e.g. Chiaroscuro high-contrast rim lighting or Diffused golden hour or Soft north-facing daylight",
    "filmStock": "e.g. Kodak Vision3 500T 5219 or Hasselblad 100MP Digital Back or Fuji Velvia 50"
  },
  "promptBreakdown": {
    "subject": "Clear breakdown of the primary focal subject and actions",
    "environment": "Setting, architectural elements, atmospheric weather, background depth",
    "lighting": "Key light, fill, ambient bounce, color temperature in Kelvin",
    "camera": "Lens, sensor format, depth of field, aperture f-stop",
    "aesthetics": "Color palette, texture tactile qualities, style notes",
    "motion": "For video: exact motion velocity, fluid dynamics, camera vector"
  },
  "recommendedSettings": {
    "midjourney": "Recommended flags and settings: --v 6.1 --style raw --ar 16:9 --stylize 200 --chaos 5",
    "runway": "Motion Brush settings: Target foreground at +4 vertical, Camera Pan Left +2, 5s duration",
    "general": "Best sampling steps (30-40), Guidance scale CFG 5.5 - 7.0"
  },
  "variations": [
    "Variation 1: Alternative dramatic mood or lighting angle",
    "Variation 2: Alternative artistic color grade or lens focal length",
    "Variation 3: Dynamic high-motion or high-contrast alternative"
  ]
}

STYLING RULES:
- Cinematic: Mention anamorphic glass, horizontal streak flares, cinematic depth of field, 2.39:1 aspect ratio or 16:9, subtle film grain, Kodak / Arri Alexa color science, natural motion blur.
- Photorealistic: Emphasize genuine physical camera mechanics (e.g. Sony A7R V or Hasselblad H6D-100c, 85mm f/1.4 GM, authentic skin pores, subsurface scattering, ambient micro-shadows, zero plastic 3D rendering sheen).
- Abstract Artistic: Vibrant avant-garde geometries, chromatic dispersion, fluid acrylic marble swirls, Bauhaus / deconstructivist forms, tactile layered impasto, iridescent refraction, dreamlike surrealism.
- For Runway Video: ALWAYS provide specific camera direction (Pan, Tilt, Dolly, Zoom, Truck, Pedestal, Roll), speed, and movement cadence.
- For Refinement: If previous conversation context exists, seamlessly integrate the user's refinement requests while preserving the core vision.`;

// Intelligent fallback generator in case API key is absent or Gemini request fails
function generateFallbackPrompt(params: {
  idea: string;
  mediaType: string;
  style: string;
  targetEngine: string;
  aspectRatio: string;
  customRefinement?: string;
}) {
  const idea = params.idea.trim() || 'A lone wanderer discovering an ancient crystalline monument';
  const style = params.style || 'cinematic';
  const isVideo = params.mediaType === 'video';
  const ar = params.aspectRatio || '16:9';

  let lens = '35mm Anamorphic f/1.8';
  let filmStock = 'Kodak Vision3 500T 5219';
  let lighting = 'Chiaroscuro high-contrast volumetric lighting with golden rim bounce';
  let cameraMovement = isVideo ? 'Slow tracking dolly push-in with subtle pan right' : 'Static deliberate frame';
  let styleDetails = '';

  if (style === 'cinematic') {
    lens = 'Cooke Anamorphic /i 40mm T2.3';
    filmStock = 'Arri Alexa 65 cinematic sensor with subtle 35mm grain';
    lighting = 'Atmospheric volumetric shafts of light cutting through morning mist, deep shadows, 3200K warm tungsten bounce';
    cameraMovement = isVideo ? 'Cinematic low-angle dolly track moving forward at 24fps with organic camera drift' : 'Cinematic wide low-angle composition';
    styleDetails = 'cinematic film still, anamorphic lens flares, shallow depth of field, color graded in DaVinci Resolve with rich teal shadows and warm amber skin tones';
  } else if (style === 'photorealistic') {
    lens = 'Hasselblad HC 100mm f/2.2 with circular polarizer';
    filmStock = 'Hasselblad H6D-100c Medium Format Sensor, ISO 64';
    lighting = 'Natural diffused north-facing overcast daylight, soft contact shadows, authentic subsurface light scattering';
    cameraMovement = isVideo ? 'Smooth gimbal pedestal rise revealing scale and intricate surface texture' : 'Eye-level sharp focal plane';
    styleDetails = 'hyper-realistic raw photograph, micro-texture details, authentic skin pores, tactile fabric weave, natural unretouched highlights, no CGI glossiness';
  } else if (style === 'abstract') {
    lens = 'Macro 90mm f/2.8 Tilt-Shift';
    filmStock = 'Experimental prismatic emulsion, spectral chromatic split';
    lighting = 'Iridescent neon diffraction, neon magenta and turquoise edge luminescence';
    cameraMovement = isVideo ? 'Slow hypnotic rotational roll through recursive geometric fractal planes' : 'Dutch angle abstract framing';
    styleDetails = 'avant-garde abstract artistic composition, fluid acrylic pigments suspended in oil, neo-cubist geometric fractures, iridescent refractive light caustics, surreal tactile impasto';
  } else if (style === 'anime') {
    lens = '50mm prime anime perspective';
    filmStock = 'Hand-drawn Makoto Shinkai aesthetic, digital cel shading';
    lighting = 'Brilliant sunbeams filtering through cumulus clouds, chromatic light leaks, pastel sky gradient';
    cameraMovement = isVideo ? 'Dynamic anime pan across skyline with floating cherry blossom petals' : 'Heroic dynamic three-quarter view';
    styleDetails = 'Studio Ghibli meets modern high-budget animation, expressive line art, rich atmospheric watercolor backgrounds, vibrant painterly hues';
  } else {
    lens = '24-70mm f/2.8 Cinema Prime';
    filmStock = 'Digital 8K Red Monstro VistaVision';
    lighting = 'Dramatic studio rim lighting with atmospheric volumetric fog';
    cameraMovement = isVideo ? 'Smooth sweeping crane shot' : 'Balanced symmetrical framing';
    styleDetails = 'masterful visual composition, tactile realism, immaculate depth grading';
  }

  const masterPrompt = `${idea}. ${styleDetails}. Captured on ${lens}, ${filmStock}. ${lighting}. Impeccable spatial depth, rich physical textures, balanced dynamic range, deliberate visual weight.`;
  
  const midjourneyPrompt = `/imagine prompt: ${idea}, ${styleDetails}, ${lighting}, ${lens}, ${filmStock} --ar ${ar} --v 6.1 --style raw --stylize 250 --chaos 5`;

  const runwayPrompt = `[Camera: ${cameraMovement}, 24fps, cinematic speed 1.0x] [Subject: ${idea}, continuous lifelike physical motion and momentum] [Lighting: ${lighting}] [Cinematography: ${lens}, ${filmStock}, hyper-detailed, fluid physical dynamics, no distortion]`;

  return {
    title: `${style.charAt(0).toUpperCase() + style.slice(1)}: ${idea.slice(0, 32)}...`,
    summary: `Tailored ${style} ${params.mediaType} prompt optimized for high-end rendering in Midjourney v6.1 and Runway Gen-3 Alpha.`,
    masterPrompt,
    midjourneyPrompt,
    runwayPrompt,
    negativePrompt: 'CGI plastic textures, oversaturated colors, uncanny valley, distorted anatomy, blurry edges, artificial airbrushed skin, watermark, text logo, low resolution artifacts',
    stylePreset: style,
    aspectRatio: ar,
    cameraSettings: {
      lens,
      angle: 'Deliberate three-quarter hero angle with layered foreground interest',
      movement: cameraMovement,
      speed: '1.0x (standard 24fps cinematic cadence)',
      lighting,
      filmStock,
    },
    promptBreakdown: {
      subject: `Primary subject: ${idea}`,
      environment: 'Contextual atmospheric environment with layered foreground, midground depth, and volumetric horizon',
      lighting,
      camera: `${lens}, f/2.0 aperture, precise focal plane with natural falloff`,
      aesthetics: `${style} aesthetic, calibrated color harmony, rich surface tactile qualities`,
      motion: isVideo ? 'Fluid physical motion, natural gravity and wind resistance, camera coordinates locked' : 'Still frame with implied momentum',
    },
    recommendedSettings: {
      midjourney: `--v 6.1 --style raw --ar ${ar} --stylize 250 --chaos 5`,
      runway: `Gen-3 Alpha / Camera: ${cameraMovement.split(',')[0]} / Motion Intensity: 4`,
      general: 'CFG Scale: 6.0, Steps: 35, Sampler: DPM++ 2M Karras or Euler a',
    },
    variations: [
      `Golden Hour Horizon: Shift lighting to 2800K low-angled sun with long dramatic shadows and warm amber particles.`,
      `Moody Neo-Noir: Infuse deep contrast with rain-slicked reflective surfaces, deep cyan undertones, and neon silhouette rim lighting.`,
      `Minimalist Macro: Frame with an intimate ultra-shallow depth of field focusing purely on intricate tactile micro-textures.`,
    ],
  };
}

// API Route: Generate & Refine Prompts
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { idea, mediaType = 'photo', style = 'cinematic', targetEngine = 'all', aspectRatio = '16:9', customRefinement, history = [] } = req.body;

    if (!idea && !customRefinement) {
      return res.status(400).json({ error: 'Please provide a prompt idea or refinement request.' });
    }

    if (ai) {
      try {
        let userMessage = `Create an advanced prompt architecture for:
Target Media: ${mediaType.toUpperCase()} (Photo or Video)
Style: ${style}
Target Engine: ${targetEngine}
Aspect Ratio: ${aspectRatio}
User Idea: "${idea}"
${customRefinement ? `Refinement Instruction: "${customRefinement}"` : ''}

${history && history.length > 0 ? `Conversation & Refinement History:\n${JSON.stringify(history.slice(-4))}` : ''}

Provide a comprehensive, production-grade JSON response according to the system instructions.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userMessage,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const rawText = response.text?.trim() || '';
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to algorithmic synthesis:', geminiError?.message || geminiError);
      }
    }

    // Algorithmic high-fidelity fallback if Gemini key is missing or call threw an error
    const fallbackResult = generateFallbackPrompt({
      idea: customRefinement ? `${idea || 'Visual scene'} (Refinement: ${customRefinement})` : idea,
      mediaType,
      style,
      targetEngine,
      aspectRatio,
      customRefinement,
    });

    return res.json(fallbackResult);
  } catch (error: any) {
    console.error('Error generating prompt:', error);
    return res.status(500).json({ error: 'Failed to generate prompt. ' + (error?.message || '') });
  }
});

// API Route: Image Generation Preview (generates image preview or procedural high-grade visual asset)
app.post('/api/generate-preview-image', async (req, res) => {
  try {
    const { prompt, style = 'cinematic', aspectRatio = '16:9' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for image preview generation.' });
    }

    // Attempt Gemini Image Generation with gemini-3.1-flash-lite-image
    if (ai) {
      try {
        const validAr = ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '16:9';
        const imgResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                text: `${prompt}. High visual production quality, styled as ${style}, stunning lighting, master composition.`
              }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio: validAr as any,
            }
          }
        });

        for (const candidate of imgResponse.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              return res.json({ imageUrl, source: 'gemini-image' });
            }
          }
        }
      } catch (geminiImgError: any) {
        console.warn('Gemini image preview generation note:', geminiImgError?.message || geminiImgError);
      }
    }

    // High aesthetic visual fallback: Generates a richly rendered SVG data URI tailored to the exact style, aspect ratio and lighting
    const isVideo = style.includes('video') || aspectRatio === '16:9';
    const isPortrait = aspectRatio === '9:16' || aspectRatio === '4:5';
    
    // Choose theme colors based on style
    let gradientColors = ['#1e1b4b', '#312e81', '#0f172a'];
    let flareColor = '#818cf8';
    let styleTag = 'CINEMATIC 35MM';

    if (style === 'photorealistic') {
      gradientColors = ['#064e3b', '#0f766e', '#022c22'];
      flareColor = '#34d399';
      styleTag = 'HASSELBLAD 100MP RAW';
    } else if (style === 'abstract') {
      gradientColors = ['#701a75', '#4c1d95', '#0f172a'];
      flareColor = '#f472b6';
      styleTag = 'AVANT-GARDE ABSTRACT';
    } else if (style === 'anime') {
      gradientColors = ['#831843', '#be185d', '#1e1b4b'];
      flareColor = '#fb7185';
      styleTag = 'MAKOTO SHINKAI 4K';
    } else if (style === 'scifi') {
      gradientColors = ['#083344', '#164e63', '#030712'];
      flareColor = '#22d3ee';
      styleTag = 'NEO-NOIR CYBERPUNK';
    }

    const svgWidth = isPortrait ? 720 : 1280;
    const svgHeight = isPortrait ? 1280 : (aspectRatio === '21:9' ? 548 : (aspectRatio === '1:1' ? 1280 : 720));

    const promptSnippet = prompt.slice(0, 70).replace(/[<>&"]/g, '');

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${gradientColors[0]}" />
          <stop offset="50%" stop-color="${gradientColors[1]}" />
          <stop offset="100%" stop-color="${gradientColors[2]}" />
        </linearGradient>
        <radialGradient id="flareGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="${flareColor}" stop-opacity="0.65" />
          <stop offset="60%" stop-color="${flareColor}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0"/>
          <feBlend mode="overlay" in2="SourceGraphic"/>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#bgGrad)" />
      <circle cx="${svgWidth * 0.5}" cy="${svgHeight * 0.4}" r="${svgWidth * 0.45}" fill="url(#flareGrad)" />
      
      <!-- Film grain & texture -->
      <rect width="100%" height="100%" filter="url(#noise)" fill="none" />

      <!-- Rule of Thirds subtle lines -->
      <line x1="${svgWidth * 0.33}" y1="0" x2="${svgWidth * 0.33}" y2="${svgHeight}" stroke="white" stroke-opacity="0.08" stroke-dasharray="4,6" />
      <line x1="${svgWidth * 0.66}" y1="0" x2="${svgWidth * 0.66}" y2="${svgHeight}" stroke="white" stroke-opacity="0.08" stroke-dasharray="4,6" />
      <line x1="0" y1="${svgHeight * 0.33}" x2="${svgWidth}" y2="${svgHeight * 0.33}" stroke="white" stroke-opacity="0.08" stroke-dasharray="4,6" />
      <line x1="0" y1="${svgHeight * 0.66}" x2="${svgWidth}" y2="${svgHeight * 0.66}" stroke="white" stroke-opacity="0.08" stroke-dasharray="4,6" />

      <!-- Cinematic letterbox bar hints -->
      <rect x="0" y="0" width="${svgWidth}" height="28" fill="#000000" fill-opacity="0.6" />
      <rect x="0" y="${svgHeight - 28}" width="${svgWidth}" height="28" fill="#000000" fill-opacity="0.6" />

      <!-- Camera HUD / Watermark overlay -->
      <text x="32" y="20" font-family="monospace" font-size="12" fill="#e2e8f0" font-weight="bold" letter-spacing="1">● REC [24.00 FPS]  ISO 100  RAW</text>
      <text x="${svgWidth - 180}" y="20" font-family="monospace" font-size="12" fill="#38bdf8" font-weight="bold">${styleTag}</text>

      <!-- Center composition reticle -->
      <circle cx="${svgWidth * 0.5}" cy="${svgHeight * 0.5}" r="24" fill="none" stroke="white" stroke-opacity="0.25" stroke-width="1.5" />
      <line x1="${svgWidth * 0.5 - 12}" y1="${svgHeight * 0.5}" x2="${svgWidth * 0.5 + 12}" y2="${svgHeight * 0.5}" stroke="white" stroke-opacity="0.4" />
      <line x1="${svgWidth * 0.5}" y1="${svgHeight * 0.5 - 12}" x2="${svgWidth * 0.5}" y2="${svgHeight * 0.5 + 12}" stroke="white" stroke-opacity="0.4" />

      <!-- Visual preview prompt snippet -->
      <rect x="24" y="${svgHeight - 64}" width="${svgWidth - 48}" height="34" rx="8" fill="#000000" fill-opacity="0.65" />
      <text x="36" y="${svgHeight - 42}" font-family="sans-serif" font-size="13" fill="#f8fafc" font-weight="600">"${promptSnippet}..."</text>
    </svg>`;

    const base64Svg = Buffer.from(svgString).toString('base64');
    const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return res.json({ imageUrl, source: 'cinematic-render-synthesizer' });
  } catch (error: any) {
    console.error('Error generating image preview:', error);
    return res.status(500).json({ error: 'Failed to generate image preview.' });
  }
});

// API Route: Plans configuration
app.get('/api/plans', (req, res) => {
  res.json({
    free: {
      id: 'free',
      name: 'Free Starter',
      priceMonthly: 0,
      dailyChats: 4,
      monthlyChats: 0,
      features: [
        '4 Free Generation/Refinement Chats per day',
        'Daily credit auto-refresh at midnight',
        'Midjourney v6.1 & Runway Gen-3 syntax export',
        'Cinematic, Photorealistic & Abstract styles',
        'Basic Prompt Anatomy breakdown',
      ],
    },
    golden: {
      id: 'golden',
      name: 'Golden Plan',
      priceMonthly: 5.00,
      dailyChats: 0,
      monthlyChats: 30,
      features: [
        '30 Full Generation & Refinement Chats / month',
        'Full Midjourney v6.1 flag customizer (--ar, --v, --s, --c)',
        'Runway Gen-3 camera motion director',
        'Cinematic, Photorealistic, Abstract & Anime presets',
        'High-priority generation speed',
        'Unlimited copy & export in TXT/JSON',
      ],
    },
    diamond: {
      id: 'diamond',
      name: 'Diamond Plan',
      priceMonthly: 12.00,
      dailyChats: 0,
      monthlyChats: 80,
      popular: true,
      features: [
        '80 Full Generation & Refinement Chats / month',
        'Everything in Golden Plan',
        'Negative Prompt Architect & Lens Calibration',
        '3 Dynamic variations generated per request',
        'Camera rig simulation (Focal length, Aperture, Sensor)',
        'Prompt Library with unlimited cloud saves',
        'Priority feature updates',
      ],
    },
    premium: {
      id: 'premium',
      name: 'Premium Plan',
      priceMonthly: 25.00,
      dailyChats: 0,
      monthlyChats: 200,
      features: [
        '200 Full Generation & Refinement Chats / month',
        'Everything in Diamond Plan',
        'Power-user batch generation mode',
        'Advanced Runway Motion Brush vector calculator',
        'Sora, Kling, Luma & Flux.1 prompt syntax engines',
        'Commercial visual directors toolkit',
        'Dedicated VIP server throughput',
      ],
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Plan',
      priceMonthly: 99.00,
      customPricing: true,
      dailyChats: 0,
      monthlyChats: 999999,
      unlimited: true,
      features: [
        'Unlimited Generation & Refinement Chats',
        'Multi-seat workspace & team collaboration',
        'Custom fine-tuned studio prompt presets',
        'Direct REST API access for studio pipelines',
        'Dedicated account manager & SLA guarantee',
        'Custom invoicing & billing controls',
      ],
    },
  });
});

// API Route: Download complete project as zip archive
app.get('/api/download-project', (req, res) => {
  const zipPath = path.resolve('/tmp/promptvibe-ai-project.zip');
  const pythonCmd = `python3 -c "
import os, zipfile
zip_path = '${zipPath}'
exclude_dirs = {'node_modules', '.git', 'dist', '.aistudio'}
exclude_files = {'.env'}
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f not in exclude_files and not f.endswith('.pyc'):
                file_path = os.path.join(root, f)
                arcname = os.path.relpath(file_path, '.')
                z.write(file_path, arcname)
"`;

  exec(pythonCmd, (error) => {
    if (error) {
      console.error('Failed to generate project zip:', error);
      return res.status(500).json({ error: 'Failed to create zip package' });
    }
    res.download(zipPath, 'promptvibe-ai-project.zip', (downloadErr) => {
      if (downloadErr) {
        console.error('Download error:', downloadErr);
      }
    });
  });
});

// Setup Vite middlewares or static files
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PromptVibe AI Server running on port ${PORT}`);
});
