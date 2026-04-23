const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const token = process.env.TELE_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL; // رابط السيرفر حقك في ريندر
const port = process.env.PORT || 10000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "أنت 'لوريس الصغير'، المساعد الذكي لفريق UMFB. تحدث باللهجة السعودية، كن مرحاً وخبيراً."
});

// إعداد البوت بنظام Webhook
const bot = new TelegramBot(token);
bot.setWebHook(`${url}/bot${token}`);

// استقبال الرسائل من تيليجرام عبر هذا الرابط
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    bot.sendChatAction(msg.chat.id, 'typing');
    try {
        const result = await model.generateContent(msg.text);
        const response = await result.response;
        bot.sendMessage(msg.chat.id, response.text());
    } catch (e) {
        console.error(e);
    }
});

app.get('/', (req, res) => res.send('لوريس الصغير شغال تمام!'));

app.listen(port, () => {
    console.log(`سيرفر البوت شغال على منفذ ${port}`);
});
