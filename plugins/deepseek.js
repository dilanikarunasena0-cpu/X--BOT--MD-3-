const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow DeepSeek V4 API Configuration
const API_TOKEN = "07CRv4";
const DEEPSEEK_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/deepseekv4";

/**
 * 🎯 Strict JSON Parser to extract only the real DeepSeek response text
 */
function extractDeepSeekResponse(data) {
    if (!data) return "";

    try {
        let obj = typeof data === "string" ? JSON.parse(data) : data;

        // Double Stringified JSON එකක් වුවහොත් එය නැවත Parse කර බිඳ දැමීම
        while (typeof obj === "string") {
            obj = JSON.parse(obj);
        }

        if (obj && typeof obj === "object") {
            // API එකෙන් එන දත්ත වල 'response', 'result' හෝ 'data' පරීක්ෂා කිරීම
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
 * 🤖 Professional DeepSeek V4 AI Chat Plugin
 */
Sparky({
    name: "deepseek",
    fromMe: isPublic,
    category: "ai",
    desc: "Chat with the advanced DeepSeek V4 Artificial Intelligence."
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
            console.error("[X-BOT-MD DEEPSEEK] Reply failed:", e.message);
        }
    };

    try {
        // Input text එක ලබා ගැනීම (Command එක සමඟ හෝ Reply මැසේජ් එකකින්)
        let query = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        query = query || m.quoted?.text || "";

        if (!query) {
            return await sendMsg("🐳 *X-BOT-MD DEEPSEEK AI*\n\nකරුණාකර AI එකෙන් ඇසීමට අවශ්‍ය ප්‍රශ්නය ලබා දෙන්න.\n\n💡 _උදා: .deepseek What is NodeJS?_");
        }

        // Reaction: Thinking 🐳
        try { if (typeof m.react === "function") await m.react("🐳"); } catch {}

        // 🚀 Fetching Response from WhiteShadow DeepSeek API
        const apiUrl = `${DEEPSEEK_API_URL}?q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`;
        const response = await axios.get(apiUrl, { timeout: 45000 });

        // Deep Parser එක හරහා සැබෑ පිළිතුර පමණක් වෙන් කර ගැනීම
        let aiResult = extractDeepSeekResponse(response.data);

        // 🛠️ WHATSAPP සඳහා පෙළ පිරිසිදු කිරීම (Hashes, Stars සහ Tables හැඩගැන්වීම)
        if (aiResult) {
            aiResult = aiResult.replace(/#+\s*/g, ''); // Heading Hashes (#) ඉවත් කිරීම
            aiResult = aiResult.replace(/\*\*/g, ''); // Bold Stars (**) ඉවත් කිරීම
            aiResult = aiResult.replace(/^\s*\* /gm, '🔸 '); // Lists සඳහා ලස්සන ඉමෝජි යෙදීම
            aiResult = aiResult.replace(/\*/g, ''); // ඉතිරි විය හැකි වෙනත් තරු ලකුණු ඉවත් කිරීම

            // LaTeX / Math සංකේත ඉවත් කිරීම
            aiResult = aiResult.replace(/\$[\s\S]*? text\{([\s\S]*?)\}\$/g, '$1');
            aiResult = aiResult.replace(/\$/g, '');
            
            // Markdown Tables පිරිසිදු කිරීම
            aiResult = aiResult.replace(/\|?\s*:?-+\s*:?\s*\|/g, ''); 
            aiResult = aiResult.replace(/\|/g, ' 🔹 '); 
        }

        // පිළිතුරක් නොමැති නම් හෝ වැරදි අගයක් ආවොත්
        if (!aiResult || aiResult.trim() === "" || aiResult === "undefined" || aiResult.toLowerCase().includes("whiteshadow")) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *AI Error:* සේවාදායකයෙන් නිසි පිළිතුරක් ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // Success Reaction & Sending Reply ✨
        try { if (typeof m.react === "function") await m.react("✨"); } catch {}
        
        // මිනිසෙකුට කියවිය හැකි පිරිසිදු අවසන් මැසේජ් එක
        const formattedResponse = `🐳 *𝘿𝙀𝙀𝙋𝙎𝙀𝙀𝙆 𝙑𝟰 𝘼𝙎𝙎context𝙄𝙎𝙏𝘼𝙉𝙏* 🐳\n\n${aiResult.trim()}\n\n_Powered by X-Bot-MD_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD DEEPSEEK] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *DeepSeek Internal Error:* ${error.message}`);
    }
});

