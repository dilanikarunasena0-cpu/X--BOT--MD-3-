const { Sparky, isPublic } = require("../lib");

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
            targetUrl = "https://" + targetUrl.replace(/^https?:\/+/i, "");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`📸 _Capturing screenshot for: ${targetUrl}..._`);

        // 🎯 🛠️ DIRECT URL METHOD FIX: 
        // සර්වර් එකේ බෆර් ක්‍රෑෂ් සහ හිස් පින්තූර (Blank Placeholders) මඟහරවා ගැනීමට කෙලින්ම API සබැඳිය WhatsApp වෙත ලබාදීම.
        const finalApiImageUrl = `${WEB_SS_API}?url=${encodeURIComponent(targetUrl)}&apitoken=${API_TOKEN}`;

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}

        // 🎬 WhatsApp වෙත පින්තූරය ලබාදීම
        await client.sendMessage(
            m.jid,
            {
                image: { url: finalApiImageUrl }, // 👈 කෙලින්ම ලින්ක් එකෙන් WhatsApp එකට පින්තූරය ඇදගන්න සලස්වයි
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

