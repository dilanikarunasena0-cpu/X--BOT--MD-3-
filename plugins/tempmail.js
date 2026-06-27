const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Temp Mail API Configuration
const API_TOKEN = "07CRv4";
const TEMP_MAIL_API = "https://whiteshadow-x-api.onrender.com/api/tools/tempmail";

// 🧠 Active User Mail Session Tracker
global.mailSession = global.mailSession || {};

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
 * 📧 1. Create Temporary Email Command (.tempmail)
 */
Sparky({
    name: "tempmail",
    fromMe: isPublic,
    category: "tools",
    desc: "Generate a temporary email address instantly."
}, async ({ m, client }) => {
    
    const sendMsg = async (text) => {
        try { await client.sendMessage(m.jid, { text }, { quoted: m }); } catch (e) {}
    };

    try {
        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg("📧 _Generating a temporary email address. Please wait..._");

        const response = await axios.get(`${TEMP_MAIL_API}?action=create&apitoken=${API_TOKEN}`, { timeout: 25000 });
        const resData = safeParseJson(response.data);

        let resObj = resData?.result || resData?.data || resData;
        let generatedEmail = resObj?.email || resObj?.mail || (typeof resObj === "string" ? resObj : null);

        if (!generatedEmail || typeof generatedEmail !== "string") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සේවාදායකයෙන් තාවකාලික ඊමේල් ලිපිනයක් ලබා ගැනීමට නොහැකි විය.");
        }

        global.mailSession[m.sender] = {
            email: generatedEmail.trim(),
            time: Date.now()
        };

        let responseText = `✨ *👑 𝙓-𝙆𝘼𝘿𝙄𝙔𝘼-𝙈𝘿 𝙏𝙀𝙈𝙋 𝙈𝘼𝙄𝙇 👑* ✨\n\n`;
        responseText += `📌 *Your Temp Mail:* \`${generatedEmail.trim()}\`\n\n`;
        responseText += `💡 *Inbox එක පරීක්ෂා කිරීමට:* \`.checkmail\` කමාන්ඩ් එක භාවිතා කරන්න.\n`;
        responseText += `_Note: මෙම ඊමේල් ලිපිනය මිනිත්තු 45ක් යනතුරු සක්‍රීයව පවතී._`;

        await sendMsg(responseText);
        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (err) {
        console.error("[KADIYA-MD TEMPMAIL CREATE ERROR]:", err.message);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *TempMail Error:* ඊමේල් එක සෑදීම අසාර්ථක විය. (${err.message})`);
    }
});

/**
 * 📥 2. Check Temporary Email Messages/Inbox (.checkmail)
 */
Sparky({
    name: "checkmail",
    fromMe: isPublic,
    category: "tools",
    desc: "Check the inbox of your generated temporary email."
}, async ({ m, client, args }) => {
    
    const sendMsg = async (text) => {
        try { await client.sendMessage(m.jid, { text }, { quoted: m }); } catch (e) {}
    };

    try {
        let inputMail = args ? args.join(" ").trim() : "";
        let targetMail = "";

        if (inputMail) {
            targetMail = inputMail;
        } else if (global.mailSession && global.mailSession[m.sender]) {
            targetMail = global.mailSession[m.sender].email;
        }

        if (!targetMail) {
            return await sendMsg("❌ *Error:* කරුණාකර මුලින්ම \`.tempmail\` කමාන්ඩ් එක මඟින් ඊමේල් එකක් සාදා ගන්න. නැතහොත් ඊමේල් ලිපිනය ඇතුළත් කරන්න.\n\n💡 _උදා: .checkmail abc@domain.com_");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Checking inbox for: \`${targetMail}\`..._`);

        // 🚀 400 FIX: API එක සමහරවිට 'email' වෙනුවට 'mail' Parameter එක ඉල්ලන නිසා අපි දෙකම සෙට් කරලා යවනවා (Multi-Parameter Safe URL)
        const encodedMail = encodeURIComponent(targetMail.trim());
        const targetRequestUrl = `${TEMP_MAIL_API}?action=check&mail=${encodedMail}&email=${encodedMail}&apitoken=${API_TOKEN}`;

        const response = await axios.get(targetRequestUrl, { timeout: 25000 });
        const resData = safeParseJson(response.data);

        let messages = resData?.result || resData?.data || resData;

        // Inbox එක හිස් නම් හෝ මැසේජ් නැත්නම් (සමහර API වලින් හිස් වුණාම {} හෝ error String එකක් එන්න පුළුවන්)
        if (!messages || !Array.isArray(messages) || messages.length === 0 || typeof messages === "string") {
            try { if (typeof m.react === "function") await m.react("👀"); } catch {}
            return await sendMsg(`📥 *Inbox Empty:* \`${targetMail}\` සඳහා තවමත් කිසිදු පණිවිඩයක් ලැබී නැත.`);
        }

        let inboxText = `✨ *👑 𝙓-𝙆𝘼𝘿𝙄𝙔𝘼-𝙈𝘿 𝙈𝘼𝙄𝙇 𝙄𝙉𝘽𝙊𝙓 👑* ✨\n\n`;
        inboxText += `📧 *Mail:* \`${targetMail}\`\n📬 *Total Messages:* ${messages.length}\n\n`;
        inboxText += `--- --- --- --- --- --- --- ---\n\n`;

        messages.forEach((msg, idx) => {
            let from = msg.from || msg.sender || msg.fromAddress || "Unknown Sender";
            let subject = msg.subject || "No Subject";
            let body = msg.text || msg.body || msg.content || msg.html || "";
            let date = msg.date || msg.time || "";

            inboxText += `📩 *[ ${idx + 1} ] From:* ${from}\n`;
            if (date) inboxText += `📅 *Date:* ${date}\n`;
            inboxText += `📌 *Subject:* ${subject}\n`;
            inboxText += `📝 *Message:* \n${body.trim()}\n\n`;
            inboxText += `--- --- --- --- --- --- --- ---\n\n`;
        });

        inboxText += `_Powered by Kadiya-X-MD_`;

        await sendMsg(inboxText);
        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (err) {
        console.error("[KADIYA-MD TEMPMAIL CHECK ERROR]:", err.message);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        
        // 400 Failover Handler: සර්වර් එකෙන් කෙලින්ම මැසේජ් නැති කතාවක් Status code එකක් විදිහට එව්වොත් ඒක Inbox Empty විදිහට පෙන්වීම
        if (err.response?.status === 400 || err.message.includes("400")) {
            return await sendMsg(`📥 *𝙄𝙉𝘽𝙊𝙓:* දැනට මෙම ඊමේල් ලිපිනය සඳහා නව පණිවිඩ කිසිවක් ලැබී නොමැත.`);
        }
        
        await sendMsg(`❌ *TempMail Error:* පණිවිඩ පරීක්ෂා කිරීම අසාර්ථක විය. (${err.message})`);
    }
});

