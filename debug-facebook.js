// File: debug-facebook.js
require('dotenv').config({ path: './.env.local' });

const mysql = require('mysql2/promise');
const crypto = require('crypto');

// --- IMPORTANT: CONFIGURE THESE ---
const DB_CONFIG = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const USER_EMAIL_TO_TEST = 'jonathanservice@hotmail.com'; // <--- REPLACE THIS WITH YOUR EMAIL
// ------------------------------------

const ALGORITHM = 'aes-256-gcm';

function decrypt(text) {
    try {
        if (!text) return null;
        const parts = text.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const authTag = Buffer.from(parts[2], 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error.message);
        return null;
    }
}

async function runTest() {
    let connection;
    try {
        console.log('--- [1/4] Connecting to database...');
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('--- Database connection successful.');

        console.log(`\n--- [2/4] Fetching access token for user: ${USER_EMAIL_TO_TEST}...`);
        const [rows] = await connection.execute(
            'SELECT access_token_encrypted FROM social_connect WHERE user_email = ? AND platform = ?',
            [USER_EMAIL_TO_TEST, 'facebook']
        );

        if (rows.length === 0 || !rows[0].access_token_encrypted) {
            throw new Error('No encrypted access token found in the database for this user. Please go to the settings page and connect your Facebook account first.');
        }
        console.log('--- Encrypted token found.');

        const accessToken = decrypt(rows[0].access_token_encrypted);
        if (!accessToken) {
            throw new Error('Failed to decrypt the access token. Please ensure your ENCRYPTION_KEY in .env.local is correct.');
        }
        console.log(`--- Access token decrypted successfully.`);

        console.log('\n--- [3/4] Calling Facebook Graph API...');
        const url = `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name`;
        
        const response = await fetch(url);
        const data = await response.json();

        console.log('\n--- [4/4] FULL RESPONSE FROM FACEBOOK: ---');
        console.log(JSON.stringify(data, null, 2));
        
        if(data.data && data.data.length > 0) {
            console.log("\n✅ SUCCESS: The API returned a list of pages!");
        } else {
            console.log("\n❌ FAILURE: The API returned an empty list or an error. This is a Facebook permission issue.");
        }

    } catch (error) {
        console.error('\n--- SCRIPT FAILED ---');
        console.error(error);
    } finally {
        if (connection) await connection.end();
        console.log('\n--- Test finished ---');
    }
}

runTest();