const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 Your Exact WhiteShadow API Endpoints
const API_TOKEN = "07CRv4";
const SEARCH_API_URL = "https://whiteshadow-x-api.onrender.com/api/search/yt";
const DOWNLOAD_API_URL = "https://whiteshadow-x-api.onrender.com/api/download/yt"; 

/**
 * 📱 YouTube URL Extraction Utility
 */
function extractYoutubeUrl(text) {
    const regex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🎵 Professional MP3 Downloader Plugin (Exact Endpoint Version)
 */
Sparky({
    name: "song",
    fromMe: isPublic,
    category: "download",
    desc: "Download MP3 Songs via Exact WhiteShadow Endpoints."
}, async ({ m, client, args }) => {
    
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") await m.reply(text);
            else await client.sendMessage(m.jid, { text }, { quoted: m });
        } catch (e) {
            console.error("[X-BOT-MD SONG] Message failed:", e.message);
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg(`🎵 *X-BOT-MD SONG DOWNLOADER*\n\nකරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.\n\n💡 _උදා: .song malsara_`);
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}

        let youtubeUrl = extractYoutubeUrl(textInput);
        let mediaTitle = "X-Bot Audio";

        // 1. සින්දුවේ නම දුන්විට Exact Search API එකෙන් ලින්ක් එක සෙවීම
        if (!youtubeUrl) {
            await sendMsg(`🔍 _Searching for_ *"${textInput}"* _on YouTube..._`);
            
            try {
                const searchRes = await axios.get(`${SEARCH_API_URL}?q=${encodeURIComponent(textInput)}&apitoken=${API_TOKEN}`, { timeout: 20000 });
                
                let searchData = searchRes.data;
                while (typeof searchData === "string") {
                    searchData = JSON.parse(searchData);
                }

                // API ප්‍රතිචාරය පරීක්ෂා කර පළමු වීඩියෝ ලින්ක් එක ලබා ගැනීම
                let results = searchData.results || searchData.result || searchData.data || searchData;
                
                if (Array.isArray(results) && results.length > 0) {
                    youtubeUrl = results[0].url || results[0].link || results[0].videoUrl;
                    mediaTitle = results[0].title || mediaTitle;
                } else if (results && typeof results === "object") {
                    if (Array.isArray(results.results) && results.results[0]) {
                        youtubeUrl = results.results[0].url || results.results[0].link;
                        mediaTitle = results.results[0].title || mediaTitle;
                    } else {
                        youtubeUrl = results.url || results.link || results.videoUrl;
                        mediaTitle = results.title || mediaTitle;
                    }
                }
            } catch (searchErr) {
                console.error("[X-BOT-MD SONG] Search API failed:", searchErr.message);
            }
        }

        // සින්දුව හෝ ලින්ක් එක සොයා ගැනීමට නොහැකි වුවහොත්
        if (!youtubeUrl || typeof youtubeUrl === "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සින්දුව සොයා ගැනීමට නොහැකි විය. කරුණාකර නම නිවැරදිව ටයිප් කරන්න.");
        }

        // 2. Exact Download API එකෙන් සින්දුව බාගත කිරීම
        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg(`📥 *"${mediaTitle}"* _බාගත කරමින් පවතී. කරුණාකර රැඳී සිටින්න..._`);

        const downloadRes = await axios.get(`${DOWNLOAD_API_URL}?url=${encodeURIComponent(youtubeUrl)}&apitoken=${API_TOKEN}`, { timeout: 45000 });

        let dlData = downloadRes.data;
        while (typeof dlData === "string") {
            dlData = JSON.parse(dlData);
        }

        // API Response එක අනුව Audio/MP3 ලින්ක් එක වෙන් කර ගැනීම
        // WhiteShadow සාමාන්‍යයෙන් 'mp3', 'downloadUrl', 'url' හෝ 'result' ලෙස එවයි
        let downloadUrl = dlData?.result?.mp3 || dlData?.result?.downloadUrl || dlData?.downloadUrl || dlData?.result?.url || dlData?.url || dlData?.result;
        
        if (dlData?.result?.title) mediaTitle = dlData.result.title;
        else if (dlData?.title) mediaTitle = dlData.title;

        // බාගත කිරීමේ ලින්ක් එක නැත්නම්
        if (!downloadUrl || typeof downloadUrl === "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *API Error:* සේවාදායකයෙන් බාගත කිරීමේ ලින්ක් එක ලබා දීමට අපොහොසත් විය.");
        }

        const cleanFileName = mediaTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + `.mp3`;

        // 3. සින්දුව සෘජුවම MP3 Audio එකක් ලෙස WhatsApp වෙත යැවීම
        await sendMsg(`✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝙎𝙊𝙉𝙂 👑* ✨\n\n📌 *Title:* ${mediaTitle}\n\n🚀 _Uploading to WhatsApp..._`);

        await client.sendMessage(
            m.jid,
            {
                audio: { url: downloadUrl },
                mimetype: "audio/mpeg",
                ptt: false, // Voice note එකක් නොවන සැබෑ සින්දුවක් ලෙස යැවීමට
                fileName: cleanFileName
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[X-BOT-MD SONG] CRITICAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Song Downloader Error:* ${globalError.message}`);
    }
});

