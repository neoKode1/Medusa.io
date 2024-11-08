import { useState } from 'react';
import { X, Wand2 } from 'lucide-react';

const PrometheusPrompt = ({ 
  isOpen, 
  onClose, 
  onGeneratePrompt, 
  selectedModel 
}) => {
  const [settings, setSettings] = useState({
    subject: '',
    style: 'realistic',
    mood: 'neutral',
    movie: 'none',
    genre: 'none',
    lighting: 'natural',
    camera: 'medium shot',
    aspectRatio: '1:1',
    steps: 30,
    quality: 'high',
    extras: []
  });

  const modelSpecificPrompts = {
    'flux-pro-ultra': {
      templates: [
        "professional {subject}, {lighting} lighting, {style} style, {mood} mood, {camera}, masterpiece quality",
        "{subject} with {lighting} illumination, {style} rendering, {mood} atmosphere, {camera} composition"
      ],
      extras: ['raw photo', 'professional grade', 'high-end capture']
    },
    'flux-dev': {
      templates: [
        "experimental {subject}, {lighting}, {style} aesthetic, {mood}, {camera}, innovative composition",
        "creative interpretation of {subject}, {lighting} ambiance, {style} approach, {mood} feeling, {camera} framing"
      ],
      extras: ['experimental', 'innovative', 'cutting edge']
    },
    'recraft-v3': {
      templates: [
        "artistic {subject}, {lighting} atmosphere, {style} interpretation, {mood} emotion, {camera} perspective",
        "{subject} with {lighting} ambiance, {style} artistry, {mood} feeling, {camera} view"
      ],
      extras: ['artistic', 'stylized', 'refined']
    },
    'stable-diffusion-3': {
      templates: [
        "detailed {subject}, {lighting} illumination, {style} rendering, {mood} atmosphere, {camera}, highly detailed",
        "masterful {subject}, {lighting} environment, {style} execution, {mood} essence, {camera} composition"
      ],
      extras: ['masterpiece', 'best quality', 'highly detailed']
    },
    'gen3a_turbo': {
      templates: [
        "cinematic {subject} in motion, {lighting} lighting, {style} style, {mood} mood, {camera}, fluid movement",
        "dynamic {subject}, {lighting} illumination, {style} animation, {mood} atmosphere, {camera} tracking shot"
      ],
      extras: ['smooth motion', 'cinematic quality', 'professional animation']
    }
  };

  const generatePrompt = () => {
    const modelConfig = modelSpecificPrompts[selectedModel];
    if (!modelConfig) return '';

    const template = modelConfig.templates[Math.floor(Math.random() * modelConfig.templates.length)];
    const extras = modelConfig.extras;

    let prompt = template
      .replace('{subject}', settings.subject)
      .replace('{lighting}', settings.lighting)
      .replace('{style}', settings.style)
      .replace('{mood}', settings.mood)
      .replace('{camera}', settings.camera);

    if (settings.movie !== 'none') {
      prompt += `, in the style of ${settings.movie}`;
    }

    if (settings.genre !== 'none') {
      prompt += `, ${settings.genre} style`;
    }

    prompt += `, ${settings.quality} quality`;
    if (settings.steps > 30) prompt += ', ultra detailed';
    if (extras.length > 0) {
      prompt += `, ${extras.join(', ')}`;
    }

    return prompt;
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Prometheus Prompt Generator</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <input
              type="text"
              value={settings.subject}
              onChange={(e) => setSettings({...settings, subject: e.target.value})}
              className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
              placeholder="Describe your main subject"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
              <select
                value={settings.style}
                onChange={(e) => setSettings({...settings, style: e.target.value})}
                className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
              >
                <option value="realistic">Realistic</option>
                <option value="artistic">Artistic</option>
                <option value="cinematic">Cinematic</option>
                <option value="abstract">Abstract</option>
                <option value="minimalist">Minimalist</option>
                <option value="surreal">Surreal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
              <select
                value={settings.mood}
                onChange={(e) => setSettings({...settings, mood: e.target.value})}
                className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
              >
                <option value="neutral">Neutral</option>
                <option value="dramatic">Dramatic</option>
                <option value="peaceful">Peaceful</option>
                <option value="mysterious">Mysterious</option>
                <option value="energetic">Energetic</option>
                <option value="melancholic">Melancholic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Movie Style</label>
              <select
                value={settings.movie}
                onChange={(e) => setSettings({...settings, movie: e.target.value})}
                className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
              >
                <option value="none">None</option>
                <option value="Blade Runner">Blade Runner</option>
                <option value="Matrix">Matrix</option>
                <option value="Star Wars">Star Wars</option>
                <option value="Lord of the Rings">Lord of the Rings</option>
                <option value="Mad Max">Mad Max</option>
                <option value="Avatar">Avatar</option>
                <option value="Dune">Dune</option>
                <option value="Inception">Inception</option>
                <option value="Interstellar">Interstellar</option>
                <option value="Alien">Alien</option>
                <option value="Tron">Tron</option>
                <option value="Fifth Element">Fifth Element</option>
                <option value="Ghost in the Shell">Ghost in the Shell</option>
                <option value="Akira">Akira</option>
                <option value="2001: A Space Odyssey">2001: A Space Odyssey</option>
                <option value="Ex Machina">Ex Machina</option>
                <option value="Metropolis">Metropolis</option>
                <option value="Spirited Away">Spirited Away</option>
                <option value="Princess Mononoke">Princess Mononoke</option>
                <option value="The Dark Knight">The Dark Knight</option>
                <option value="Sin City">Sin City</option>
                <option value="300">300</option>
                <option value="Jurassic Park">Jurassic Park</option>
                <option value="Harry Potter">Harry Potter</option>
                <option value="The Grand Budapest Hotel">The Grand Budapest Hotel</option>
                <option value="Kill Bill">Kill Bill</option>
                <option value="Pan's Labyrinth">Pan's Labyrinth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <select
                value={settings.genre}
                onChange={(e) => setSettings({...settings, genre: e.target.value})}
                className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
              >
                <option value="none">None</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="fantasy">Fantasy</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="steampunk">Steampunk</option>
                <option value="horror">Horror</option>
                <option value="noir">Film Noir</option>
                <option value="western">Western</option>
                <option value="anime">Anime</option>
                <option value="gothic">Gothic</option>
                <option value="post-apocalyptic">Post-Apocalyptic</option>
                <option value="retro-futuristic">Retro-Futuristic</option>
                <option value="dieselpunk">Dieselpunk</option>
                <option value="biopunk">Biopunk</option>
                <option value="solarpunk">Solarpunk</option>
                <option value="afrofuturism">Afrofuturism</option>
                <option value="dark fantasy">Dark Fantasy</option>
                <option value="cosmic horror">Cosmic Horror</option>
                <option value="high fantasy">High Fantasy</option>
                <option value="low fantasy">Low Fantasy</option>
                <option value="urban fantasy">Urban Fantasy</option>
                <option value="magical realism">Magical Realism</option>
                <option value="synthwave">Synthwave</option>
                <option value="vaporwave">Vaporwave</option>
                <option value="art deco">Art Deco</option>
                <option value="art nouveau">Art Nouveau</option>
                <option value="brutalist">Brutalist</option>
                <option value="minimalist">Minimalist</option>
                <option value="baroque">Baroque</option>
                <option value="renaissance">Renaissance</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => onGeneratePrompt(generatePrompt())}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 border border-blue-500"
          >
            <Wand2 size={20} />
            <span>Generate Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrometheusPrompt; 