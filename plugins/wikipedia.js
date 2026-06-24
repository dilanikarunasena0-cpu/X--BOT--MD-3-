const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Wikipedia API Configuration
const API_TOKEN = "07CRv4";
const WIKI_API_URL = "https://whiteshadow-x-api.onrender.com/api/search/wikipedia-details";

/**
 * 🎯 Strict JSON Parser to extract only the real Wikipedia description text
 */
function extractWikiResponse(data) {
    if (!data) return "";

    try {
        let obj = typeof data === "string" ? JSON.parse(data) : data;

        if (obj && typeof obj === "string") {
            obj = JSON.parse(obj);
        }

        if (obj && typeof obj === "object") {
            // API එකෙන් එන දත්ත වල 'result', 'description' හෝ 'response' පරීක්ෂා කිරීම
            let target = obj.result || obj.description || obj.response || obj.data || obj;
            
            if (typeof target === "string") {
                return target;
            }
            
            if (target && typeof target === "object") {
                // සමහරවිට Array එකක් ලෙස ලැබුණහොත් පළමු ප්‍රතිඵලය ගැනීම
                if (Array.isArray(target) && target[0]) {
                    return target[0].description || target[0].text || JSON.stringify(target[0]);
                }
                return target.description || target.text || target.result || JSON.stringify(target);
            }
        }
        return String(data);
    } catch (err) {
        return String(data);
    }
}

/**
 * 📚 Professional Wikipedia Search Plugin
 */
Sparky({
    name: "wiki",
    fromMe: isPublic,
    category: "search",
    desc: "Search information from Wikipedia using WhiteShadow API."
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
            console.error("[X-BOT-MD WIKI] Reply failed:", e.message);
        }
    };

    try {
        // පරිශීලකයා ඇතුළත් කළ සෙවුම් පදය ලබා ගැනීම
        let query = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        query = query || m.quoted?.text || "";

        if (!query) {
            return await sendMsg("📚 *X-BOT-MD WIKIPEDIA*\n\nකරුණාකර සෙවිය යුතු කරුණ ලබා දෙන්න.\n\n💡 _උදා: .wiki ශ්‍රී ලංකාව_ හෝ _.wiki Albert Einstein_");
        }

        // Search Reaction 🔎
        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Searching Wikipedia for_ *"${query}"*...`);

        // 🧠 Auto Language Detector (සිංහල අකුරු ඇත්නම් lang=si, නැත්නම් lang=en)
        const isSinhala = /[\u0D80-\u0DFF]/.test(query);
        const lang = isSinhala ? "si" : "en";

        // 🚀 Fetching Data from WhiteShadow Wikipedia API
        const apiUrl = `${WIKI_API_URL}?q=${encodeURIComponent(query)}&lang=${lang}&limit=1&apitoken=${API_TOKEN}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });

        // Parser එක හරහා පිරිසිදු විස්තරය පමණක් වෙන් කර ගැනීම
        let wikiResult = extractWikiResponse(response.data);

        // 🛠️ WHATSAPP සඳහා පෙළ පිරිසිදු කිරීම (Hashes, Stars සහ වෙනත් සලකුණු ඉවත් කිරීම)
        if (wikiResult) {
            wikiResult = wikiResult.replace(/#+\s*/g, ''); // Heading Hashes ඉවත් කිරීම
            wikiResult = wikiResult.replace(/\*\*/g, ''); // Bold Stars ඉවත් කිරීම
            wikiResult = wikiResult.replace(/^\s*\* /gm, '🔸 '); // List Items සාදා ගැනීම
            wikiResult = wikiResult.replace(/\*/g, ''); // ඉතිරි තරු ලකුණු ඉවත් කිරීම
        }

        // ප්‍රතිඵලයක් නොමැති නම්
        if (!wikiResult || wikiResult.trim() === "" || wikiResult === "undefined" || wikiResult.toLowerCase().includes("object object")) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Wikipedia Error:* ඒ පිළිබඳව කිසිදු තොරතුරක් සොයා ගැනීමට නොහැකි විය. කරුණාකර වෙනත් වචනයක් උත්සාහ කරන්න.");
        }

        // Success Reaction & Sending Reply 📚
        try { if (typeof m.react === "function") await m.react("📚"); } catch {}
        
        // පිරිසිදු අවසන් මැසේජ් එක
        const formattedResponse = `🏛️ *𝙒𝙄𝙆𝙄𝙋𝙀𝘿𝙄𝘼 𝙎𝙀𝘼𝙍𝘾𝙃* 🏛️\n\n📌 *Query:* ${query}\n🌐 *Language:* ${isSinhala ? "Sinhala (si)" : "English (en)"}\n\n${wikiResult.trim()}\n\n_Powered by X-Bot-MD_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD WIKI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Wikipedia Internal Error:* ${error.message}`);
    }
});

