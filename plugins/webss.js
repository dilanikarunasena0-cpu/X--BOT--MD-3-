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
        let textInput = "";
        if (args) {
            textInput = Array.isArray(args) ? args.join(" ").trim() : String(args).trim();
        }
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg("📸 *KADIYA-X-MD WEB SCREENSHOT*\n\nකරුණාකර Screenshot එක ලබා ගත යුතු වෙබ් අඩවියේ ලිපිනය (URL) ලබා දෙන්න.\n\n💡 _උදා: .ss google.com_");
        }

        // 🔗 URL එක පිරිසිදු කර ගැනීම
        let targetUrl = textInput.match(/(https?:\/\/[^\s]+)/i)?.[0] || textInput.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = "https://" + targetUrl;
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`📸 _Capturing website screen... Please wait a moment..._`);

        const finalApiUrl = `${WEB_SS_API}?url=${encodeURIComponent(targetUrl)}&apitoken=${API_TOKEN}`;
        console.log("[KADIYA-MD WEBSS] Processing via Server Buffer:", finalApiUrl);

        // 🔥 FIX: සර්වර් එක පින්තූරෙ හදනකම් තත්පර 60ක් වෙනකම් බලා සිටීමේ (Timeout) ආරක්ෂිත ක්‍රමය
        const response = await axios({
            method: 'get',
            url: finalApiUrl,
            responseType: 'arraybuffer', // දත්ත Buffer එකක් ලෙස ලබා ගැනීම
            timeout: 60000, // තත්පර 60ක් දීමෙන් සර්වර් එකට screenshot එක හදන්න පූර්ණ කාලය ලැබේ
            headers: {
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // දත්ත ටික පිරිසිදු Node.js Buffer එකකට හැරවීම
        const imageBuffer = Buffer.from(response.data);

        // 🛡️ ලැබුණේ පින්තූරයක්ද නැත්නම් Error JSON එකක්ද කියා සයිස් එකෙන් චෙක් කිරීම (හිස් පින්තූර වැළැක්වීමට)
        if (!imageBuffer || imageBuffer.length < 1000) {
            throw new Error("වෙබ් අඩවිය ලෝඩ් කිරීමට සේවාදායකයට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
        }

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}

        // 🎬 සාර්ථකව නිපදවූ පින්තූරය WhatsApp වෙත මුදා හැරීම
        await client.sendMessage(
            m.jid,
            {
                image: imageBuffer, // 👈 දැන් යන්නේ 100% ක්ම සර්වර් එකෙන් බාගත කර අවසන් වූ සැබෑ පින්තූරයයි
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
Sparky({ name: "ss", fromMe: isPublic, category: "tools", desc: "Take a screenshot of a given website URL." }, webScreenshotDownloader);
Sparky({ name: "webss", fromMe: isPublic, category: "tools", desc: "Take a screenshot of a given website URL." }, webScreenshotDownloader);
