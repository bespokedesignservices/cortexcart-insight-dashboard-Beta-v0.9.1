import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import db from './db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
authorization: {
  params: {
scope: 'openid email profile https://www.googleapis.com/auth/analytics.readonly',
    access_type: 'offline',
    prompt: 'consent',
  },
},
    }),
    TwitterProvider({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      version: "2.0", 
    }),
  ],

  events: {
    async accountLinked({ user, account }) {
      if (user.email && account.provider !== 'google') {
        try {
          const query = `
            INSERT INTO social_connections (user_email, platform, access_token, refresh_token, token_expires_at)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              access_token = VALUES(access_token),
              refresh_token = VALUES(refresh_token),
              token_expires_at = VALUES(token_expires_at);
          `;
          const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;
          await db.query(query, [ user.email, account.provider, account.access_token, account.refresh_token, expiresAt ]);
        } catch (error) {
          console.error('Failed to save social connection tokens:', error);
        }
      }
    }
  },

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          const [admins] = await db.query('SELECT role FROM admins WHERE email = ?', [user.email]);
          if (admins.length > 0) {
            token.role = admins[0].role;
          } else {
            token.role = 'user';
          }
          token.id = user.id;
        } catch (error) {
          console.error("Error fetching user role:", error);
          token.role = 'user';
        }
      }
      return token;
    }
  },
};
