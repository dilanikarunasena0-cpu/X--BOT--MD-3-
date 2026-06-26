const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Web Scraper API Config
const API_TOKEN = "07CRv4";
const SCRAPER_API_URL = "https://whiteshadow-x-api.onrender.com/api/tools/web-scraper";

/**
 * 🔗 Extracts and validates a URL from text using an optimized regex
 */
function extractUrl(text) {
    const regex = /(https?:\/\/[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🚀 Main Professional Web Scraper Core Function
 */
async function coreWebScraper({ m, client, args }) {
    // ⏱️ 1. Execution Start Time (වේගය මැනීම ආරම්භ කිරීම)
    const startTime = Date.now();

    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") {
                await m.reply(text);
            } else {
                await client.sendMessage(m.jid, { text }, { quoted: m });
            }
        } catch (e) {
            console.error("[KADIYA-MD SCRAPER] Text reply failed:", e.message);
            try {
                await client.sendMessage(m.jid, { text });
            } catch (err) {
                console.error("[KADIYA-MD SCRAPER] Critical send failure:", err.message);
            }
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        const targetUrl = extractUrl(textInput);

        if (!targetUrl) {
            return await sendMsg(
                "❌ *Premium Web Scraper - Invalid Request*\n\n" +
                "ℹ️ _කරුණාකර වලංගු වෙබ් අඩවි ලින්ක් (URL) එකක් ලබා දෙන්න._\n\n" +
                "💡 *Example:* `.webscrape https://google.com` හෝ ලින්ක් එකකට Reply කරන්න."
            );
        }

        // Processing Actions
        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`⚡ *KADIYA-X-MD VIP SCALPER*\n\n🔍 _Scraping metadata & assets from:_ \n\`${targetUrl}\` \n\n⏳ _Please wait a moment..._`);
        console.log("[KADIYA-MD SCRAPER] Processing API for URL:", targetUrl);

        let scraperData = null;

        try {
            const response = await axios.get(`${SCRAPER_API_URL}?url=${encodeURIComponent(targetUrl)}&apitoken=${API_TOKEN}`, { timeout: 30000 });
            
            let resData = response.data;
            while (typeof resData === "string") {
                resData = JSON.parse(resData);
            }

            scraperData = resData.result || resData.data || resData;
        } catch (apiErr) {
            console.error("[KADIYA-MD SCRAPER] API Request Error:", apiErr.message);
        }

        if (!scraperData || typeof scraperData !== "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("⚠️ *Scraping Failed:* එම වෙබ් අඩවියේ දත්ත ලබා ගැනීමට අපොහොසත් විය. ලින්ක් එක නිවැරදිද නැතහොත් වෙබ් අඩවිය සක්‍රීයදැයි පරීක්ෂා කරන්න.");
        }

        // 📊 Advanced Data Extraction
        const title = scraperData.title?.trim() || "N/A";
        const description = scraperData.description?.trim() || "No description available.";
        const keywords = scraperData.keywords || "None";
        const author = scraperData.author || "Unknown";
        const ogTitle = scraperData.ogTitle || scraperData.og_title || "N/A";
        const ogDesc = scraperData.ogDescription || scraperData.og_description || "No OG description.";
        const siteImage = scraperData.image || scraperData.ogImage || scraperData.og_image || "";
        
        const totalLinks = scraperData.linksCount || scraperData.total_links || "⚡ Dynamic Content";
        const totalImages = scraperData.imagesCount || scraperData.total_images || "⚡ Dynamic Content";

        // ⏱️ 1. Speed Calculation (ගතවුණු කාලය තත්පර වලින් සෙවීම)
        const executionSpeed = ((Date.now() - startTime) / 1000).toFixed(2);

        // 🎨 VIP Layout Design
        let responseMessage = `╔════════════════════════╗\n`;
        responseMessage += `   ✨ *👑 𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿 𝙑𝙄𝙋 𝙎𝘾𝙍𝘼𝙋𝙀𝙍* ✨\n`;
        responseMessage += `╚════════════════════════╝\n\n`;
        responseMessage += `🔗 *Target URL:* ${targetUrl}\n`;
        responseMessage += `👤 *Site Author:* ${author}\n\n`;
        responseMessage += `┌─── ❖ *METADATA INFO* ❖ ───┐\n`;
        responseMessage += `📌 *Title:* ${title}\n`;
        responseMessage += `📝 *Description:* ${description}\n`;
        responseMessage += `🔑 *Keywords:* _${keywords}_\n`;
        responseMessage += `└──────────────────────────┘\n\n`;
        responseMessage += `┌─── ❖ *GRAPH GRAPH (OG)* ❖ ───┐\n`;
        responseMessage += `🌐 *OG Title:* ${ogTitle}\n`;
        responseMessage += `📄 *OG Desc:* ${ogDesc}\n`;
        responseMessage += `└──────────────────────────┘\n\n`;
        responseMessage += `┌─── ❖ *ASSETS & ANALYSIS* ❖ ───┐\n`;
        responseMessage += `📊 *Total Links Found:* ${totalLinks}\n`;
        responseMessage += `🖼️ *Total Images Found:* ${totalImages}\n`;
        responseMessage += `└──────────────────────────┘\n\n`;
        responseMessage += `⏱️ *Response Speed:* ${executionSpeed} seconds\n`;
        responseMessage += `🚀 *Engine:* _Premium Web-Scalper v2.5_\n`;
        responseMessage += `⚡ *Powered By:* ~*👑 𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿 🔥*~`;

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}

        // 🖼️ Media or Text Output Strategy
        if (siteImage && siteImage.startsWith("http")) {
            await client.sendMessage(
                m.jid,
                {
                    image: { url: siteImage },
                    caption: responseMessage
                },
                { quoted: m }
            );
        } else {
            await sendMsg(responseMessage);
        }

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD SCRAPER] CRITICAL GLOBAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *VIP Scraper Internal Error:* ${globalError.message}`);
    }
}

// 🎧 Multi-Command Registration 

Sparky({
    name: "webscrape",
    fromMe: isPublic,
    category: "tools",
    desc: "Extract advanced meta-tags, descriptions, and assets from any website link."
}, coreWebScraper);

