const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 TikTok API Configuration
const TT_API_BASE = "https://nntech-free-tt-api.vercel.app/api/tiktok/mp4";

/**
 * 🛠️ SAFE JSON PARSER
 */
function safeParseJson(data) {
    let parsed = data;
    while (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch (e) { break; }
    }
    return parsed;
}

/**
 * 🎵 TikTok Audio Downloader Core System
 */
async function tiktokAudioDownloader({ m, client, args }) {
    const sendMsg = async (text) => {
        try { await client.sendMessage(m.jid, { text }, { quoted: m }); } catch (e) {}
    };

    try {
        // 🚀 FIX: args.join is not a function බග් එක වැළැක්වීමේ Fail-safe ක්‍රමය
        let textInput = "";
        if (args) {
            textInput = Array.isArray(args) ? args.join(" ").trim() : String(args).trim();
        }
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg("🎵 *KADIYA-X-MD TIKTOK MP3*\n\nකරුණාකර වලංගු TikTok ලින්ක් එකක් ලබා දෙන්න.\n\n💡 _උදා: .ttmp3 https://vm.tiktok.com/xxxxxx/_");
        }

        // 📌 ලින්ක් එක පිරිසිදුව වෙන් කර ගැනීම
        const match = textInput.match(/(https?:\/\/(?:vm\.tiktok\.com|vt\.tiktok\.com|v\.tiktok\.com|www\.tiktok\.com|[\w-]+\.tiktok\.com)\/[^\s?#]+)/i);
        const tiktokUrl = match ? match[0].trim() : null;

        if (!tiktokUrl) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* කරුණාකර වලංගු TikTok ලින්ක් එකක් පමණක් ලබා දෙන්න.");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg("🔗 _TikTok සබැඳිය හඳුනාගත්තා. දත්ත ලබා ගනිමින් පවතී..._");

        // 🚀 API එකට Request එක යැවීම
        const response = await axios.get(`${TT_API_BASE}?url=${encodeURIComponent(tiktokUrl)}`, { timeout: 35000 });
        const resData = safeParseJson(response.data);
        
        const resObj = resData?.result || resData?.data || resData;

        // 🎯 Keys පරීක්ෂාව
        let audioUrl = resObj?.music || resObj?.audio || resObj?.music_info?.play || resObj?.play_audio;
        let videoTitle = resObj?.title || `TikTok Audio - ${m.sender.split("@")[0]}`;

        // 🛡️ Failover: කෙලින්ම ඕඩියෝ ලින්ක් එකක් නැත්නම්, වීඩියෝ ලින්ක් එක ඕඩියෝවක් ලෙස භාවිත කිරීම
        if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.startsWith("http")) {
            audioUrl = resObj?.play || resObj?.hdplay || resObj?.url || resObj?.link;
        }

        if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.startsWith("http")) {
            throw new Error("API එකෙන් වලංගු වීඩියෝ හෝ ඕඩියෝ සබැඳියක් සොයාගත නොහැකි විය.");
        }

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg(`✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ TikTok System* ✨\n\n📌 *Title:* ${videoTitle}\n💿 *Format:* MP3 Audio\n🚀 *Status:* uploading via ~*👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥*~`);

        // arraybuffer ක්‍රමයට RAM එකට බාගත කිරීම
        const audioRes = await axios({
            method: 'get',
            url: audioUrl.trim(),
            responseType: 'arraybuffer',
            timeout: 60000
        });

        const audioBuffer = Buffer.from(audioRes.data);
        const cleanFileName = videoTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + ".mp3";

        // 🎬 WhatsApp වෙත Audio එක ලබාදීම
        await client.sendMessage(
            m.jid,
            {
                audio: audioBuffer,
                mimetype: "audio/mp4", 
                fileName: cleanFileName,
                ptt: false 
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (err) {
        console.error("[TIKTOK MP3 FIXED PLUGIN ERROR]:", err.message);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Kadiya-MD TikTok Internal Error:* ${err.message}`);
    }
}

// 🎬 Commands ලියාපදිංචි කිරීම
Sparky({
    name: "ttmp3",
    fromMe: isPublic,
    category: "download",
    desc: "Download TikTok video's background music/audio as MP3."
}, tiktokAudioDownloader);

Sparky({
    name: "ttaudio",
    fromMe: isPublic,
    category: "download",
    desc: "Download TikTok video's background music/audio as MP3."
}, tiktokAudioDownloader);
