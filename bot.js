const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const token = process.env.TELE_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// استخدمنا الاسم المستقر gemini-1.5-flash مباشرة
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    systemInstruction: "أنت 'لوريس الصغير'، مساعد ذكي ومرح وخبير لفريق UMFB. تحدث باللهجة السعودية العفوية مع الجميع. خلك حبيب وساعد الكل في التقنية والألعاب والوناسة."
});

const bot = new TelegramBot(token);

app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.post('/', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    
    bot.sendChatAction(msg.chat.id, 'typing');
    
    try {
        // محاولة التوليد باستخدام الموديل المختار
        const result = await model.generateContent(msg.text);
        const response = await result.response;
        bot.sendMessage(msg.chat.id, response.text());
    } catch (e) {
        console.error("Gemini Error:", e.message);
        
        // إذا فشل الفلاش، هذي "خطة الطوارئ" النهائية باستخدام موديل Pro
        try {
            const fallback = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resFallback = await fallback.generateContent(msg.text);
            bot.sendMessage(msg.chat.id, resFallback.response.text());
        } catch (err) {
            bot.sendMessage(msg.chat.id, "معليش يا غالي، يبدو فيه مشكلة في الاتصال بسيرفرات الذكاء الاصطناعي حالياً، جرب بعد شوي.");
        }
    }
});

app.get('/', (req, res) => res.send('لوريس الصغير شغال وجاهز! 🚀'));

const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
