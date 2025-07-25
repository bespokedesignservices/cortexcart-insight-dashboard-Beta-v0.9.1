import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import FacebookProvider from "next-auth/providers/facebook";
import PinterestProvider from "next-auth/providers/pinterest";
import { db } from '@/lib/db'; 
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
        // ... logic to save the main connection ...

        if (account.provider === 'facebook') {
            try {
                // This fetches all pages and their unique, permanent access tokens
                const pagesResponse = await axios.get(
                    `https://graph.facebook.com/me/accounts?fields=id,name,access_token&access_token=${account.access_token}`
                );
 if (pagesResponse.data.data) {
    for (const page of pagesResponse.data.data) {
        // This query now includes the 'picture' column
        const pageQuery = `
            INSERT INTO facebook_pages (user_email, page_id, page_name, access_token_encrypted, picture_url)
            VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
            page_name = VALUES(page_name), 
            access_token_encrypted = VALUES(access_token_encrypted),
            picture_url = VALUES(picture_url);`;
        
        // This array now includes the picture URL
        await db.query(pageQuery, [
            token.email, 
            page.id, 
            page.name, 
            encrypt(page.access_token),
            page.picture?.data?.url // Safely access the nested picture URL
        ]);
    }
}
            } catch (error) { console.error("[AUTH] Error fetching FB Pages:", error); }
        }
    }
    return token;
},
   
    async session({ session, token }) {
        if (token && session.user) {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.name = token.name;
        }

        try {
            const [fbPages] = await db.query('SELECT page_id, page_name, picture_url FROM facebook_pages WHERE user_email = ?', [session.user.email]);
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
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};