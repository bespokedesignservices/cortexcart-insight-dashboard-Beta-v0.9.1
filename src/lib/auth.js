// src/lib/auth.js
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import FacebookProvider from "next-auth/providers/facebook";
import db from './db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    TwitterProvider({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      version: "2.0",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const { email, name } = user;
      const { provider } = account;

      if (!email) {
        console.error("Auth Error: No email returned from provider.");
        return false; // Prevent sign-in if no email
      }

      const connection = await db.getConnection();
      try {
        // Find or create the primary user record in the 'sites' table
        const [userResult] = await connection.query('SELECT * FROM sites WHERE user_email = ?', [email]);
        if (userResult.length === 0) {
          console.log(`Creating new user site for: ${email}`);
          await connection.query('INSERT INTO sites (user_email, site_name) VALUES (?, ?)', [email, `${name}'s Site`]);
        }
        
        // This is a good place for any logic related to social connections if needed
        console.log(`User ${email} signed in with ${provider}.`);

      } catch (error) {
        console.error('Database Error during sign-in:', error);
        return false; // Prevent sign-in if there's a database error
      } finally {
        connection.release();
      }
      
      return true; // Allow the sign-in to proceed
    },
    async session({ session, token }) {
      if (session.user) {
        // Add the user's role to the session
        const [admins] = await db.query('SELECT role FROM admins WHERE email = ?', [session.user.email]);
        session.user.role = admins.length > 0 ? admins[0].role : 'user';
        // Add the user ID from the token to the session
        session.user.id = token.sub; 
      }
      return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
        return token;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
