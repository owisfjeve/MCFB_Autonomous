const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is Alive!'));
app.listen(process.env.PORT || 10000);

const token = process.env.TELE_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// إعداد البوت مع تعطيل التكرار
const bot = new TelegramBot(token, { polling: false }); 

// دالة لتشغيل البوت بنظافة
async function startBot() {
    try {
        // مسح أي اتصال قديم (هذا بيحل مشكلة الـ 409)
        await bot.deleteWebHook();
        console.log("--- تم تنظيف الاتصالات القديمة ---");
        
        // تشغيل الاستقبال الجديد
        bot.startPolling();
        console.log("--- ⚡ البوت جاهز للعمل بنظام Gemini ---");
    } catch (e) {
        console.error("خطأ في التشغيل:", e.message);
    }
}

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "أنت 'لوريس الصغير'، المساعد الذكي لفريق UMFB. تحدث باللهجة السعودية، كن خبيراً ومرحاً."
});

bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    bot.sendChatAction(msg.chat.id, 'typing');
    try {
        const result = await model.generateContent(msg.text);
        const response = await result.response;
        bot.sendMessage(msg.chat.id, response.text());
    } catch (e) {
        bot.sendMessage(msg.chat.id, "معليش يا لوريس، صار ضغط على مخي.");
    }
});

startBot();
