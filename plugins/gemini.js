const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Gemini AI API Configuration
const API_TOKEN = "07CRv4";
const GEMINI_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/gemini";

/**
 * 🎯 Strict JSON Parser to extract only the real AI response text
 */
function extractRealAIResponse(data) {
    if (!data) return "";

    try {
        let obj = typeof data === "string" ? JSON.parse(data) : data;

        if (obj && typeof obj === "string") {
            obj = JSON.parse(obj);
        }

        if (obj && typeof obj === "object") {
            let target = obj.response || obj.result || obj.data;
            
            if (typeof target === "string") {
                try {
                    let subObj = JSON.parse(target);
                    if (subObj && subObj.response) return subObj.response;
                    if (subObj && subObj.result) return subObj.result;
                } catch (e) {
                    return target;
                }
                return target;
            }
            
            if (target && typeof target === "object") {
                return target.response || target.result || JSON.stringify(target);
            }
        }
        return String(data);
    } catch (err) {
        return String(data);
    }
}

/**
 * 🤖 Professional Gemini AI Chat Plugin (No Markdown Hashes/Stars Version)
 */
Sparky({
    name: "gemini",
    fromMe: isPublic,
    category: "ai",
    desc: "Chat with Gemini Artificial Intelligence without markdown hashes."
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
        let query = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        query = query || m.quoted?.text || "";

        if (!query) {
            return await sendMsg("🤖 *X-BOT-MD GEMINI AI*\n\nකරුණාකර AI එකෙන් ඇසීමට අවශ්‍ය ප්‍රශ්නය ලබා දෙන්න.\n\n💡 _උදා: .gemini සිරිපාදය තියෙන්නේ කොහේද?_");
        }

        try { if (typeof m.react === "function") await m.react("🧠"); } catch {}

        // 🚀 Fetching Response from WhiteShadow Gemini API
        const response = await axios.get(`${GEMINI_API_URL}?q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`, { timeout: 30000 });

        let aiResult = extractRealAIResponse(response.data);

        // 🛠️ WHATSAPP සඳහා පෙළ පිරිසිදු කිරීම (Hashes, Stars සහ Tables හැඩගැන්වීම)
        if (aiResult) {
            // ❌ Markdown Heading ලකුණු (#, ##, ###) සම්පූර්ණයෙන්ම මකා දැමීම
            aiResult = aiResult.replace(/#+\s*/g, '');

            // ❌ අකුරු බෝල්ඩ් කිරීමට එන සියලුම තරු ලකුණු (**) සම්පූර්ණයෙන්ම මකා දැමීම
            aiResult = aiResult.replace(/\*\*/g, '');
            
            // ලැයිස්තු සඳහා එන තනි තරු ලකුණු පිරිසිදු කර ලස්සන පොයින්ට්ස් (🔸) බවට හැරවීම
            aiResult = aiResult.replace(/^\s\* /gm, '🔸 ');
            aiResult = aiResult.replace(/\*/g, ''); // ඉතිරි විය හැකි වෙනත් තරු ලකුණු ඇත්නම් ඒවාද ඉවත් කිරීම

            // LaTeX / Math සංකේත ඉවත් කිරීම
            aiResult = aiResult.replace(/\$[\s\S]*? text\{([\s\S]*?)\}\$/g, '$1');
            aiResult = aiResult.replace(/\$/g, '');
            
            // Markdown Tables වල ඇති අමතර ඉරි කැබලි පිරිසිදු කිරීම
            aiResult = aiResult.replace(/\|?\s*:?-+\s*:?\s*\|/g, ''); 
            aiResult = aiResult.replace(/\|/g, ' 🔹 '); 
        }

        if (!aiResult || aiResult.trim() === "" || aiResult === "undefined" || aiResult.toLowerCase() === "whiteshadow") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *AI Error:* සේවාදායකයෙන් නිසි පිළිතුරක් ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        try { if (typeof m.react === "function") await m.react("✨"); } catch {}
        
        // අවසන් පිරිසිදු මැසේජ් එක (Heading Hashes සහ Title typo එක නිවැරදි කර ඇත)
        const formattedResponse = `✨ *🧠 𝙂𝙀𝙈𝙄𝙉𝙄 𝘼𝙄 𝘼𝙎𝙎𝙄𝙎𝙏𝘼𝙉𝙏 🧠* ✨\n\n${aiResult.trim()}\n\n*_𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙓 𝙆𝘼𝘿𝙄𝙔𝘼 𝘽𝙊𝙏_*`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD AI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *AI Internal Error:* ${error.message}`);
    }
});

