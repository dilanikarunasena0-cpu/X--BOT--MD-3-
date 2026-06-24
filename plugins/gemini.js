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
        // 1. මුලින්ම ආපු දත්ත String එකක් නම් එය Object එකක් කරමු
        let obj = typeof data === "string" ? JSON.parse(data) : data;

        // 2. එකම දේ තවත් String එකක් ඇතුලට දාලා එවුවොත් (Double Encoded) නැවත Parse කරමු
        if (obj && typeof obj === "string") {
            obj = JSON.parse(obj);
        }

        // 3. දැන් කෙලින්ම 'response' හෝ 'result' කියන ප්‍රධාන Key එකෙන් දත්ත ගනිමු
        if (obj && typeof obj === "object") {
            let target = obj.response || obj.result || obj.data;
            
            // යම් හෙයකින් target එකත් JSON String එකක් නම් එයත් Parse කරමු
            if (typeof target === "string") {
                try {
                    let subObj = JSON.parse(target);
                    if (subObj && subObj.response) return subObj.response;
                    if (subObj && subObj.result) return subObj.result;
                } catch (e) {
                    return target; // සාමාන්‍ය පිරිසිදු පෙළක් නම් කෙලින්ම රිටර්න් කරයි
                }
                return target;
            }
            
            // target එක දැනටමත් Object එකක් නම් එහි ඇති අගයන් බැලීම
            if (target && typeof target === "object") {
                return target.response || target.result || JSON.stringify(target);
            }
        }
        
        // කිසිවක් කරගත නොහැකි වුවහොත් සාමාන්‍ය පෙළ ලෙස හැරවීම
        return String(data);

    } catch (err) {
        // JSON Parse කිරීමට නොහැකි පිරිසිදු String එකක් නම්
        return String(data);
    }
}

/**
 * 🤖 Professional Gemini AI Chat Plugin (Strict Response Target)
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
            return await sendMsg("🤖 *X-BOT-MD GEMINI AI*\n\nකරුණාකර AI එකෙන් ඇසීමට අවශ්‍ය ප්‍රශ්නය ලබා දෙන්න.\n\n💡 _උදා: .gemini සිරිපාදය තියෙන්නේ කොහේද?_");
        }

        // Reaction: Thinking 🧠
        try { if (typeof m.react === "function") await m.react("🧠"); } catch {}

        // 🚀 Fetching Response from WhiteShadow Gemini API
        const response = await axios.get(`${GEMINI_API_URL}?q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`, { timeout: 30000 });

        // නව Strict Parser එක හරහා සැබෑ පිළිතුර පමණක් ලබා ගැනීම
        let aiResult = extractRealAIResponse(response.data);

        // 🛠️ WHATSAPP සඳහා පෙළ පිරිසිදු කිරීම (LaTeX සහ Tables හැඩගැන්වීම)
        if (aiResult) {
            // LaTeX / Math සංකේත ඉවත් කිරීම
            aiResult = aiResult.replace(/\$[\s\S]*? text\{([\s\S]*?)\}\$/g, '$1');
            aiResult = aiResult.replace(/\$/g, '');
            
            // Markdown Tables වල ඇති අමතර ඉරි කැබලි පිරිසිදු කිරීම
            aiResult = aiResult.replace(/\|?\s*:?-+\s*:?\s*\|/g, ''); 
            aiResult = aiResult.replace(/\|/g, ' 🔹 '); 
        }

        // පිළිතුරක් නොමැති නම් හෝ අනවශ්‍ය වැරදි අගයක් ආවොත්
        if (!aiResult || aiResult.trim() === "" || aiResult === "undefined" || aiResult.toLowerCase() === "whiteshadow") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *AI Error:* සේවාදායකයෙන් නිසි පිළිතුරක් ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // Success Reaction & Sending Reply ✨
        try { if (typeof m.react === "function") await m.react("✨"); } catch {}
        
        // අවසන් පිරිසිදු මැසේජ් එක
        const formattedResponse = `✨ *👑 𝙂𝙀ﻣ𝙄𝙉𝙄 𝘼𝙄 𝘼𝙎𝙎𝙄𝙎𝙏𝘼𝙉𝙏 👑* ✨\n\n${aiResult.trim()}\n\n_Powered by X-Bot-MD_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD AI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *AI Internal Error:* ${error.message}`);
    }
});

