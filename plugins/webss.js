const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow API Configuration
const API_TOKEN = "07CRv4";
const WEB_SS_API = "https://whiteshadow-x-api.onrender.com/api/tools/webss";

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
 * 🌐 ඕනෑම වෙබ් අඩවියක සජීවී Screenshot එකක් ලබාදෙන ප්‍රධාන පද්ධතිය
 */
async function webScreenshotDownloader({ m, client, args }) {
    
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            await client.sendMessage(m.jid, { text }, { quoted: m });
        } catch (e) {
            console.error("[KADIYA-MD WEBSS] Text reply failed:", e.message);
        }
    };

    try {
        // 🚀 args.join බග් එක වැළැක්වීමේ Fail-safe පියවර
        let textInput = "";
        if (args) {
            textInput = Array.isArray(args) ? args.join(" ").trim() : String(args).trim();
        }
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg("📸 *KADIYA-X-MD WEB SCREENSHOT*\n\nකරුණාකර Screenshot එක ලබා ගත යුතු වෙබ් අඩවියේ ලිපිනය (URL) ලබා දෙන්න.\n\n💡 _උදා: .ss google.com_");
        }

        // 🔗 URL එක පිරිසිදු කර ගැනීම සහ http/https අඩුපාඩු සකස් කිරීම
        let targetUrl = textInput.match(/(https?:\/\/[^\s]+)/i)?.[0] || textInput.trim();
        
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = "https://" + targetUrl;
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`📸 _Capturing screenshot for: ${targetUrl}..._`);

        console.log("[KADIYA-MD WEBSS] Requesting SS for URL:", targetUrl);

        // 🚀 WhiteShadow API එකට Request එක යැවීම
        const response = await axios.get(`${WEB_SS_API}?url=${encodeURIComponent(targetUrl)}&apitoken=${API_TOKEN}`, { timeout: 35000 });
        const resData = safeParseJson(response.data);

        let resObj = resData?.result || resData?.data || resData;

        // API එකෙන් එන Image URL එක හෝ direct link එක වෙන් කර ගැනීම
        let screenshotImageUrl = resObj?.url || resObj?.link || resObj?.image || (typeof resObj === "string" && resObj.startsWith("http") ? resObj : null);

        if (!screenshotImageUrl || typeof screenshotImageUrl !== "string" || !screenshotImageUrl.startsWith("http")) {
            throw new Error("සේවාදායකයෙන් පින්තූර සබැඳිය (Image URL) වෙන් කර ගැනීමට නොහැකි විය.");
        }

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}

        // 🚀 Image එක arraybuffer ක්‍රමයට RAM එකට බාගත කිරීම (ENOENT ෆයිල් ලිපින බග් එක 100% වළකයි)
        const imageRes = await axios({
            method: 'get',
            url: screenshotImageUrl.trim(),
            responseType: 'arraybuffer',
            timeout: 45000
        });

        const imageBuffer = Buffer.from(imageRes.data);

        // 🎬 WhatsApp වෙත පින්තූරය (Screenshot) ලබාදීම
        await client.sendMessage(
            m.jid,
            {
                image: imageBuffer,
                caption: `📸 *Web Screenshot System*\n\n🌐 *Site:* ${targetUrl}\n\n_Powered by Kadiya-X-MD_`
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD WEBSS] CRITICAL GLOBAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Kadiya-MD Screenshot Internal Error:* ${globalError.message}`);
    }
}

// 🎬 Commands ලියාපදිංචි කිරීම (කමාන්ඩ්ස් 2ම එකම සුපිරි ක්‍රමයට වැඩ කරයි)

Sparky({
    name: "ss",
    fromMe: isPublic,
    category: "tools",
    desc: "Take a screenshot of a given website URL."
}, webScreenshotDownloader);

Sparky({
    name: "webss",
    fromMe: isPublic,
    category: "tools",
    desc: "Take a screenshot of a given website URL."
}, webScreenshotDownloader);

