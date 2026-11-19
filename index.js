require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');

const { TOKEN, SERVER_URL, AUTH_KEY } = process.env;
const port = process.env.PORT || 8080;
const telegramApi = `https://api.telegram.org/bot${TOKEN}`;
const webhookPath = `/webhook/${TOKEN}`;
const app = express();

app.use(bodyParser.json());

async function processMessage(message) {
    if (!message || message.from?.is_bot) {
        return;
    }

    if (typeof message.text === 'string') {
        const response = await axios.post(
            'https://api-free.deepl.com/v2/translate',
            qs.stringify({ auth_key: AUTH_KEY, text: message.text, target_lang: 'UK' }),
            { timeout: 15000 }
        );
        const translation = response.data.translations[0].text;

        await axios.post(`${telegramApi}/sendMessage`, {
            chat_id: message.chat.id,
            text: translation,
        }, { timeout: 15000 });
    } else if (message.sticker) {
        await axios.post(`${telegramApi}/sendSticker`, {
            chat_id: message.chat.id,
            sticker: message.sticker.file_id,
        }, { timeout: 15000 });
    }
}

app.post(webhookPath, async (request, response) => {
    try {
        await processMessage(request.body.message || request.body.channel_post);
        response.sendStatus(200);
    } catch (error) {
        // Axios errors can contain credentials and message bodies in their request config.
        console.error('Message processing failed', error.response?.status || error.code || 'unknown');
        response.sendStatus(502);
    }
});

async function start() {
    if (!TOKEN || !SERVER_URL || !AUTH_KEY) {
        throw new Error('Set TOKEN, SERVER_URL and AUTH_KEY in your environment.');
    }
    if (new URL(SERVER_URL).protocol !== 'https:') {
        throw new Error('SERVER_URL must use HTTPS.');
    }

    await axios.post(`${telegramApi}/setWebhook`, {
        url: SERVER_URL.replace(/\/+$/, '') + webhookPath,
    }, { timeout: 15000 });

    return app.listen(port, () => {
        console.log(`Ukrainian translator listening on port ${port}`);
    });
}

if (require.main === module) {
    start().catch((error) => {
        console.error('Startup failed', error.response?.status || error.code || error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, start };
