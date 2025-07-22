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
                    // ❗️ We add the youtube.upload scope here
                    scope: 'openid email profile https://www.googleapis.com/auth/youtube.upload',
                    // This ensures the user is always prompted for consent, which is good for getting refresh tokens
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
      scope: 'email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts',

    }),
       PinterestProvider({
    clientId: process.env.PINTEREST_CLIENT_ID,
    clientSecret: process.env.PINTEREST_CLIENT_SECRET,
    scope: 'boards:read pins:read pins:write user_accounts:read', // Ensure 'boards:read' is included
    token: `${process.env.PINTEREST_API_URL}/v5/oauth/token`,
    userinfo: `${process.env.PINTEREST_API_URL}/v5/user_account`,
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
    // This is the single, crucial gatekeeper. 
    // All logic that needs 'account' goes inside here.
    if (account && user) {
        
        // --- 1. General Sign-in Logic ---
        // (This part is from your original code and is correct)
        if (!token.email) {
            let emailForToken = user.email || `${user.id}@users.twitter.com`;
            token.id = user.id;
            token.email = emailForToken;
            token.name = user.name;
            token.picture = user.image;
        }

        // --- 2. Save the Connection Token to the Database ---
        try {
            const query = `
                INSERT INTO social_connect (user_email, platform, access_token_encrypted, refresh_token_encrypted, expires_at)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    access_token_encrypted = VALUES(access_token_encrypted), 
                    refresh_token_encrypted = VALUES(refresh_token_encrypted),
                    expires_at = VALUES(expires_at);
            `;
            await db.query(query, [token.email, account.provider, encrypt(account.access_token), encrypt(account.refresh_token), new Date(account.expires_at * 1000)]);
        } catch (dbError) {
            console.error("CRITICAL ERROR saving social connection:", dbError);
        }

        // --- 3. Fetch Provider-Specific Assets ---

        // If the provider is Facebook, fetch Pages and IG Accounts
        if (account.provider === 'facebook') {
            try {
                const pagesResponse = await axios.get(
                    `https://graph.facebook.com/me/accounts?fields=id,name,access_token,picture&access_token=${account.access_token}`);
        console.log("[AUTH DEBUG] Raw Facebook Pages Response:", JSON.stringify(pagesResponse.data, null, 2));
                if (pagesResponse.data.data) {
                    for (const page of pagesResponse.data.data) {
                        const pageQuery = `
                            INSERT INTO facebook_pages (user_email, page_id, page_name, access_token_encrypted)
                            VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                            page_name = VALUES(page_name), access_token_encrypted = VALUES(access_token_encrypted);`;
                        await db.query(pageQuery, [token.email, page.id, page.name, encrypt(page.access_token)]);
                    }
                }
            } catch (error) { 
                console.error("[AUTH] Error fetching FB Pages:", error.response?.data?.error); 
            }
        }

        // If the provider is Pinterest, fetch Boards
        if (account.provider === 'pinterest') {
            try {
                const boardsResponse = await axios.get(`${process.env.PINTEREST_API_URL}/v5/boards`, {
                    headers: { 'Authorization': `Bearer ${account.access_token}` }
                });
                if (boardsResponse.data.items) {
                    for (const board of boardsResponse.data.items) {
                        const boardQuery = `
                            INSERT INTO pinterest_boards (user_email, board_id, board_name)
                            VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE board_name = VALUES(board_name);`;
                        await db.query(boardQuery, [token.email, board.id, board.name]);
                    }
                }
            } catch (error) {
                console.error("Error fetching Pinterest boards:", error.response?.data);
            }
        }
    }

    // This return statement is outside the main 'if' block and always runs.
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
      try {
        const [boards] = await db.query('SELECT board_id, board_name FROM pinterest_boards WHERE user_email = ?', [token.email]);
        session.user.pinterestBoards = boards || [];
    } catch (error) {
        console.error("Error fetching Pinterest boards for session:", error);
        session.user.pinterestBoards = [];
    }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};