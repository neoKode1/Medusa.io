# Medusa.io

## Setup Instructions

1. **Clone the repository**
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

## 🎯 Usage

1. Visit `http://localhost:3000`
2. Use the menu button to navigate between features:
   - Home
   - Image to Video
   - Text to Image
   - Generate Prompt
3. Follow the intuitive interface to create your content
4. Enjoy the enhanced visual experience! ✨

## 🌟 Recent Updates

- Added consistent menu navigation across all pages
- Improved UI transparency and backdrop blur effects
- Enhanced visual feedback for user interactions
- Updated styling for better accessibility
- Improved mobile responsiveness

## 🔜 Coming Soon

- [ ] User authentication
- [ ] Project saving and sharing
- [ ] Advanced editing tools
- [ ] Community showcase
- [ ] Enhanced mobile experience
- [ ] Offline support (PWA)

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues to improve MEDUSA.IO.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the amazing AI model providers
- Inspired by classic literature and cinema
- Built with love for the creative community

---

Made with 💜 by the MEDUSA.IO team

Let's create something amazing together! 🚀

## ⚠️ Important Notes

- Ensure all API keys are properly set in `.env.local`
- Never commit sensitive credentials to version control
- The FastAPI backend must be running for full functionality
- Check the console for any connection errors
