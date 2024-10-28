# 🚀 MEDUSA.IO - AI-Powered Creative Suite

Welcome to MEDUSA.IO - An innovative AI-powered creative suite that combines the power of multiple AI models to generate stunning images and videos! 🎨 🎬

## ✨ Features

- **Text-to-Image Generation** 🖼️
  - Powered by Flux Schnell and Stable Diffusion
  - Genre-based prompt enhancement
  - Reference-based generation from movies and books
  - Multiple artistic style options

- **Image-to-Video Transformation** 🎥
  - Powered by Luma AI Dream Machine
  - Seamless video generation from static images
  - Advanced motion and animation controls
  - High-quality output

- **Smart Prompt Generation** 💡
  - Genre-aware prompt enhancement
  - Reference-based creativity from classic movies and literature
  - Multiple style options for perfect results
  - Intelligent context understanding

- **Responsive Design** 📱
  - Mobile-first approach
  - Optimized breakpoints:
    - Mobile S: 320px
    - Mobile M: 375px
    - Mobile L: 414px
    - Tablet: 567px
    - Desktop: 768px+
  - Fluid typography and layouts
  - Touch-optimized interfaces

## 🛠️ Tech Stack

- Next.js for the frontend
- FastAPI for the backend
- TailwindCSS for styling
- Material UI components
- OpenAI for prompt enhancement
- Multiple AI model integrations

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/medusa-io.git
cd medusa-io
```

2. Install dependencies:
```bash
npm install  # Frontend dependencies
pip install -r requirements.txt  # Backend dependencies
```

3. Set up your environment variables in `.env.local`:
```env
OPENAI_API_KEY=your_key_here
LUMAAI_API_KEY=your_key_here
REPLICATE_API_TOKEN=your_token_here
```

4. Run the development servers:
```bash
# Frontend
npm run dev

# Backend
python run.py
```

## 📱 Device Support

MEDUSA.IO is optimized for the following screen sizes:
- Mobile devices (320px - 567px)
- Tablets (568px - 1024px)
- Desktop (1024px+)

Breakpoint configuration can be found in:
- `tailwind.config.js` for styling
- `next.config.js` for image optimization
- Material UI theme settings in `_app.js`

## 🎯 Usage

1. Visit `http://localhost:3000`
2. Choose your generation mode (Text-to-Image or Image-to-Video)
3. Enter your prompt or upload an image
4. Select genre, reference, and style options
5. Click Generate and watch the magic happen! ✨

## 🌟 Features Coming Soon

- [ ] Batch processing
- [ ] Custom model fine-tuning
- [ ] Advanced editing tools
- [ ] Project saving and sharing
- [ ] Community showcase
- [ ] Enhanced mobile experience
- [ ] Offline support (PWA)

## 🤝 Contributing

We love contributions! Please feel free to submit pull requests or open issues to improve MEDUSA.IO.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the amazing AI model providers
- Inspired by classic literature and cinema
- Built with love for the creative community

---

Made with 💜 by the MEDUSA.IO team

Let's create something amazing together! 🚀

# Medusa.io - AI Prompt Generation System

## Setup Instructions

### 1. Install Dependencies

First, install the Python dependencies:
```bash
cd medusa_io
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env.local` file in the project root with:
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Start the Servers

Start the FastAPI backend server:
```bash
cd medusa_io
uvicorn main:app --reload --port 8000
```

In a new terminal, start the Next.js frontend:
```bash
npm run dev
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

If you see a connection refused error:
1. Ensure the FastAPI server is running on port 8000
2. Check that your OPENAI_API_KEY is valid
3. Verify both frontend and backend servers are running simultaneously
