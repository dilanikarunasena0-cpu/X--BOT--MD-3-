const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Gemini AI API Configuration
const API_TOKEN = "07CRv4";
const GEMINI_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/gemini";

/**
 * 🤖 Professional Gemini AI Chat Plugin (Fixed [object Object] Bug)
 */
Sparky({
    name: "gemini",
    fromMe: isPublic,
    category: "ai",
    desc: "Chat with Gemini Artificial Intelligence."
}, async ({ m, client, args }) => {
    
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") {
                await m.reply(text);
            } else {
                await client.sendMessage(m.jid, { text }, { quoted: m });
            }
        } catch (e) {
            console.error("[X-BOT-MD AI] Reply failed:", e.message);
        }
    };

    try {
        // Input text එක ලබා ගැනීම
        let query = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        query = query || m.quoted?.text || "";

        if (!query) {
            return await sendMsg("🤖 *X-BOT-MD GEMINI AI*\n\nකරුණාකර AI එකෙන් ඇසීමට අවශ්‍ය ප්‍රශ්නය ලබා දෙන්න.\n\n💡 _උදා: .gemini ලෝකයේ දිගම ගඟ කුමක්ද?_");
        }

        // Reaction: Thinking 🧠
        try { if (typeof m.react === "function") await m.react("🧠"); } catch {}

        // 🚀 Fetching Response from WhiteShadow Gemini API
        const response = await axios.get(`${GEMINI_API_URL}?q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`, { timeout: 30000 });

        let aiResult = "";

        // [object Object] වෙන එක වළක්වා ගැනීමට දත්ත පරීක්ෂා කිරීමේ ක්‍රියාවලිය
        if (typeof response.data === "object") {
            aiResult = response.data.result || response.data.responce || response.data.response || response.data.data;
            
            // තවමත් Object එකක් නම් එය String එකක් බවට හැරවීම (Safe side)
            if (typeof aiResult === "object") {
                aiResult = aiResult.text || aiResult.msg || JSON.stringify(aiResult);
            }
        } else {
            aiResult = response.data;
        }

        // පිළිතුරක් නොමැති නම්
        if (!aiResult) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *AI Error:* සේවාදායකයෙන් නිසි පිළිතුරක් ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // Success Reaction & Sending Reply ✨
        try { if (typeof m.react === "function") await m.react("✨"); } catch {}
        
        const formattedResponse = `✨ *👑 𝙂𝙀𝙈𝙄𝙉𝙄 𝘼𝙄 𝘼𝙎𝙎𝙄𝙎𝙏𝘼𝙉𝙏 👑* ✨\n\n${aiResult}\n\n_Powered by X-Bot-MD_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD AI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *AI Internal Error:* ${error.message}`);
    }
});
