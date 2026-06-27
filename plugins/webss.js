const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow API Configuration
const API_TOKEN = "07CRv4";
const WEB_SS_API = "https://whiteshadow-x-api.onrender.com/api/tools/webss";

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
        let targetUrl = textInput.match(/(https?:\/[^\s]+)/i)?.[0] || textInput.trim();
        
        // වැරදිලා https:/ වගේ වැදුනොත් සකස් කිරීම සහ මුලට https:// එකතු කිරීම
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = "https://" + targetUrl.replace(/^https?:\/+/i, "");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`📸 _Capturing screenshot for: ${targetUrl}..._`);

        console.log("[KADIYA-MD WEBSS] Requesting SS for URL:", targetUrl);

        let imageBuffer = null;

        // 🔥 FIX: API එකෙන් කෙලින්ම Image Stream එකක් ආවත්, JSON එකක් ආවත් වැඩ කරන සුපිරි ක්‍රමය
        try {
            const response = await axios({
                method: 'get',
                url: `${WEB_SS_API}?url=${encodeURIComponent(targetUrl)}&apitoken=${API_TOKEN}`,
                responseType: 'arraybuffer', // කෙලින්ම බයිනරි දත්ත ලබාගැනීම
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            // බෆර් එකක් විදිහට දත්ත වෙන් කර ගැනීම
            const tempBuffer = Buffer.from(response.data);
            
            // ලැබුණු දත්ත JSON එකක්ද කියා පරීක්ෂා කිරීම (API එකෙන් ලින්ක් එකක් එවලා තිබුණොත්)
            try {
                const strData = tempBuffer.toString('utf-8');
                if (strData.trim().startsWith('{') || strData.trim().startsWith('[')) {
                    const parsed = JSON.parse(strData);
                    const jsonRes = parsed?.result || parsed?.data || parsed;
                    const imgUrl = jsonRes?.url || jsonRes?.link || jsonRes?.image || (typeof jsonRes === "string" && jsonRes.startsWith("http") ? jsonRes : null);
                    
                    if (imgUrl) {
                        const finalRes = await axios.get(imgUrl.trim(), { responseType: 'arraybuffer', timeout: 30000 });
                        imageBuffer = Buffer.from(finalRes.data);
                    }
                }
            } catch (jsonErr) {
                // JSON එකක් නෙවෙයි නම්, කෙලින්ම ලැබුණේ පින්තූරයයි (Direct Image Stream)
            }

            // JSON එකක් නොවී කෙලින්ම පින්තූරය ආවා නම් tempBuffer එක පාවිච්චි කරයි
            if (!imageBuffer) {
                imageBuffer = tempBuffer;
            }

        } catch (apiErr) {
            throw new Error(`API Request එක අසාර්ථකයි: ${apiErr.message}`);
        }

        // ලැබුණු බෆර් එක පින්තූරයක්ද කියා අවසාන වරට තහවුරු කර ගැනීම
        if (!imageBuffer || imageBuffer.length < 100) {
            throw new Error("වලංගු පින්තූර දත්ත (Image Data) සේවාදායකයෙන් ලැබී නැත.");
        }

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}

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
        console.error("[KADIYA-MD WEBSS] CRITICAL GLOBAL ERROR:", globalError.message);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Kadiya-MD Screenshot Internal Error:* ${globalError.message}`);
    }
}

// 🎬 Commands ලියාපදිංචි කිරීම

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

