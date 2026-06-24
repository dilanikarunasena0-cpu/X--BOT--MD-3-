const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Gemini AI API Configuration
const API_TOKEN = "07CRv4";
const GEMINI_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/gemini";

/**
 * 🛠️ Helper function to deeply scan and find the real text inside any Object/JSON
 */
function findTextDeep(obj) {
    if (!obj) return "";
    
    // 1. String එකක් නම් කෙලින්ම බැලීම (එය JSON String එකක්ද කියාද පරීක්ෂා කරයි)
    if (typeof obj === "string") {
        try {
            const parsed = JSON.parse(obj);
            if (typeof parsed === "object") return findTextDeep(parsed);
        } catch (e) {
            return obj; // සාමාන්‍ය පිරිසිදු Text එකක් නම් රිටර්න් කරයි
        }
    }
    
    // 2. Object එකක් නම් එහි ඇති පොදු Keys පරීක්ෂා කිරීම
    if (typeof obj === "object") {
        if (obj.response && typeof obj.response === "string") return obj.response;
        if (obj.result && typeof obj.result === "string") return obj.result;
        if (obj.data && typeof obj.data === "string") return obj.data;
        
        // 3. කිසිවක් නැත්නම් Object එක පුරා ලූප් එකක් යවා String එකක් සෙවීම
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const val = obj[key];
                if (typeof val === "string" && !["model", "prompt", "status"].includes(key)) {
                    // JSON දත්ත පවතිනවාද කියා නැවත බැලීම
                    try {
                        const subParsed = JSON.parse(val);
                        if (typeof subParsed === "object") return findTextDeep(subParsed);
                    } catch (e) {}
                    return val; 
                }
                if (typeof val === "object") {
                    const deepVal = findTextDeep(val);
                    if (deepVal) return deepVal;
                }
            }
        }
    }
    return String(obj);
}

/**
 * 🤖 Professional Gemini AI Chat Plugin (Bulletproof Object Fix)
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
            return await sendMsg("🤖 *X-BOT-MD GEMINI AI*\n\nකරුණාකර AI එකෙන් ඇසීමට අවශ්‍ය ප්‍රශ්නය ලබා දෙන්න.\n\n💡 _උදා: .gemini hy_");
        }

        // Reaction: Thinking 🧠
        try { if (typeof m.react === "function") await m.react("🧠"); } catch {}

        // 🚀 Fetching Response from WhiteShadow Gemini API
        const response = await axios.get(`${GEMINI_API_URL}?q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`, { timeout: 30000 });

        // Deep Scanner එක හරහා සැබෑ Text පිළිතුර පමණක් වෙන් කර ගැනීම
        let cleanText = findTextDeep(response.data);

        // 🛠️ WHATSAPP සඳහා පෙළ පිරිසිදු කිරීම (LaTeX සහ Tables හැඩගැන්වීම)
        if (cleanText) {
            // LaTeX / Math සංකේත ඉවත් කිරීම
            cleanText = cleanText.replace(/\$[\s\S]*? text\{([\s\S]*?)\}\$/g, '$1');
            cleanText = cleanText.replace(/\$/g, '');
            
            // Markdown Tables වල ඇති අමතර ඉරි කැබලි පිරිසිදු කිරීම
            cleanText = cleanText.replace(/\|?\s*:?-+\s*:?\s*\|/g, ''); 
            cleanText = cleanText.replace(/\|/g, ' 🔹 '); 
        }

        // පිළිතුරක් නොමැති නම් හෝ වැරදි අගයක් ආවොත්
        if (!cleanText || cleanText.trim() === "" || cleanText === "undefined" || cleanText.includes("[object Object]")) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *AI Error:* සේවාදායකයෙන් නිසි පිළිතුරක් ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // Success Reaction & Sending Reply ✨
        try { if (typeof m.react === "function") await m.react("✨"); } catch {}
        
        // මනුස්සයෙකුට කියවිය හැකි ලස්සන අවසන් මැසේජ් එක
        const formattedResponse = `✨ *👑 𝙂𝙀𝙈𝙄𝙉𝙄 𝘼𝙄 𝘼𝙎𝙎𝙄𝙎𝙏𝘼𝙉𝙏 👑* ✨\n\n${cleanText.trim()}\n\n_Powered by X-Bot-MD_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD AI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *AI Internal Error:* ${error.message}`);
    }
});
