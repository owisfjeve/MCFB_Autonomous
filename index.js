const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

// تشغيل سيرفر بسيط عشان Render ما يطفي البوت
const app = express();
app.get('/', (req, res) => res.send('Bot is Running!'));
app.listen(process.env.PORT || 10000);

const token = process.env.TELE_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new TelegramBot(token, { polling: true });

// إعداد Gemini 1.5 Flash
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "أنت 'لوريس الصغير'، المساعد الذكي لفريق UMFB وقناة @MCFB_MODS. تحدث باللهجة السعودية، كن خبيراً في ماين كرافت وأكواد البرمجة، وساعد لوريس فرينسكو بكل احترام وذكاء."
});

console.log("--- البوت جاهز للعمل بنظام Gemini ---");

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text || msg.text.startsWith('/')) return;

    bot.sendChatAction(chatId, 'typing');

    try {
        const result = await model.generateContent(msg.text);
        const response = await result.response;
        bot.sendMessage(chatId, response.text());
    } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, "حدث خطأ بسيط في معالجة النص، حاول مرة أخرى.");
    }
});
