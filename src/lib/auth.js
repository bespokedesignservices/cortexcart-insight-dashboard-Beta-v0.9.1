import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import FacebookProvider from "next-auth/providers/facebook";
import PinterestProvider from "next-auth/providers/pinterest";
import db from './db';
import axios from 'axios';
import { encrypt } from '@/lib/crypto';

export const authOptions = {
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
            params: {
                scope: 'openid email profile https://www.googleapis.com/auth/youtube.upload',
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
            }
        }
    }),
    TwitterProvider({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      version: "2.0",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      // CORRECT SCOPES for Facebook Pages AND Instagram
      scope: 'email public_profile pages_show_list pages_manage_posts instagram_basic instagram_content_publish',
    }),
    PinterestProvider({
        clientId: process.env.PINTEREST_CLIENT_ID,
        clientSecret: process.env.PINTEREST_CLIENT_SECRET,
        scope: 'boards:read pins:read pins:write user_accounts:read',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Your signIn logic is correct
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
            if (!token.email) token.email = user.email;

            try {
                // Save the main connection token
                await db.query(`
                    INSERT INTO social_connect (user_email, platform, access_token_encrypted, refresh_token_encrypted, expires_at)
                    VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
                    access_token_encrypted = VALUES(access_token_encrypted), 
                    refresh_token_encrypted = VALUES(refresh_token_encrypted),
                    expires_at = VALUES(expires_at);
                `, [token.email, account.provider, encrypt(account.access_token), account.refresh_token ? encrypt(account.refresh_token) : null, account.expires_at ? new Date(account.expires_at * 1000) : null]);
            } catch (dbError) {
                console.error("Error saving social connection:", dbError);
            }

            // Fetch and save Facebook Pages and linked Instagram Accounts
            if (account.provider === 'facebook') {
                try {
                    const pagesResponse = await axios.get(
                        `https://graph.facebook.com/me/accounts?fields=id,name,access_token,picture,instagram_business_account{id,username}&access_token=${account.access_token}`
                    );
                    if (pagesResponse.data.data) {
                        for (const page of pagesResponse.data.data) {
                            // Save Facebook Page
                            await db.query(`
                                INSERT INTO facebook_pages (user_email, page_id, page_name, access_token_encrypted)
                                VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
                                page_name = VALUES(page_name), access_token_encrypted = VALUES(access_token_encrypted);
                            `, [token.email, page.id, page.name, encrypt(page.access_token)]);

                            // If an IG account is linked, save it too
                            if (page.instagram_business_account) {
                                await db.query(`
                                    INSERT INTO instagram_accounts (user_email, instagram_user_id, username, access_token_encrypted, facebook_page_id)
                                    VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
                                    username = VALUES(username), access_token_encrypted = VALUES(access_token_encrypted);
                                `, [token.email, page.instagram_business_account.id, page.instagram_business_account.username, encrypt(page.access_token), page.id]);
                            }
                        }
                    }
                } catch (error) { console.error("[AUTH] Error fetching FB/IG assets:", error.response?.data?.error); }
            }
        }
        return token;
    },
    
    async session({ session, user, token }) {
        // Add user ID to the session
        session.user.id = token.sub || user.id;

        // Attach all social assets to the session so the frontend can access them
        try {
            const [fbPages] = await db.query('SELECT page_id, page_name FROM facebook_pages WHERE user_email = ?', [session.user.email]);
            session.user.facebookPages = fbPages || [];

            const [igAccounts] = await db.query('SELECT instagram_user_id, username FROM instagram_accounts WHERE user_email = ?', [session.user.email]);
            session.user.instagramAccounts = igAccounts || [];
            
            const [pinBoards] = await db.query('SELECT board_id, board_name FROM pinterest_boards WHERE user_email = ?', [session.user.email]);
            session.user.pinterestBoards = pinBoards || [];
        } catch (error) {
            console.error("Error attaching social assets to session:", error);
        }
        return session;
    },
  },
  session: {
    // Use 'jwt' for serverless, or 'database' if you prefer db sessions
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};