const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow YT APIs & Token
const API_TOKEN = "07CRv4";
const YT_SEARCH_API = "https://whiteshadow-x-api.onrender.com/api/search/yt";
const YT_DOWNLOAD_API = "https://whiteshadow-x-api.onrender.com/api/download/ytmp4"; // Exact MP4 Endpoint

/**
 * 📱 යූටියුබ් මොබයිල් (youtu.be, shorts) සහ PC ලින්ක්ස් නිවැරදිව වෙන්කර හඳුනාගන්නා ශ්‍රිතය
 */
function extractYoutubeUrl(text) {
    const regex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🎬 වීඩියෝ සෙවීම සහ HQ MP4 ලබාදීම සිදුකරන ප්‍රධාන සිස්ටම් එක
 */
async function coreVideoDownloader({ m, client, args }) {
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") {
                await m.reply(text);
            } else {
                await client.sendMessage(m.jid, { text }, { quoted: m });
            }
        } catch (e) {
            console.error("[KADIYA-MD VIDEO] Text reply failed:", e.message);
            try {
                await client.sendMessage(m.jid, { text });
            } catch (err) {
                console.error("[KADIYA-MD VIDEO] Completely failed to send text:", err.message);
            }
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg("🎬 කරුණාකර වීඩියෝවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.\n\n💡 උදා: `.video master sir` හෝ `.video <link>` හෝ `.mp4 sri lanka`");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}

        // 1. පරිශීලකයා දුන්නේ ලින්ක් එකක්ද නැත්නම් නමක්ද කියා පරික්ෂා කිරිම
        const checkedUrl = extractYoutubeUrl(textInput);
        let youtubeUrl = null;
        let videoTitle = "Kadiya-MD Video";

        if (checkedUrl) {
            // ඇතුළත් කළේ කෙලින්ම YouTube ලින්ක් එකක් නම්
            youtubeUrl = checkedUrl;
            console.log("[KADIYA-MD VIDEO] Direct YouTube Link Detected:", youtubeUrl);
            await sendMsg("🔗 _YouTube direct link detected. Fetching data from server..._");
        } else {
            // ඇතුළත් කළේ වීඩියෝවක නමක් නම් (WhiteShadow YT Search API)
            await sendMsg(`🔍 _Searching YouTube for: "${textInput}"..._`);
            console.log("[KADIYA-MD VIDEO] Searching YT for name:", textInput);

            try {
                const searchResponse = await axios.get(`${YT_SEARCH_API}?q=${encodeURIComponent(textInput)}&apitoken=${API_TOKEN}`, { timeout: 20000 });
                
                let searchData = searchResponse.data;
                while (typeof searchData === "string") {
                    searchData = JSON.parse(searchData);
                }

                let results = searchData.results || searchData.result || searchData.data || searchData;

                if (Array.isArray(results) && results.length > 0) {
                    youtubeUrl = results[0].url || results[0].link || results[0].videoUrl;
                    videoTitle = results[0].title || "YouTube Video";
                    console.log("[KADIYA-MD VIDEO] Search success. Found URL:", youtubeUrl);
                }
            } catch (searchErr) {
                console.error("[KADIYA-MD VIDEO] YT Search API Error:", searchErr.message);
            }
        }

        // යූටියුබ් ලින්ක් එකක් හොයාගන්න බැරි වුණොත්
        if (!youtubeUrl || typeof youtubeUrl === "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* වීඩියෝව සොයා ගැනීමට නොහැකි විය. කරුණාකර නම නිවැරදිව ටයිප් කරන්න.");
        }

        // 2. High-Quality MP4 ලින්ක් එක ලබාගැනීම (WhiteShadow YTMP4 API)
        await sendMsg("📥 _ _*👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥*_ Extracting High-Quality MP4 video stream..._");
        console.log(`[KADIYA-MD VIDEO] Triggering Downloader for: ${youtubeUrl}`);

        let videoDownloadUrl = null;
        let finalTitle = videoTitle;

        try {
            // මෙහිදී quality=1080 ලෙස ලබා දී ඇත (API එකෙන් උපරිම ගුණාත්මකභාවය ඔටෝ තෝරා ගනී)
            const downloadResponse = await axios.get(`${YT_DOWNLOAD_API}?url=${encodeURIComponent(youtubeUrl)}&quality=1080&apitoken=${API_TOKEN}`, { timeout: 45000 });

            let dlData = downloadResponse.data;
            while (typeof dlData === "string") {
                dlData = JSON.parse(dlData);
            }

            let resObj = dlData.result || dlData.data || dlData;

            if (resObj && typeof resObj === "object") {
                // API එකෙන් එන විවිධ Keys (download_url, url, link) සියල්ලටම ගැලපෙන සේ සැකසීම
                videoDownloadUrl = resObj.download_url || resObj.downloadUrl || resObj.url || resObj.link;
                if (resObj.title) {
                    finalTitle = resObj.title;
                }
                console.log("[KADIYA-MD VIDEO] API Download URL Success:", videoDownloadUrl);
            }
        } catch (dlErr) {
            console.error("[KADIYA-MD VIDEO] YT Download API Error:", dlErr.message);
        }

        if (!videoDownloadUrl || typeof videoDownloadUrl === "object" || !videoDownloadUrl.startsWith("http")) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සේවාදායකයේ බිඳවැටීමක් හේතුවෙන් වීඩියෝව ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}

        // 3. WhatsApp Video එකක් ලෙස යැවීම
        const cleanFileName = finalTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60) + ".mp4";

        await sendMsg(`✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ Video System* ✨\n\n📌 *Title:* ${finalTitle}\n💿 *Format:* MP4 High Quality\n🚀 *Status:* uploading via ~*👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥*~`);

        await client.sendMessage(
            m.jid,
            {
                video: { url: videoDownloadUrl.trim() },
                mimetype: "video/mp4",
                caption: `🎬 *${finalTitle}*\n\n_Powered by Kadiya-X-MD_`,
                fileName: cleanFileName
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD VIDEO] CRITICAL GLOBAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Kadiya-MD Video Internal Error:* ${globalError.message}`);
    }
}

// 🎬 Commands ලියාපදිංචි කිරීම (Commands 3ම එකම සුපිරි ක්‍රමයට වැඩ කරයි)

Sparky({
    name: "video",
    fromMe: isPublic,
    category: "youtube",
    desc: "Search and download High-Quality MP4 video via name or link."
}, coreVideoDownloader);

