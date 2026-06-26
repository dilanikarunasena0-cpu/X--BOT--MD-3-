const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Cartoon API Configurations
const API_TOKEN = "07CRv4";
const CARTOON_API_BASE = "https://whiteshadow-x-api.onrender.com/api/movie/sinhalacartoo-lk";

// 🧠 තාවකාලික සෙවුම් ප්‍රතිඵල මතක තබා ගැනීමට (User Session Tracker)
global.cartoonSession = global.cartoonSession || {};

/**
 * 📥 තෝරාගත් අංකය අනුව සෘජුවම වීඩියෝව බාගත කර යවන පොදු ශ්‍රිතය
 */
async function handleCartoonDownload(m, client, selectedIndex) {
    const session = global.cartoonSession[m.sender];
    const index = selectedIndex - 1;

    if (index < 0 || index >= session.results.length) {
        return await client.sendMessage(m.jid, { text: "❌ *Invalid Number:* කරුණාකර ලැයිස්තුවේ ඇති නිවැරදි අංකයක් ලබා දෙන්න." }, { quoted: m });
    }

    const selectedCartoon = session.results[index];
    delete global.cartoonSession[m.sender]; // එක පාරක් ගත්තම සෙශන් එක මකනවා

    try { if (typeof m.react === "function") await m.react("📥"); } catch {}
    
    await client.sendMessage(m.jid, { 
        text: `📥 *"${selectedCartoon.title}"*\n\n_වීඩියෝව සේවාදායකයෙන් බාගත කරමින් පවතී. කරුණාකර රැඳී සිටින්න..._` 
    }, { quoted: m });

    try {
        // API එකෙන් ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීම
        const dlResponse = await axios.get(`${CARTOON_API_BASE}?type=download&url=${encodeURIComponent(selectedCartoon.link || selectedCartoon.url)}&apitoken=${API_TOKEN}`, { timeout: 60000 });
        
        let dlData = dlResponse.data;
        while (typeof dlData === "string") dlData = JSON.parse(dlData);

        let resObj = dlData.result || dlData.data || dlData;
        let downloadUrl = resObj?.download_url || resObj?.downloadUrl || resObj?.url || resObj?.link;

        if (!downloadUrl || typeof downloadUrl === "object" || !downloadUrl.startsWith("http")) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await client.sendMessage(m.jid, { text: "❌ *Error:* මෙම කාටූන් එක සඳහා බාගත කිරීමේ ලින්ක් එකක් සර්වර් එකෙන් ලැබුණේ නැත." }, { quoted: m });
        }

        const cleanFileName = selectedCartoon.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + ".mp4";

        // 🎬 වීඩියෝව සෘජුවම WhatsApp වෙත යැවීම
        await client.sendMessage(
            m.jid,
            {
                video: { url: downloadUrl.trim() },
                mimetype: "video/mp4",
                caption: `✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝘾𝘼𝙍𝙏𝙊𝙊𝙉 👑* ✨\n\n📌 *Title:* ${selectedCartoon.title}\n\n_Powered by Kadiya-X-MD_`,
                fileName: cleanFileName
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (dlErr) {
        console.error("[KADIYA-MD CARTOON DL ERROR]:", dlErr.message);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await client.sendMessage(m.jid, { text: `❌ *Error:* සේවාදායකයේ ඇති වූ බිඳවැටීමක් හේතුවෙන් බාගත කිරීම අසාර්ථක විය.` }, { quoted: m });
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

        // 💡 උපක්‍රමශීලී පියවර: යූසර් `.cartoon 1` ලෙස කමාන්ඩ් එක සමඟම අංකය දුන්නොත් ක්‍රියාත්මක වන කොටස
        if (textInput && !isNaN(textInput) && global.cartoonSession[m.sender]) {
            return await handleCartoonDownload(m, client, parseInt(textInput));
        }

        if (!textInput) {
            return await sendMsg("🎨 *X-BOT-MD CARTOON SYSTEM*\n\nකරුණාකර සෙවිය යුතු කාටූන් එකේ නම ලබා දෙන්න.\n\n💡 _උදා: .cartoon avatar_");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Searching sinhalacartoon.lk for: "${textInput}"..._`);

        // වෙබ් අඩවියෙන් කාටූන් සෙවීම
        const searchResponse = await axios.get(`${CARTOON_API_BASE}?type=search&q=${encodeURIComponent(textInput)}&apitoken=${API_TOKEN}`, { timeout: 20000 });
        
        let searchData = searchResponse.data;
        while (typeof searchData === "string") searchData = JSON.parse(searchData);

        let results = searchData.result || searchData.results || searchData.data;

        if (!results || !Array.isArray(results) || results.length === 0) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* ඔබ ඇතුළත් කළ නමට ගැලපෙන කිසිදු සිංහල කාටූන් එකක් හමු නොවීය.");
        }

        // පරිශීලකයාට තේරීම සඳහා ලැයිස්තුව සකස් කිරීම
        let responseText = `✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ 𝘾𝘼𝙍𝙏𝙊𝙊𝙉 𝙎𝙀𝘼𝙍𝘾𝙃* ✨\n\n🔍 ප්‍රතිඵල *"${textInput}"* සඳහා:\n\n`;
        
        results.slice(0, 15).forEach((item, i) => {
            responseText += `${i + 1}. 📌 *${item.title}*\n`;
        });

        responseText += `\n💡 *බාගත කර ගැනීමට:* මෙම මැසේජ් එකට රිප්ලයි (Reply) කර අවශ්‍ය කාටූන් එකෙහි *අංකය පමණක්* යවන්න. (උදා: 1)`;

        // යූසර්ගේ සෙවුම් දත්ත සෙශන් එකක තාවකාලිකව සේව් කිරීම
        global.cartoonSession[m.sender] = {
            results: results.slice(0, 15),
            time: Date.now()
        };

        await sendMsg(responseText);
        try { if (typeof m.react === "function") await m.react("👀"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD CARTOON] CRITICAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Internal Error:* ${globalError.message}`);
    }
});


/**
 * 🧠 2. සැබෑ මැජික් එක: කිසිම කමාන්ඩ් එකක් නැතිව කෙලින්ම අංකය විතරක් රිප්ලයි කළවිට ක්‍රියාත්මක වන කොටස (Context Listener)
 */
Sparky({
    on: "text", // චැට් එකට එන ඕනෑම සාමාන්‍ය මැසේජ් එකක් කියවීම
    fromMe: false
}, async ({ m, client }) => {
    try {
        // යූසර්ට දැනටමත් සක්‍රීය කාටූන් සෙශන් එකක් තිබේදැයි බැලීම
        if (!global.cartoonSession || !global.cartoonSession[m.sender]) return;

        // මැසේජ් එක පිරිසිදු අංකයක්දැයි බැලීම
        const replyText = m.body ? m.body.trim() : "";
        if (!replyText || isNaN(replyText)) return;

        const selectedNumber = parseInt(replyText);
        
        // සෙශන් එක මිනිත්තු 5කට වඩා පැරණි නම් එය මකා දැමීම (Memory Leak වැළැක්වීමට)
        if (Date.now() - global.cartoonSession[m.sender].time > 300000) {
            delete global.cartoonSession[m.sender];
            return;
        }

        // සියල්ල හරි නම් ඩවුන්ලෝඩ් ක්‍රියාවලිය ස්ටාර්ට් කිරීම
        await handleCartoonDownload(m, client, selectedNumber);

    } catch (err) {
        console.error("[CARTOON LISTENER ERROR]:", err.message);
    }
});

