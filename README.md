# Medusa.io - Advanced AI Image & Video Generation Platform

Medusa.io is a cutting-edge web application that harnesses state-of-the-art AI models for generating high-quality images and videos from text prompts. Built with Next.js and TypeScript, it offers a seamless interface for content creation with support for multiple AI models.

## Key Features

- **Prometheus Prompt Engine**
  - Advanced prompt enhancement algorithm
  - Dynamic keyword weighting
  - Style-specific optimizations
  - Contextual prompt refinement
  - Automatic quality boosting
  - Genre-specific enhancements
  - Artistic style integration
  - Technical parameter optimization

- **Multi-Model Integration**
  - Flux Models (Dev, Pro, 1.1 Pro)
  - Stable Diffusion XL & 3.5
  - Recraft V3
  - Luma AI (Video Generation)

- **Advanced Generation Controls**
  - Customizable image dimensions (128-1024px)
  - Adjustable generation steps (1-50)
  - Guidance scale control (1-20)
  - Reference image support
  - PNG output format with quality settings
  - Safety tolerance controls

- **Smart Prompt System**
  - Genre-based prompt generation
  - Style presets (25+ options)
  - Movie & book reference integration
  - Cinematic quality enhancement

## Prometheus Prompt Engine

The Prometheus Prompt Engine is our advanced prompt enhancement system that transforms basic prompts into highly optimized instructions for AI models.

### Features
- **Quality Enhancement**: Automatically adds quality-boosting parameters
- **Style Integration**: Seamlessly incorporates artistic styles
- **Technical Optimization**: Adjusts technical parameters for optimal results
- **Contextual Refinement**: Enhances prompts based on selected genre and style

### Example Usage
```typescript
// Basic prompt
"a fairy in the forest"

// Prometheus-enhanced prompt
"masterfully crafted fairy in an enchanted forest, ethereal atmosphere, 
rim lighting, intricate details, professional photography, artistic 
composition, cinematic quality, high detail, sharp focus, 8k resolution"
```

## Setup Guide

### Prerequisites
- Node.js 18+ 
- npm/yarn
- Replicate API access
- Luma AI API access

### Environment Configuration

Create `.env.local`:
```env
REPLICATE_API_TOKEN=your_replicate_token
LUMAAI_API_KEY=your_lumaai_key
```

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/medusa.io.git
cd medusa.io
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run development server:
```bash
npm run dev
# or
yarn dev
```

## Project Architecture

```
medusa.io/
├── frontend/
│   ├── components/
│   │   ├── BlackHoleVisualization/
│   │   └── [other components]
│   ├── pages/
│   │   ├── api/
│   │   │   ├── predictions.ts
│   │   │   └── lumaai.ts
│   │   └── TextToImagePage.tsx
│   └── constants/
│       └── promptGuide.ts
├── public/
│   └── attachments/
└── types/
```

## API Endpoints

### Image Generation
```typescript
POST /api/predictions
{
  prompt: string
  model_id: string
  steps: number
  width: number
  height: number
  guidance: number
  scheduler?: string
  reference_image?: string
}
```

### Video Generation
```typescript
POST /api/lumaai
{
  prompt: string
  keyframes?: {
    frame0: {
      type: "image"
      url: string
    }
  }
}
```

## Development

### Running Tests
```bash
npm run test
# or
yarn test
```

### Building for Production
```bash
npm run build
# or
yarn build
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Support & Contact

- Issues: GitHub Issues
- Email: support@medusa.io
- Discord: [Medusa Community](https://discord.gg/medusa)

## Acknowledgments

- [Replicate](https://replicate.com/) - AI Model Hosting
- [Luma AI](https://lumalabs.ai/) - Video Generation
- [Next.js](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling