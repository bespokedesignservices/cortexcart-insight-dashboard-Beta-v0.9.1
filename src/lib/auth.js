import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import FacebookProvider from "next-auth/providers/facebook";
import db from './db';
import { encrypt } from '@/lib/crypto';

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
      scope: 'email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      let { email, name } = user;
      if (account.provider === 'twitter' && !email) {
        email = `${user.id}@users.twitter.com`;
      }
      if (!email) return false;

      const connection = await db.getConnection();
      try {
        const [userResult] = await connection.query('SELECT * FROM sites WHERE user_email = ?', [email]);
        if (userResult.length === 0) {
          await connection.query('INSERT INTO sites (user_email, site_name) VALUES (?, ?)', [email, `${name}'s Site`]);
        }
      } catch (error) {
        console.error("DB Error during signIn:", error);
        return false;
      } finally {
        connection.release();
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        let emailForToken = user.email;
        if (account.provider === 'twitter' && !emailForToken) {
          emailForToken = `${user.id}@users.twitter.com`;
        }

        if (!token.email) {
          token.id = user.id;
          token.email = emailForToken;
          token.name = user.name;
          token.picture = user.image;
          try {
            const [admins] = await db.query('SELECT role FROM admins WHERE email = ?', [token.email]);
            token.role = admins.length > 0 ? admins[0].role : 'user';
          } catch (e) {
            console.error("DB error fetching admin role:", e);
            token.role = 'user';
          }
        }
        
        try {
            const userEmail = token.email;
            const platform = account.provider;
            
            const encryptedAccessToken = account.access_token ? encrypt(account.access_token) : null;
            const encryptedRefreshToken = account.refresh_token ? encrypt(account.refresh_token) : null;
            const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;

            // --- THIS IS THE ONLY CHANGE ---
            // The query now points to the new 'social_connect' table
            const query = `
                INSERT INTO social_connect (user_email, platform, access_token_encrypted, refresh_token_encrypted, expires_at)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    access_token_encrypted = VALUES(access_token_encrypted), 
                    refresh_token_encrypted = VALUES(refresh_token_encrypted),
                    expires_at = VALUES(expires_at);
            `;
            await db.query(query, [userEmail, platform, encryptedAccessToken, encryptedRefreshToken, expiresAt]);
            console.log(`Successfully saved/updated connection in NEW 'social_connect' table for ${userEmail} and ${platform}`);
        } catch (dbError) {
            console.error("CRITICAL ERROR saving social connection in JWT callback:", dbError);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};