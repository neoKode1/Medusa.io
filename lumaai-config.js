import 'lumaai/shims/web';
import LumaAI from 'lumaai';

if (!process.env.LUMAAI_API_KEY) {
  throw new Error('LUMAAI_API_KEY is not defined in environment variables');
}

const client = new LumaAI({
  authToken: process.env.LUMAAI_API_KEY,
});

export default client;
