const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Gemini AI API Configuration
const API_TOKEN = "07CRv4";
const GEMINI_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/gemini";

/**
 * 🤖 Professional Gemini AI Chat Plugin (Deep JSON Parsing Fixed)
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
        let aiResult = "";

        // 1. DEEP JSON PARSING SYSTEM (ලැජ්ජ නැතුව එන JSON String එක කඩා බිඳ දැමීම)
        try {
            let dataObj = rawData;
            
            // එකම දේ String එකක් විදිහට දෙපාරක් ආවත් Parse කරගැනීමට Loop එකක් භාවිතය
            while (typeof dataObj === "string") {
                dataObj = JSON.parse(dataObj);
            }

            if (dataObj && typeof dataObj === "object") {
                aiResult = dataObj.response || dataObj.result || dataObj.data || JSON.stringify(dataObj);
            } else {
                aiResult = String(dataObj);
            }
        } catch (jsonErr) {
            // JSON Parse කරන්න බැරි සාමාන්‍ය Text එකක් නම් කෙලින්ම ගන්නවා
            if (rawData && typeof rawData === "object") {
                aiResult = rawData.response || rawData.result || rawData.data || JSON.stringify(rawData);
            } else {
                aiResult = String(rawData);
            }
        }

        // 2. අනිවාර්යයෙන්ම String එකක් බවට ස්ථාවර කර ගැනීම
        let cleanText = String(aiResult || "").trim();

        // 3. WHATSAPP සඳහා පෙළ තවත් පිරිසිදු කිරීම
        if (cleanText) {
            // LaTeX / Math සංකේත ඉවත් කිරීම
            cleanText = cleanText.replace(/\$[\s\S]*? text\{([\s\S]*?)\}\$/g, '$1');
            cleanText = cleanText.replace(/\$/g, '');
            
            // Markdown Tables වල ඇති අමතර ඉරි කැබලි පිරිසිදු කිරීම
            cleanText = cleanText.replace(/\|?\s*:?-+\s*:?\s*\|/g, ''); 
            cleanText = cleanText.replace(/\|/g, ' 🔹 '); 
        }

        // පිළිතුරක් නොමැති නම්
        if (!cleanText || cleanText === "" || cleanText === "undefined") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *AI Error:* සේවාදායකයෙන් නිසි පිළිතුරක් ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // Success Reaction & Sending Reply ✨
        try { if (typeof m.react === "function") await m.react("✨"); } catch {}
        
        // මිනිසෙකුට කියවිය හැකි පරිදි ලස්සනට සකස් කළ අවසන් මැසේජ් එක
        const formattedResponse = `✨ *👑 𝙂𝙀𝙈𝙄𝙉𝙄 𝘼𝙄 𝘼𝙎𝙎𝙄𝙎𝙏𝘼𝙉𝙏 👑* ✨\n\n${cleanText}\n\n_Powered by X-Bot-MD_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD AI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *AI Internal Error:* ${error.message}`);
    }
});
