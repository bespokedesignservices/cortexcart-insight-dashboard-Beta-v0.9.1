import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // <-- 1. Import from the new shared file

// 2. Pass the options object to NextAuth
const handler = NextAuth(authOptions);

// 3. The export of authOptions is removed from this file.
export { handler as GET, handler as POST };
