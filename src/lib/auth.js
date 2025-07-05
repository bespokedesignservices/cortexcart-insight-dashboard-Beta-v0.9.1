import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import FacebookProvider from "next-auth/providers/facebook";
import db from './db';
import { encrypt } from './crypto';

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
      authorization: {
        params: {
          scope: "tweet.read tweet.write users.read offline.access"
        }
      }
    }),

    // --- ADD THIS NEW PROVIDER ---
    FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        authorization: {
            params: {
                scope: 'email,pages_show_list,instagram_basic,instagram_content_publish,pages_read_engagement,pages_manage_posts'
            }
        }
    })
],
  events: {
    async accountLinked({ user, account }) {
      if (user.email && account.provider === 'twitter') {
        try {
          const query = `
            INSERT INTO social_connections (user_email, platform, access_token_encrypted, refresh_token_encrypted, expires_at)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              access_token_encrypted = VALUES(access_token_encrypted),
              refresh_token_encrypted = VALUES(refresh_token_encrypted),
              expires_at = VALUES(expires_at);
          `;
          
          const encryptedAccessToken = encrypt(account.access_token);
          const encryptedRefreshToken = account.refresh_token ? encrypt(account.refresh_token) : null;
          const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;

          await db.query(query, [ user.email, account.provider, encryptedAccessToken, encryptedRefreshToken, expiresAt ]);
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
