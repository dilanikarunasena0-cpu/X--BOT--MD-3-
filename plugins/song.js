const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 Professional Free Public API Endpoint
const API_BASE_URL = "https://api.giftedtech.my.id/api";

/**
 * 📱 YouTube URL Extraction Utility
 */
function extractYoutubeUrl(text) {
    const regex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🎶 Professional Core Audio Downloader Function
 */
async function coreAudioDownloader({ m, client, args }) {
    
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") {
                await m.reply(text);
            } else {
                await client.sendMessage(m.jid, { text }, { quoted: m });
            }
        } catch (e) {
            console.error("[SADEW-MD] Reply failed:", e.message);
        }
    };

    try {
        // Input text එක නිවැරදිව ලබා ගැනීම
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg("🎵 *SADEW-MD MUSIC*\n\nකරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.\n\n💡 _උදා: .song master sir_");
        }

        // Reaction: Searching 🔎
        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}

        const checkedUrl = extractYoutubeUrl(textInput);
        let youtubeUrl = null;
        let songTitle = "Sadew-MD Audio";

        // 1. RESOLVING INPUT (LINK OR SEARCH)
        if (checkedUrl) {
            youtubeUrl = checkedUrl;
            await sendMsg("🔗 _YouTube Link Detected. Fetching details..._");
        } else {
            await sendMsg(`🔍 _Searching for_ *"${textInput}"* _on YouTube..._`);
            
            try {
                const searchRes = await axios.get(`${API_BASE_URL}/search/youtube?q=${encodeURIComponent(textInput)}`, { timeout: 15000 });
                
                if (searchRes.data?.status === 200 && searchRes.data?.result?.[0]) {
                    const bestResult = searchRes.data.result[0];
                    youtubeUrl = bestResult.url;
                    songTitle = bestResult.title || "YouTube Audio";
                }
            } catch (searchErr) {
                console.error("[SADEW-MD] YT Search Error:", searchErr.message);
            }
        }

        // ලින්ක් එකක් සොයා ගැනීමට නොහැකි වුවහොත්
        if (!youtubeUrl) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සින්දුව සොයා ගැනීමට නොහැකි විය. කරුණාකර නම නිවැරදිව ටයිප් කරන්න.");
        }

        // Reaction: Downloading 📥
        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg("📥 _Extracting High-Quality MP3 audio stream..._");

        // 2. FETCHING AUDIO DOWNLOAD URL
        let audioDownloadUrl = null;
        let finalTitle = songTitle;

        try {
            const downloadRes = await axios.get(`${API_BASE_URL}/download/dlmp3?url=${encodeURIComponent(youtubeUrl)}`, { timeout: 30000 });

            if (downloadRes.data?.status === 200 && downloadRes.data?.result?.download_url) {
                audioDownloadUrl = downloadRes.data.result.download_url;
                finalTitle = downloadRes.data.result.title || finalTitle;
            }
        } catch (dlErr) {
            console.error("[SADEW-MD] YT Download Error:", dlErr.message);
        }

        if (!audioDownloadUrl) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සේවාදායකයේ බිඳවැටීමක් හේතුවෙන් ඕඩියෝ එක ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // File name එක පිරිසිදු කිරීම (Special characters ඉවත් කිරීම)
        const cleanFileName = finalTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60) + ".mp3";

        // 3. SENDING AUDIO & INFOGRAPHICS
        await sendMsg(`✨ *👑 𝙎𝘼𝘿𝙀𝙒-𝙓-𝙈𝘿 𝙈𝙐𝙎𝙄𝘾 👑* ✨\n\n📌 *Title:* ${finalTitle}\n💿 *Format:* MP3 High Quality\n🚀 *Status:* Delivering to your chat...`);

        await client.sendMessage(
            m.jid,
            {
                audio: { url: audioDownloadUrl },
                mimetype: "audio/mpeg", 
                ptt: false, // Voice note එකක් ලෙස නොව සින්දුවක් ලෙසම යැවීමට
                fileName: cleanFileName
            },
            { quoted: m }
        );

        // Reaction: Success ✅
        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[SADEW-MD] CRITICAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Internal Plugin Error:* ${globalError.message}`);
    }
}

// 🎧 Command Registrations
Sparky({
    name: "song",
    fromMe: isPublic,
    category: "youtube",
    desc: "Search and download professional MP3 audio via name or link."
}, coreAudioDownloader);

Sparky({
    name: "music",
    fromMe: isPublic,
    category: "youtube",
    desc: "Search and download professional MP3 audio via name or link."
}, coreAudioDownloader);

Sparky({
    name: "yta",
    fromMe: isPublic,
    category: "youtube",
    desc: "Download YouTube audio via link directly."
}, coreAudioDownloader);

