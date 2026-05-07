import fs from 'fs/promises';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function startAuth() {
    try {
        const client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });

        if (client.credentials) {
            const payload = JSON.stringify({
                type: 'authorized_user',
                client_id: client.credentials.client_id,
                client_secret: client.credentials.client_secret,
                refresh_token: client.credentials.refresh_token,
            });
            await fs.writeFile(TOKEN_PATH, payload);
            console.log('SUCESSO! O arquivo token.json foi criado na raiz do projeto.');
            process.exit(0);
        }
    } catch (err) {
        console.error('Erro na autenticação:', err);
    }
}

startAuth();