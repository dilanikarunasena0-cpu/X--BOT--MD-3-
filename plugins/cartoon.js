const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Cartoon API Configurations
const API_TOKEN = "07CRv4";
const CARTOON_API_BASE = "https://whiteshadow-x-api.onrender.com/api/movie/sinhalacartoo-lk";

// 🧠 User Session Tracker
global.cartoonSession = global.cartoonSession || {};

/**
 * 🛠️ JSON PARSER
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
 * 🔗 URL NORMALIZER & CLEANER
 */
function cleanAndEncodeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    let decodedUrl = rawUrl.trim();
    try {
        while (decodedUrl !== decodeURIComponent(decodedUrl)) {
            decodedUrl = decodeURIComponent(decodedUrl);
        }
    } catch (e) {
        decodedUrl = rawUrl.trim();
    }
    return encodeURIComponent(decodedUrl);
}

/**
 * 📥 ULTRA STABLE VIDEO DOWNLOADER & STREAMER (Fixed 'type' Parameter)
 */
async function handleCartoonDownload(m, client, selectedIndex) {
    const session = global.cartoonSession[m.sender];
    const index = selectedIndex - 1;

    if (index < 0 || index >= session.results.length) {
        return await client.sendMessage(m.jid, { text: "❌ *Invalid Number:* කරුණාකර ලැයිස්තුවේ ඇති නිවැරදි අංකයක් ලබා දෙන්න." }, { quoted: m });
    }

    const selectedCartoon = session.results[index];
    delete global.cartoonSession[m.sender]; // Session Clear

    try { if (typeof m.react === "function") await m.react("📥"); } catch {}
    
    const statusMsg = await client.sendMessage(m.jid, { 
        text: `📥 *"${selectedCartoon.title}"*\n\n_සර්වර් එකෙන් වීඩියෝ දත්ත ලබා ගනිමින් පවතී. කරුණාකර රැඳී සිටින්න..._` 
    }, { quoted: m });

    try {
        const targetUrl = selectedCartoon.link || selectedCartoon.url;
        const encodedTargetUrl = cleanAndEncodeUrl(targetUrl);

        // 🚀 FIX: 'type=download' වෙනුවට API එකට ගැළපෙන 'type=movie' ලබා දීම
        const dlResponse = await axios.get(`${CARTOON_API_BASE}?type=movie&url=${encodedTargetUrl}&apitoken=${API_TOKEN}`, { timeout: 90000 });
        
        const dlData = safeParseJson(dlResponse.data);
        
        // API ප්‍රතිඵල ඇතුළෙන් ලින්ක් එක නිවැරදිව වෙන් කර ගැනීම
        let resObj = dlData?.result || dlData?.data || dlData;
        
        // WhiteShadow Movie API එකෙන් සාමාන්‍යයෙන් එන්නේ සෘජු download_url එකක් හෝ එම්බෙඩ් ලින්ක් එකක් විය හැක
        let downloadUrl = resObj?.download_url || resObj?.downloadUrl || resObj?.url || resObj?.link || resObj?.episodes?.[0]?.url;

        if (!downloadUrl || typeof downloadUrl !== "string" || !downloadUrl.startsWith("http")) {
            throw new Error("මෙම කාටූන් එක සඳහා නියමිත වීඩියෝ ලින්ක් එකක් සේවාදායකයෙන් හමු නොවීය.");
        }

        try {
            await client.sendMessage(m.jid, { text: "🚀 _වීඩියෝ දත්ත සාර්ථකව ලැබුණා! දැන් WhatsApp වෙත අප්ලෝඩ් වෙමින් පවතී..._" }, { quoted: statusMsg });
        } catch {}

        const cleanFileName = selectedCartoon.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + ".mp4";

        // STABLE BUFFER STREAM METHOD
        const videoBufferStream = await axios({
            method: 'get',
            url: downloadUrl.trim(),
            responseType: 'stream',
            timeout: 120000
        });

        // 🎬 වීඩියෝව සාර්ථකව WhatsApp වෙත මුදා හැරීම
        await client.sendMessage(
            m.jid,
            {
                video: videoBufferStream.data,
                mimetype: "video/mp4",
                caption: `✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝘾𝘼𝙍𝙏𝙊𝙊𝙉 👑* ✨\n\n📌 *Title:* ${selectedCartoon.title}\n\n_Powered by Kadiya-X-MD_`,
                fileName: cleanFileName
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (dlErr) {
        console.error("[KADIYA-MD CARTOON CRITICAL DL ERROR]:", dlErr);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        
        await client.sendMessage(m.jid, { 
            text: `❌ *Kadiya-MD System Error:* බාගත කිරීම අසාර්ථක විය.\n💡 *හේතුව:* ${dlErr.response?.data?.message || dlErr.message || "ලින්ක් එක ලබා ගැනීමේ දෝෂයකි."}` 
        }, { quoted: m });
    }
}

/**
 * 🎨 1. ප්‍රධාන සෙවුම් කමාන්ඩ් එක (.cartoon <නම>)
 */
Sparky({
    name: "cartoon",
    fromMe: isPublic,
    category: "download",
    desc: "Search and download Sinhala dubbed cartoons."
}, async ({ m, client, args }) => {
    
    const sendMsg = async (text) => {
        try { await client.sendMessage(m.jid, { text }, { quoted: m }); } catch (e) {}
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (textInput && !isNaN(textInput) && global.cartoonSession[m.sender]) {
            return await handleCartoonDownload(m, client, parseInt(textInput));
        }

        if (!textInput) {
            return await sendMsg("🎨 *X-BOT-MD CARTOON SYSTEM*\n\nකරුණාකර සෙවිය යුතු කාටූන් එකේ නම ලබා දෙන්න.\n\n💡 _උදා: .cartoon avatar_");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Searching sinhalacartoon.lk for: "${textInput}"..._`);

        // සෙවීමේදී 'type=search' නිවැරදිව පාවිච්චි කර ඇත
        const searchResponse = await axios.get(`${CARTOON_API_BASE}?type=search&q=${encodeURIComponent(textInput)}&apitoken=${API_TOKEN}`, { timeout: 20000 });
        
        const searchData = safeParseJson(searchResponse.data);
        let results = searchData?.result || searchData?.results || searchData?.data;

        if (!results || !Array.isArray(results) || results.length === 0) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* ඔබ ඇතුළත් කළ නමට ගැලපෙන කිසිදු සිංහල කාටූන් එකක් හමු නොවීය.");
        }

        let responseText = `✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ 𝘾𝘼𝙍𝙏𝙊𝙊𝙉 𝙎𝙀𝘼𝙍𝘾𝙃* ✨\n\n🔍 ප්‍රතිඵල *"${textInput}"* සඳහා:\n\n`;
        
        results.slice(0, 15).forEach((item, i) => {
            responseText += `${i + 1}. 📌 *${item.title}*\n`;
        });

        responseText += `\n💡 *බාගත කර ගැනීමට:* මෙම මැසේජ් එකට රිප්ලයි (Reply) කර අවශ්‍ය කාටූන් එකෙහි *අංකය පමණක්* යවන්න. (උදා: 1)`;

        global.cartoonSession[m.sender] = {
            results: results.slice(0, 15),
            time: Date.now()
        };

        await sendMsg(responseText);
        try { if (typeof m.react === "function") await m.react("👀"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD CARTOON GLOBAL ERROR]:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Internal Error:* ${globalError.message}`);
    }
});


/**
 * 🧠 2. Context Listener (අංකය පමණක් රිප්ලයි කළ විට ක්‍රියාත්මක වන කොටස)
 */
Sparky({
    on: "text", 
    fromMe: false
}, async ({ m, client }) => {
    try {
        if (!global.cartoonSession || !global.cartoonSession[m.sender]) return;

        const replyText = m.body ? m.body.trim() : "";
        if (!replyText || isNaN(replyText)) return;

        const selectedNumber = parseInt(replyText);
        
        if (Date.now() - global.cartoonSession[m.sender].time > 300000) {
            delete global.cartoonSession[m.sender];
            return;
        }

        await handleCartoonDownload(m, client, selectedNumber);

    } catch (err) {
        console.error("[CARTOON LISTENER ERROR]:", err.message);
    }
});

