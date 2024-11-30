import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

console.log('Loading NextAuth configuration...');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('Google Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing Google OAuth Credentials');
  throw new Error('Missing Google OAuth Credentials');
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error('Missing NEXTAUTH_SECRET');
  throw new Error('Missing NEXTAUTH_SECRET');
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', { code, metadata });
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', { code, metadata });
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('Redirect Callback:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SignIn Callback:', { 
        user: user?.email, 
        provider: account?.provider,
        profileEmail: profile?.email
      });
      return true;
    },
  },
}); 