// Add environment variables and configuration
const config = {
  api: {
    lumaai: {
      baseUrl: process.env.LUMAAI_API_URL || 'https://api.lumalabs.ai',
      apiKey: process.env.LUMAAI_API_KEY,
    },
    replicate: {
      apiKey: process.env.REPLICATE_API_TOKEN,
      models: {
        animateDiff:
          'zsxkib/animate-diff:1f7d3802327e6c14d0d1cf9be0e3d2ac2d1f7eaf2d62efd3785cc6fb807d3b3b',
        animateDiffVid2Vid:
          'lucataco/animate-diff:41a8977f0a11461fc8bccf1e97df7fe6d1afeb39bdc4c13c8838f3928b83b4b7',
      },
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    google: {
      searchApiKey: process.env.SEARCH_API_KEY,
      searchEngineId: process.env.SEARCH_ENGINE_ID,
    },
  },
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    nextAuth: {
      url: process.env.NEXTAUTH_URL,
      secret: process.env.NEXTAUTH_SECRET,
    },
  },
  storage: {
    type: 'client', // Using client-side storage
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    path: process.env.LOG_PATH,
    logtailToken: process.env.LOGTAIL_SOURCE_TOKEN,
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    sampleRate: parseFloat(process.env.MONITORING_SAMPLE_RATE || '0.1'),
  },
};

export default config;
