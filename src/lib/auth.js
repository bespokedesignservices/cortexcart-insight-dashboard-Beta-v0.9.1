// src/lib/auth.js
import GoogleProvider from 'next-auth/providers/google';
import XProvider from 'next-auth/providers/twitter'; // Example for X (Twitter)
import db from '../../lib/db'; // Make sure this path is correct

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    XProvider({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      version: "2.0", // Important for X's OAuth 2.0
    }),
    // You can add more providers here (Facebook, LinkedIn, etc.)
  ],

  // This callback is triggered when a user links a new OAuth account
  events: {
    async accountLinked({ user, account }) {
      if (user.email && account.provider !== 'google') { // We don't need to store Google tokens for this
        try {
          const query = `
            INSERT INTO social_connections (user_email, platform, access_token, refresh_token, token_expires_at)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              access_token = VALUES(access_token),
              refresh_token = VALUES(refresh_token),
              token_expires_at = VALUES(token_expires_at);
          `;

          // Convert expires_in (seconds) to a TIMESTAMP
          const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;
          
          await db.query(query, [
            user.email,
            account.provider, // e.g., 'x', 'facebook'
            account.access_token,
            account.refresh_token,
            expiresAt
          ]);
          console.log(`Saved tokens for ${user.email} and platform ${account.provider}`);
        } catch (error) {
          console.error('Failed to save social connection tokens:', error);
        }
      }
    }
  },

  // The session callback adds the user's ID for database relations
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.userId = token.sub; 
      }
      return session;
    },
  },
};
