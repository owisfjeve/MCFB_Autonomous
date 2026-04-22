const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const cron = require('node-cron');
const express = require('express');
const axios = require('axios');

// --- 1. إعداد سيرفر الويب لمنع الخمول ---
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('Autonomous Agent @MCFB_MODS is ACTIVE & AWAKE 🚀');
});

app.listen(PORT, () => {
    console.log(`--- ⚡ السيرفر يعمل على منفذ ${PORT} ---`);
});

// --- 2. إعداد المفاتيح ---
const token = process.env.TELE_TOKEN;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new TelegramBot(token, { polling: true });

// رابط الـ URL الخاص بك على Render (استبدله برابطك الفعلي)
const RENDER_EXTERNAL_URL = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` || "http://localhost:10000";

console.log("--- 🧠 تم تفعيل العقل المستقل لـ @MCFB_MODS ---");

// --- 3. [ميزة منع النوم]: البوت يوقظ نفسه كل 10 دقائق ---
setInterval(async () => {
    try {
        await axios.get(RENDER_EXTERNAL_URL);
        console.log("--- 🛡️ نظام الحماية: البوت أرسل إشارة استيقاظ لنفسه ---");
    } catch (err) {
        console.log("⚠️ فشل إرسال إشارة الاستيقاظ، ولكن لا تقلق السيرفر لا يزال يعمل.");
    }
}, 600000); // 600,000 مللي ثانية = 10 دقائق

// --- 4. [المبادرة الذاتية]: نشر نصيحة تلقائية كل 12 ساعة ---
cron.schedule('0 */12 * * *', async () => {
    try {
        const decision = await groq.chat.completions.create({
            messages: [{ 
                role: "system", 
                content: "أنت مدير مستقل لقناة @MCFB_MODS. ابتكر نصيحة برمجية أو تقنية جديدة عن ماين كرافت وانشرها لمتابعيك." 
            }],
            model: "llama-3.1-8b-instant",
        });
        
        const tip = decision.choices[0].message.content;
        bot.sendMessage('@MCFB_MODS', `🤖 **تحديث مستقل:**\n\n${tip}`, { parse_mode: 'Markdown' });
        console.log("✅ تم نشر تحديث تلقائي للقناة.");
    } catch (e) {
        console.log("❌ خطأ في المبادرة:", e.message);
    }
});

// --- 5. [الذكاء الدفاعي والردود]: تحليل وحماية ورد ذكي ---
bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    try {
        // فحص أمان الرسالة
        const safetyCheck = await groq.chat.completions.create({
            messages: [{ 
                role: "system", 
                content: "حلل الرسالة. إذا كانت سبام أو روابط مشبوهة رد بكلمة DANGER. غير ذلك رد بكلمة SAFE." 
            }, { role: "user", content: msg.text }],
            model: "llama-3.1-8b-instant",
        });

        if (safetyCheck.choices[0].message.content.includes('DANGER')) {
            bot.deleteMessage(msg.chat.id, msg.message_id);
            bot.sendMessage(msg.chat.id, "🚫 **نظام الحماية:** تم حذف رسالة مشبوهة تلقائياً.");
            return;
        }

        // الرد الذكي
        bot.sendChatAction(msg.chat.id, 'typing');
        const aiResponse = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "أنت المساعد الذكي والمستقل لقناة @MCFB_MODS. ساعد المبرمجين واللاعبين بذكاء واحترافية." },
                { role: "user", content: msg.text }
            ],
            model: "llama-3.1-8b-instant",
        });

        bot.sendMessage(msg.chat.id, aiResponse.choices[0].message.content, { reply_to_message_id: msg.message_id });

    } catch (err) {
        console.error("Error:", err.message);
    }
});

// منع توقف البوت عند حدوث أخطاء في الشبكة
bot.on('polling_error', (err) => console.log("Polling Error:", err.code));
