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

        // 🚀 API Request to create mail
        const response = await axios.get(`${TEMP_MAIL_API}?action=create&apitoken=${API_TOKEN}`, { timeout: 25000 });
        const resData = safeParseJson(response.data);

        // API ප්‍රතිඵල පිරිසිදු කර ගැනීම
        let resObj = resData?.result || resData?.data || resData;
        let generatedEmail = resObj?.email || resObj?.mail || (typeof resObj === "string" ? resObj : null);

        if (!generatedEmail || typeof generatedEmail !== "string") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සේවාදායකයෙන් තාවකාලික ඊමේල් ලිපිනයක් ලබා ගැනීමට නොහැකි විය.");
        }

        // 🧠 යූසර්ගේ සෙශන් එකට මේ ඊමේල් එක සේව් කරගන්නවා (පස්සේ ලේසියෙන් චෙක් කරන්න)
        global.mailSession[m.sender] = {
            email: generatedEmail.trim(),
            time: Date.now()
        };

        let responseText = `✨ *👑 𝙓-𝘽𝙊𝙏-发𝘿 𝙏𝙀𝙈𝙋 𝙈𝘼𝙄𝙇 👑* ✨\n\n`;
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

        // 1. යූසර් වෙනම ඊමේල් එකක් දුන්නොත් ඒක ගන්නවා, නැත්නම් සෙශන් එකේ තියෙන එක ගන්නවා
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

        // 🚀 API Request to check messages
        const response = await axios.get(`${TEMP_MAIL_API}?action=check&email=${encodeURIComponent(targetMail)}&apitoken=${API_TOKEN}`, { timeout: 25000 });
        const resData = safeParseJson(response.data);

        let messages = resData?.result || resData?.data || resData;

        // Inbox එක හිස් නම් හෝ මැසේජ් නැත්නම්
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            try { if (typeof m.react === "function") await m.react("👀"); } catch {}
            return await sendMsg(`📥 *Inbox Empty:* \`${targetMail}\` සඳහා තවමත් කිසිදු පණිවිඩයක් ලැබී නැත.`);
        }

        // ලැබුණු පණිවිඩ ලැයිස්තුව ලස්සනට සකස් කිරීම
        let inboxText = `✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝙈𝘼𝙄𝙇 𝙄𝙉𝘽𝙊𝙓 👑* ✨\n\n`;
        inboxText += `📧 *Mail:* \`${targetMail}\`\n📬 *Total Messages:* ${messages.length}\n\n`;
        inboxText += `--- --- --- --- --- --- --- ---\n\n`;

        messages.forEach((msg, idx) => {
            let from = msg.from || msg.sender || "Unknown Sender";
            let subject = msg.subject || "No Subject";
            let body = msg.text || msg.body || msg.content || "";
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
        await sendMsg(`❌ *TempMail Error:* පණිවිඩ පරීක්ෂා කිරීම අසාර්ථක විය. (${err.message})`);
    }
});

