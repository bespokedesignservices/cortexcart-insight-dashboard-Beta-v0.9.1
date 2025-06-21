import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import db from './db'; // Assuming db.js is now in src/lib

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
    // This callback runs every time a session is checked.
    async session({ session, token }) {
      // Add the user's role and ID to the session object
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    // This callback runs when a user signs in.
    async jwt({ token, user }) {
      if (user) { // This is only available on sign-in
        try {
          // Check if the user exists in our new 'admins' table
          const [admins] = await db.query('SELECT role FROM admins WHERE email = ?', [user.email]);
          if (admins.length > 0) {
            token.role = admins[0].role; // e.g., 'superadmin'
          } else {
            token.role = 'user'; // Default role for everyone else
          }
          token.id = user.id;
        } catch (error) {
          console.error("Error fetching user role:", error);
          token.role = 'user'; // Fallback to default role on error
        }
      }
      return token;
    }
  },
};
