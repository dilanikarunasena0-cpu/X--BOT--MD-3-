const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 TikTok API Configurations
const TT_API_BASE = "https://nntech-free-tt-api.vercel.app/api/tiktok/mp4";

/**
 * 📱 ටික්ටොක් ලින්ක් එක නිවැරදිව වෙන්කර හඳුනාගන්නා Regex ශ්‍රිතය
 */
function extractTikTokUrl(text) {
    const regex = /(https?:\/\/(?:vm\.tiktok\.com|vt\.tiktok\.com|v\.tiktok\.com|www\.tiktok\.com)\/[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🛠️ SAFE JSON PARSER
 */
function safeParseJson(data) {
    let parsed = data;
    while (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch (e) {
            break;
        }
    }
    return parsed;
}

/**
 * 🎵 ටික්ටොක් වීඩියෝවෙන් MP3 වෙන් කර ලබාදෙන ප්‍රධාන පද්ධතිය
 */
async function tiktokAudioDownloader({ m, client, args }) {
    
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") {
                await m.reply(text);
            } else {
                await client.sendMessage(m.jid, { text }, { quoted: m });
            }
        } catch (e) {
            console.error("[KADIYA-MD TT-MP3] Text reply failed:", e.message);
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg("🎵 කරුණාකර වලංගු TikTok වීඩියෝ ලින්ක් එකක් ලබා දෙන්න.\n\n💡 උදා: `.ttmp3 https://vm.tiktok.com/xxxxxx/` \n(නැතහොත් ටික්ටොක් ලින්ක් එකක් ඇති මැසේජ් එකකට රිප්ලයි කරන්න.)");
        }

        // 1. ටික්ටොක් ලින්ක් එකක්දැයි පරීක්ෂා කිරීම
        const checkedUrl = extractTikTokUrl(textInput);
        if (!checkedUrl) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* කරුණාකර වලංගු TikTok සබැඳියක් (Link) පමණක් ලබා දෙන්න. සෙවුම් වචන (Search words) වලංගු නොවේ.");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg("🔗 _TikTok link detected. Fetching audio data from server..._");

        console.log("[KADIYA-MD TT-MP3] Requesting API for:", checkedUrl);

        // 2. NNTech Free TT API එකට Request එක යැවීම
        const apiResponse = await axios.get(`${TT_API_BASE}?url=${encodeURIComponent(checkedUrl)}`, { timeout: 35000 });
        const resData = safeParseJson(apiResponse.data);

        // API Response එකේ හැසිරීම අනුව දත්ත වෙන් කරගැනීම
        let resObj = resData?.result || resData?.data || resData;
        
        // API එකෙන් එන Audio/Music ලින්ක් එක හඳුනා ගැනීම (music, audio, play, download_url)
        let audioDownloadUrl = resObj?.music || resObj?.audio || resObj?.music_info?.play || resObj?.play_audio || resObj?.download_url;
        let videoTitle = resObj?.title || resObj?.title_audio || `TikTok Audio - ${m.sender.split("@")[0]}`;

        if (!audioDownloadUrl || typeof audioDownloadUrl !== "string" || !audioDownloadUrl.startsWith("http")) {
            // Fallback: සමහරවිට කෙලින්ම audio එක නැතිනම් වීඩියෝ ලින්ක් එකෙන් Audio එක සෑදීමට උත්සාහ කරයි
            audioDownloadUrl = resObj?.play || resObj?.url || resObj?.link;
            if (!audioDownloadUrl) {
                throw new Error("සේවාදායකයෙන් MP3/Audio සබැඳිය වෙන් කර ගැනීමට නොහැකි විය.");
            }
        }

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg(`✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ TikTok System* ✨\n\n📌 *Title:* ${videoTitle}\n💿 *Format:* MP3 Audio\n🚀 *Status:* uploading via ~*👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥*~`);

        // 3. STABLE BUFFER STREAM METHOD (අතරමඟ බිඳවැටීම් සහ timeout 200% වළකයි)
        const audioBufferStream = await axios({
            method: 'get',
            url: audioDownloadUrl.trim(),
            responseType: 'stream',
            timeout: 60000
        });

        const cleanFileName = videoTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + ".mp3";

        // 🎬 Audio එක සාර්ථකව WhatsApp වෙත මුදා හැරීම
        await client.sendMessage(
            m.jid,
            {
                audio: audioBufferStream.data, // Live Stream Object එක කෙලින්ම පාස් කිරීම
                mimetype: "audio/mp4", // High compatibilty for mobile players
                fileName: cleanFileName,
                ptt: false // Voice note එකක් නෙවෙයි සාමාන්‍ය Audio ෆයිල් එකක් විදිහට යැවීමට
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD TT-MP3] CRITICAL GLOBAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Kadiya-MD TikTok Internal Error:* ${globalError.message}`);
    }
}

// 🎬 Commands ලියාපදිංචි කිරීම (කමාන්ඩ්ස් 2ම එකම සුපිරි ක්‍රමයට වැඩ කරයි)

Sparky({
    name: "ttmp3",
    fromMe: isPublic,
    category: "download",
    desc: "Download TikTok video's background music/audio as MP3."
}, tiktokAudioDownloader);

