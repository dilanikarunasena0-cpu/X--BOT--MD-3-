const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Gemini AI API Configuration
const API_TOKEN = "07CRv4";
const GEMINI_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/gemini";

/**
 * 🤖 Professional Gemini AI Chat Plugin (Type Error Fixed)
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

        let rawData = response.data;
        let extractedOutput = "";

        // 1. JSON පවතිනවාද කියා බලා එය නිවැරදිව Parse කිරීම
        try {
            let parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
            
            if (parsedData && typeof parsedData === "object") {
                extractedOutput = parsedData.response || parsedData.result || parsedData.data || parsedData;
                
                // යම් හෙයකින් extractedOutput එක තවමත් Object එකක් නම් එය String එකක් කර ගැනීම
                if (typeof extractedOutput === "object") {
                    extractedOutput = extractedOutput.text || extractedOutput.msg || JSON.stringify(extractedOutput);
                }
            } else {
                extractedOutput = rawData;
            }
        } catch (jsonErr) {
            extractedOutput = rawData;
        }

        // 2. අනිවාර්යයෙන්ම String එකක් බවට හැරවීම (.replace error එක වැළැක්වීමට)
        let aiResult = String(extractedOutput || "").trim();

        // 3. WHATSAPP සඳහා පෙළ පිරිසිදු කිරීම (Clean & Format Text)
        if (aiResult) {
            // LaTeX / Math සංකේත ඉවත් කිරීම
            aiResult = aiResult.replace(/\$[\s\S]*? text\{([\s\S]*?)\}\$/g, '$1');
            aiResult = aiResult.replace(/\$/g, '');
            
            // Markdown Tables වල ඇති අමතර ඉරි කැබලි පිරිසිදු කිරීම
            aiResult = aiResult.replace(/\|?\s*:?-+\s*:?\s*\|/g, ''); 
            aiResult = aiResult.replace(/\|/g, ' 🔹 '); 
        }

        // පිළිතුරක් නොමැති නම්
        if (!aiResult || aiResult === "") {
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
