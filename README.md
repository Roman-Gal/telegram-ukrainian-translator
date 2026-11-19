# Telegram Ukrainian Translator

A Node.js Telegram bot that translates text messages into Ukrainian using DeepL. It receives updates through an Express webhook and sends translations back to the originating chat.

## Features

- Translates text in private chats, groups and channel posts.
- Sends received stickers back to the same chat.
- Shares one message-processing path for regular messages and channel posts.
- Awaits API requests and reports failures without logging tokens or message bodies.
- Registers the webhook on startup.

## Stack

Node.js 18+, Express, Axios, Telegram Bot API and DeepL API Free.

## Configuration

Create a bot with Telegram's BotFather and obtain a DeepL API Free key. Copy `.env.example` to `.env` and supply your own values.

| Variable | Purpose |
| --- | --- |
| `TOKEN` | Telegram bot token |
| `SERVER_URL` | Public HTTPS origin of the deployed server |
| `AUTH_KEY` | DeepL API Free key |
| `PORT` | HTTP port, defaults to `8080` |

## Start

```sh
npm ci
npm start
```

For development with automatic restarts, use `npm run dev`. A public HTTPS address or a development tunnel is needed for Telegram to deliver updates.

The server registers `SERVER_URL/webhook/TOKEN` with Telegram. Keep the webhook path and environment file private. This repository contains the bot implementation; deploy your own instance using your own credentials.

## Message flow

1. Telegram sends an update to the webhook.
2. The bot reads either `message` or `channel_post`.
3. Text is sent to DeepL with target language `UK`.
4. The translated text is posted to the original chat.
5. Stickers are echoed using their Telegram file identifier.

A group bot receives the updates allowed by its Telegram privacy settings. Channel posting requires the relevant channel permissions. Translation uses network services and consumes your DeepL quota.

## Check the code

```sh
npm test
```

This command checks JavaScript syntax. An end-to-end run requires configured Telegram and DeepL accounts.

## Files

- `index.js` — HTTP server, webhook registration and message processing.
- `.env.example` — configuration template.
- `Procfile` — process declaration for compatible hosting platforms.
