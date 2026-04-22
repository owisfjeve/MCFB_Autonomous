const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const cron = require('node-cron');
const express = require('express');

// --- إعداد سيرفر الويب لضمان الاستمرارية ---
const app = express();
app.get('/', (req, res) => res.send('Autonomous Agent @MCFB_MODS is ACTIVE 🚀'));
app.listen(process.env.PORT || 10000);

// --- إعداد المفاتيح ---
const token = process.env.TELE_TOKEN;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new TelegramBot(token, { polling: true });

console.log("--- ⚡ تم تفعيل العقل المستقل لـ @MCFB_MODS ---");

// --- 1. [المبادرة الذاتية]: البوت ينشر نصيحة تلقائية كل 12 ساعة ---
// الجدولة: '0 */12 * * *' تعني كل 12 ساعة
cron.schedule('0 */12 * * *', async () => {
    try {
        const decision = await groq.chat.completions.create({
            messages: [{ 
                role: "system", 
                content: "أنت مدير مستقل لقناة @MCFB_MODS. ابتكر نصيحة برمجية أو تقنية جديدة كلياً عن ماين كرافت وانشرها لمتابعيك لجذب التفاعل." 
            }],
            model: "llama-3.1-8b-instant",
        });
        
        const tip = decision.choices[0].message.content;
        bot.sendMessage('@MCFB_MODS', `🤖 **تحديث مستقل من الذكاء الاصطناعي:**\n\n${tip}`, { parse_mode: 'Markdown' });
        console.log("✅ تم نشر تحديث مستقل للقناة.");
    } catch (e) {
        console.log("❌ فشلت المبادرة التلقائية:", e.message);
    }
});

// --- 2. [الذكاء الدفاعي]: تحليل الرسائل وحذف السبام تلقائياً ---
bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    try {
        // فحص أمان الرسالة قبل الرد عليها
        const safetyCheck = await groq.chat.completions.create({
            messages: [{ 
                role: "system", 
                content: "حلل الرسالة. إذا كانت سبام، إعلانات، أو روابط مشبوهة، رد بكلمة DANGER. إذا كانت سليمة رد بكلمة SAFE." 
            }, { role: "user", content: msg.text }],
            model: "llama-3.1-8b-instant",
        });

        if (safetyCheck.choices[0].message.content.includes('DANGER')) {
            bot.deleteMessage(msg.chat.id, msg.message_id);
            bot.sendMessage(msg.chat.id, "🚫 **نظام الحماية المستقل:** تم حذف رسالة مشبوهة.");
            return;
        }

        // --- 3. [الرد الذكي]: البوت يفكر ويجيب بدقة ---
        bot.sendChatAction(msg.chat.id, 'typing');
        const aiResponse = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "أنت المساعد الذكي والمستقل لقناة @MCFB_MODS. هدفك مساعدة اللاعبين والمبرمجين وتطوير المجتمع." },
                { role: "user", content: msg.text }
            ],
            model: "llama-3.1-8b-instant",
        });

        bot.sendMessage(msg.chat.id, aiResponse.choices[0].message.content, { reply_to_message_id: msg.message_id });

    } catch (err) {
        console.error("Error processing message:", err.message);
    }
});

// التعامل مع أخطاء التوصيل لمنع التوقف
bot.on('polling_error', (err) => console.log("Network Issue:", err.code));
