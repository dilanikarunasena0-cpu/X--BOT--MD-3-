const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow API Configuration
const API_TOKEN = "07CRv4";
const WIKI_API_URL = "https://whiteshadow-x-api.onrender.com/api/search/wikipedia-details";
const TRANSLATE_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/gemini";

/**
 * 🎯 Deep Parser for Wikipedia content structure
 */
function extractWikiContent(data) {
    if (!data) return "";
    try {
        let obj = typeof data === "string" ? JSON.parse(data) : data;
        if (obj && typeof obj === "string") obj = JSON.parse(obj);

        if (obj && obj.results && Array.isArray(obj.results) && obj.results[0]) {
            const firstResult = obj.results[0];
            return firstResult.detail?.content || firstResult.excerpt || firstResult.description || "";
        }
        if (obj && typeof obj === "object") {
            let target = obj.result || obj.description || obj.response || obj.data;
            if (typeof target === "string") return target;
        }
        return String(data);
    } catch (err) {
        return String(data);
    }
}

/**
 * 🎯 Deep Parser for Gemini Translation API Response (Bulletproof JSON Fix)
 */
function extractTranslationText(data) {
    if (!data) return "";
    try {
        let obj = typeof data === "string" ? JSON.parse(data) : data;
        
        // JSON String එකක් ඇතුලේ තව JSON එකක් තිබුනොත් (Double Encoded) ලූප් එකක් මඟින් බිඳ දැමීම
        while (typeof obj === "string") {
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
 * 📚 Professional Wikipedia Search Plugin (Always Sinhala Output Fixed)
 */
Sparky({
    name: "wiki",
    fromMe: isPublic,
    category: "search",
    desc: "Search information from Wikipedia with automatic Sinhala translation."
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
        let query = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        query = query || m.quoted?.text || "";

        if (!query) {
            return await sendMsg("📚 *X-BOT-MD WIKIPEDIA*\n\nකරුණාකර සෙවිය යුතු කරුණ ලබා දෙන්න.\n\n💡 _උදා: .wiki srilanka_");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Searching Wikipedia for_ *"${query}"*...`);

        // 🧠 Auto Language Detector
        const isQuerySinhala = /[\u0D80-\u0DFF]/.test(query);
        const searchLang = isQuerySinhala ? "si" : "en";

        // 🚀 1. Fetching Data from WhiteShadow Wikipedia API
        const apiUrl = `${WIKI_API_URL}?q=${encodeURIComponent(query)}&lang=${searchLang}&limit=1&apitoken=${API_TOKEN}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });

        let wikiResult = extractWikiContent(response.data);

        if (!wikiResult || wikiResult.trim() === "" || wikiResult.includes("[object Object]")) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Wikipedia Error:* ඒ පිළිබඳව කිසිදු තොරතුරක් සොයා ගැනීමට නොහැකි විය. කරුණාකර වෙනත් වචනයක් උත්සාහ කරන්න.");
        }

        // 🚀 2. DEEP SINHALA TRANSLATION SYSTEM
        if (!isQuerySinhala) {
            try {
                await sendMsg("🔤 _Translating content into Sinhala..._");
                
                // API එක පැටලෙන්නේ නැති වෙන්න සරලව සිංහලට හරවන්න කියා ඉල්ලීම
                const translatePrompt = `පහත සඳහන් ඉංග්‍රීසි විස්තරය ඉතා පැහැදිලි සිංහල භාෂාවට පරිවර්තනය කර දෙන්න:\n\n${wikiResult}`;
                
                const translationRes = await axios.get(`${TRANSLATE_API_URL}?q=${encodeURIComponent(translatePrompt)}&apitoken=${API_TOKEN}`, { timeout: 30000 });
                
                // Deep Translation Parser එක භාවිතයෙන් සැබෑ සිංහල Text එක පමණක් ගැනීම
                let translatedText = extractTranslationText(translationRes.data);
                
                if (translatedText && typeof translatedText === "string" && translatedText.trim() !== "" && !translatedText.toLowerCase().includes("whiteshadow")) {
                    wikiResult = translatedText;
                }
            } catch (transErr) {
                console.error("[X-BOT-MD WIKI] Translation failed, using English raw data:", transErr.message);
            }
        }

        // 🛠️ WHATSAPP සඳහා පෙළ පිරිසිදු කිරීම (Hashes සහ Stars සියල්ලම ඉවත් කිරීම)
        if (wikiResult) {
            wikiResult = wikiResult.replace(/#+\s*/g, ''); // Hashes ඉවත් කිරීම
            wikiResult = wikiResult.replace(/\*\*/g, ''); // Bold Stars ඉවත් කිරීම
            wikiResult = wikiResult.replace(/^\s*\* /gm, '🔸 '); // Lists සාදා ගැනීම
            wikiResult = wikiResult.replace(/\*/g, ''); // අමතර තරු ලකුණු ඉවත් කිරීම
        }

        // Success Reaction & Sending Reply 📚
        try { if (typeof m.react === "function") await m.react("📚"); } catch {}
        
        // පිරිසිදු සිංහල අවසන් මැසේජ් එක
        const formattedResponse = `🏛️ *𝙒𝙄𝙆𝙄𝙋𝙀𝘿𝙄𝘼 𝙎𝙀𝘼𝙍𝘾𝙃 (සිංහල)* \n\n📌 *Query:* ${query}\n\n${wikiResult.trim()}\n\n_*Powered by X-Kadiya-MD*_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD WIKI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Wikipedia Internal Error:* ${error.message}`);
    }
});

