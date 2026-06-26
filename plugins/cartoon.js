const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

const API_TOKEN = "07CRv4";
const CARTOON_API_BASE = "https://whiteshadow-x-api.onrender.com/api/movie/sinhalacartoo-lk";

global.cartoonSession = global.cartoonSession || {};

/**
 * 🛠️ 404 SMART FAILOVER DOWNLOADER
 */
async function handleCartoonDownload(m, client, selectedIndex) {
    const session = global.cartoonSession[m.sender];
    const index = selectedIndex - 1;

    if (index < 0 || index >= session.results.length) {
        return await client.sendMessage(m.jid, { text: "❌ *Invalid Number.*" }, { quoted: m });
    }

    const selectedCartoon = session.results[index];
    delete global.cartoonSession[m.sender];

    try { await m.react("📥"); } catch {}
    const loadingMsg = await client.sendMessage(m.jid, { text: `📥 *"${selectedCartoon.title}"*\n\n_සර්වර් එකෙන් දත්ත ලබා ගනිමින් පවතී..._` }, { quoted: m });

    try {
        const rawUrl = selectedCartoon.link || selectedCartoon.url;
        
        // උත්සාහය 1: type=movie (ප්‍රධාන ක්‍රමය)
        let dlResponse;
        try {
            dlResponse = await axios.get(`${CARTOON_API_BASE}?type=movie&url=${encodeURIComponent(rawUrl)}&apitoken=${API_TOKEN}`, { timeout: 30000 });
        } catch (err) {
            // උත්සාහය 2: 404 ආවොත්, ඒ නමම ආයේ Search කරලා ලින්ක් එක ගන්න (Smart Failover)
            dlResponse = await axios.get(`${CARTOON_API_BASE}?type=search&q=${encodeURIComponent(selectedCartoon.title)}&apitoken=${API_TOKEN}`, { timeout: 30000 });
        }

        const dlData = dlResponse.data?.result || dlResponse.data;
        
        // සියලුම Keys පීරීම
        let videoUrl = dlData?.download_url || dlData?.url || dlData?.link || (Array.isArray(dlData) ? dlData[0]?.url : null);
        
        if (!videoUrl) {
            throw new Error("වීඩියෝ සබැඳියක් හමු නොවීය.");
        }

        // වීඩියෝව Stream කිරීම
        const videoStream = await axios({ method: 'get', url: videoUrl, responseType: 'stream', timeout: 120000 });

        await client.sendMessage(m.jid, {
            video: videoStream.data,
            mimetype: "video/mp4",
            caption: `✨ *${selectedCartoon.title}*\n_Powered by Kadiya-X-MD_`,
            fileName: selectedCartoon.title.replace(/[^a-z0-9]/gi, '_') + ".mp4"
        }, { quoted: m });

        try { await m.react("✅"); } catch {}

    } catch (err) {
        console.error("[KADIYA-MD ERROR]:", err);
        await client.sendMessage(m.jid, { text: `❌ *Error:* බාගත කිරීම අසාර්ථක විය.\n💡 *හේතුව:* ${err.message}` }, { quoted: m });
        try { await m.react("❌"); } catch {}
    }
}

/**
 * 🎨 ප්‍රධාන කමාන්ඩ්
 */
Sparky({
    name: "cartoon",
    fromMe: isPublic,
    category: "download",
    desc: "Search and download cartoons."
}, async ({ m, client, args }) => {
    let query = args ? args.join(" ") : m.quoted?.text;
    if (!query) return await client.sendMessage(m.jid, { text: "කාටූන් එකක නමක් ලබා දෙන්න." }, { quoted: m });

    try {
        await m.react("🔎");
        const res = await axios.get(`${CARTOON_API_BASE}?type=search&q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`);
        const results = res.data?.result || res.data;

        if (!results || results.length === 0) return await client.sendMessage(m.jid, { text: "කිසිවක් හමු නොවීය." }, { quoted: m });

        let msg = `🔍 *ප්‍රතිඵල:* \n\n`;
        results.slice(0, 10).forEach((item, i) => { msg += `${i + 1}. ${item.title}\n`; });
        msg += `\n💡 *අංකයක් රිප්ලයි කරන්න.*`;

        global.cartoonSession[m.sender] = { results: results.slice(0, 10), time: Date.now() };
        await client.sendMessage(m.jid, { text: msg }, { quoted: m });
    } catch (e) {
        await client.sendMessage(m.jid, { text: "Error: " + e.message }, { quoted: m });
    }
});

/**
 * 🧠 Context Listener
 */
Sparky({ on: "text", fromMe: false }, async ({ m, client }) => {
    if (global.cartoonSession[m.sender] && !isNaN(m.body) && m.body.trim()) {
        await handleCartoonDownload(m, client, parseInt(m.body.trim()));
    }
});

