# Konfig Moji Bot
Cloudflare Worker Telegram bot.

## Required secret
Cloudflare Worker Secret:
- Name: BOT_TOKEN
- Value: token from BotFather

## Recommended KV
Create a Cloudflare KV namespace and bind it to the Worker as:
BOT_DATA
The bot uses KV for order/receipt state.

## Telegram
- Bot: @KonfigMojiBot
- Required channel: @konfingMoji
- Support: @Mojttaba6
- Admin ID: 7326981788
- Card: 6037997523216357 — حسینی

## Prices
WireGuard: 5GB 25,000 / 10GB 40,000 / 20GB 80,000 / 50GB 200,000 تومان
Gaming: 12,000 تومان per GB
Web: 3,000 تومان per GB

## Webhook
After deployment:
https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=YOUR_WORKER_URL
Do not publish your token.

For channel membership checks, add the bot to @konfingMoji and preferably make it an administrator.
