import 'lumaai/shims/web';
import LumaAI from 'lumaai';

const client = new LumaAI({
  authToken: process.env.LUMAAI_API_KEY,
});

export default client;
