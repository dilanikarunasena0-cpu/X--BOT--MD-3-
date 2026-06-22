const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 Zanta-Mini Store API Configuration
const API_KEY = "zan_w8lSd1pK_t79f2pa52p";
const BASE_URL = "https://api.zanta-mini.store/api/ytdl";

/**
 * 📱 YouTube URL Extraction Utility
 */
function extractYoutubeUrl(text) {
    const regex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🚀 Core Downloader Engine (100% Zanta API Powered)
 */
async function downloadMedia(m, client, args, isVideo = false) {
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") await m.reply(text);
            else await client.sendMessage(m.jid, { text }, { quoted: m });
        } catch (e) {
            console.error("[X-BOT-MD] Message failed:", e.message);
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg(`🎵 *X-BOT-MD YOUTUBE SYSTEM*\n\nකරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.\n\n💡 _උදා: .song master sir_`);
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}

        const checkedUrl = extractYoutubeUrl(textInput);
        let youtubeUrl = null;
        let mediaTitle = isVideo ? "X-BOT-MD Video" : "X-BOT-MD Audio";

        // 1. YouTube Link එකක්ද නැත්නම් නමක්ද කියා බැලීම
        if (checkedUrl) {
            youtubeUrl = checkedUrl;
            await sendMsg("🔗 _YouTube Link Detected. Processing URL..._");
        } else {
            await sendMsg(`🔍 _Searching for_ *"${textInput}"* _on YouTube..._`);
            
            try {
                // Zanta API එකෙන්ම Search කිරීමට වෙනම සර්වර් එකක් අවශ්‍ය නැත. කෙලින්ම query එක යැවිය හැක.
                const searchApiUrl = `${BASE_URL}?apiKey=${API_KEY}&url=${encodeURIComponent(textInput)}&type=${isVideo ? "mp4" : "mp3"}&quality=${isVideo ? "360" : "128"}`;
                const searchRes = await axios.get(searchApiUrl, { timeout: 25000 });
                
                let foundUrl = searchRes.data?.result?.downloadUrl || searchRes.data?.downloadUrl || searchRes.data?.result?.url;
                if (foundUrl) {
                    youtubeUrl = textInput; // Search query එක කෙලින්ම පහත පියවරට යැවීම
                }
            } catch (searchErr) {
                console.error("[X-BOT-MD] Internal Search/Download Error:", searchErr.message);
            }
        }

        // 2. Fetching Download Link from Zanta API
        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg(`📥 _Downloading ${isVideo ? "Video (360p)" : "Audio (MP3)"} from Zanta server..._`);

        const type = isVideo ? "mp4" : "mp3";
        const quality = isVideo ? "360" : "128";
        
        const apiUrl = `${BASE_URL}?apiKey=${API_KEY}&url=${encodeURIComponent(youtubeUrl || textInput)}&type=${type}&quality=${quality}`;
        const res = await axios.get(apiUrl, { timeout: 40000 });

        let downloadUrl = res.data?.result?.downloadUrl || res.data?.downloadUrl || res.data?.result?.url;
        
        // සින්දුවේ නම API එකෙන් ගන්නා ආකාරය
        if (res.data?.result?.title) mediaTitle = res.data.result.title;
        else if (res.data?.title) mediaTitle = res.data.title;
        else mediaTitle = textInput;

        if (!downloadUrl) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සින්දුව සොයා ගැනීමට හෝ බාගත කර ගැනීමට නොහැකි විය. කරුණාකර නම නිවැරදිව ටයිප් කරන්න.");
        }

        const cleanFileName = mediaTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60) + `.${type}`;

        // 3. Sending the Media File to WhatsApp
        await sendMsg(`✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝙔𝙊𝙐𝙏𝙐𝘽𝙀 👑* ✨\n\n📌 *Title:* ${mediaTitle}\n💿 *Type:* ${type.toUpperCase()}\n🚀 *Status:* Uploading to WhatsApp...`);

        if (isVideo) {
            await client.sendMessage(
                m.jid,
                {
                    video: { url: downloadUrl },
                    mimetype: "video/mp4",
                    caption: `*📌 ${mediaTitle}*\n\n_Powered by X-Bot-MD_`,
                    fileName: cleanFileName
                },
                { quoted: m }
            );
        } else {
            await client.sendMessage(
                m.jid,
                {
                    audio: { url: downloadUrl },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: cleanFileName
                },
                { quoted: m }
            );
        }

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[X-BOT-MD] CRITICAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Internal Plugin Error:* ${globalError.message}`);
    }
}

// 🎧 Command Registrations
Sparky({
    name: "song",
    fromMe: isPublic,
    category: "youtube",
    desc: "Download YouTube Audio via Zanta API."
}, async ({ m, client, args }) => await downloadMedia(m, client, args, false));

Sparky({
    name: "music",
    fromMe: isPublic,
    category: "youtube",
    desc: "Download YouTube Audio via Zanta API."
}, async ({ m, client, args }) => await downloadMedia(m, client, args, false));

Sparky({
    name: "video",
    fromMe: isPublic,
    category: "youtube",
    desc: "Download YouTube Video via Zanta API."
}, async ({ m, client, args }) => await downloadMedia(m, client, args, true));

