# MEDSUSA.io

MEDSUSA.io is an advanced AI-powered platform for generating and manipulating visual content, combining multiple AI models for text-to-image, image-to-video, and prompt generation capabilities.

## 🚀 Features

- **Text to Image Generation**
  - Multiple model support (Stable Diffusion, DALL·E 3, Midjourney, etc.)
  - Reference image upload
  - Style and genre customization
  - High-resolution output

- **Image to Video Creation**
  - LumaAI integration
  - AnimateDiff support
  - Motion transfer capabilities
  - Custom duration and ratio settings

- **AI Prompt Generation**
  - Genre-specific suggestions
  - Movie and book reference integration
  - Style customization
  - Mode-specific prompts (image/video)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **AI Services**: OpenAI, LumaAI, Replicate
- **Authentication**: NextAuth.js
- **Storage**: Local storage (cloud storage coming soon)

## 📋 Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn
- Git

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/medusa-io.git
cd medusa-io
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
# API Keys
OPENAI_API_KEY=your_key_here
LUMAAI_API_KEY=your_key_here
REPLICATE_API_TOKEN=your_token_here

# Authentication
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Optional Configuration
NODE_ENV=development
NEXT_PUBLIC_BASE_PATH=/Medusa.io
```

4. **Start Development Servers**
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:frontend
python run.py
```

## 🎯 Usage

1. Visit `http://localhost:3000`
2. Sign in with your Google account
3. Navigate through the menu:
   - Dashboard
   - Text to Image
   - Image to Video
   - Generate Prompt
4. Follow the intuitive interface for each feature

## 🔜 Roadmap

- [ ] User Authentication & Profiles
- [ ] Cloud Storage Integration
- [ ] History & Favorites
- [ ] Batch Processing
- [ ] Advanced Editing Tools
- [ ] API Documentation
- [ ] Mobile App

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for their powerful AI models
- LumaAI for video generation capabilities
- Replicate for model hosting
- The open-source community

## 📧 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@io2Medusa](https://twitter.com/io2Medusa)
- Website: [medusa.io](https://medusa.io)

---

Made with 💜 by the MEDSUSA.io team
