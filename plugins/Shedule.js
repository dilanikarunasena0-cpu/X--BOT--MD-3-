const { Sparky, isPublic } = require("../lib");
let cron;
let downloadMediaMessage;

try {
    cron = require("node-cron");
    // බොට්ගේ Baileys library එකට අනුව auto-detect කරගැනීමට
    downloadMediaMessage = require("@whiskeysockets/baileys").downloadMediaMessage;
} catch (e) {
    try {
        downloadMediaMessage = require("@adiwajshing/baileys").downloadMediaMessage;
    } catch (err) {
        console.log("Baileys library not found!");
    }
}

global.scheduledJobs = global.scheduledJobs || {};

Sparky({
    name: "time",
    alias: ["schedule", "sched", "sm"],
    category: "utility",
    fromMe: isPublic,
    desc: "Automated Message Scheduling System (Safe Mode)"
}, async ({ client, m, args }) => {

    if (!cron) return m.reply("❌ 'node-cron' package එක install කර නැත. කරුණාකර 'npm i node-cron' run කරන්න.");

    const quoted = m.quoted;
    const imageUrl = "https://files.catbox.moe/8gd2kj.jpg";
    const argsArray = Array.isArray(args) ? args : (args ? args.split(" ") : []);

    if (argsArray.length === 0) {
        const menuText = `
⏰ *Fast Message Schedule Menu*

*⚡ Format:*
.time [YYYY.MM.DD] [HH:MM] [නම්බර්/current] [පණිවිඩය]

_Examples:_
→ .time 2026.06.09 18:30 94763353368 Hi check this
→ .time 2026.06.09 18:30 current Hi all

*📋 ලැයිස්තුව බැලීමට:*
.time list
        `;
        return client.sendMessage(m.jid, { image: { url: imageUrl }, caption: menuText }, { quoted: m });
    }

    if (argsArray[0] === "list") {
        const jobs = Object.keys(global.scheduledJobs).filter(key => key.startsWith(m.jid));
        if (jobs.length === 0) return m.reply("📅 දැනට මෙම Chat එක සඳහා කිසිදු පණිවිඩයක් Schedule කර නොමැත.");

        let listText = "📝 *Scheduled Messages List:*\n\n";
        jobs.forEach((jobId, index) => {
            listText += `${index + 1}. ID: \`${jobId.split("_")[1]}\` - Active 🟢\n`;
        });
        return m.reply(listText);
    }

    try {
        let cronTime;
        let targetJid = m.jid; 
        let textMessage = "";
        let displayTime = "";

        const externalAdReply = {
            title: "Automated Schedule System",
            body: "Powered by ❖Ƭʜᴇ 𝐗-ΚΑΔΙΥΑ-ΜΔ 💎",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://whatsapp.com",
            mediaType: 1
        };

        if (argsArray.length < 3 && !quoted) {
            return m.reply("❌ වැරදි Format එකක්. උදා: `.time 2026.06.09 17:45 94763353368 ඔයාගේ මැසේජ් එක`");
        }

        const dateInput = argsArray[0]; 
        const timeInput = argsArray[1]; 
        const targetInput = argsArray[2]; 
        
        textMessage = argsArray.slice(3).join(" "); 

        const [year, month, day] = dateInput.split(".").map(Number);
        const [hour, minute] = timeInput.split(":").map(Number);

        if (!year || !month || !day || hour === undefined || minute === undefined) {
            return m.reply("❌ දිනය හෝ වෙලාව වලංගು නැත. (නිවැරදි ක්‍රමය: YYYY.MM.DD HH:MM)");
        }

        if (targetInput && targetInput.toLowerCase() !== "current") {
            let cleanNum = targetInput.replace(/\D/g, "");
            if (targetInput.endsWith("@g.us")) {
                targetJid = targetInput.trim();
            } else {
                targetJid = `${cleanNum}@s.whatsapp.net`;
            }
        }

        cronTime = `${minute} ${hour} ${day} ${month} *`;
        displayTime = `${dateInput} දින වෙලාව ${timeInput} ට`;

        if (!textMessage && !quoted) {
            return m.reply("❌ කරුණාකර යැවිය යුතු පණිවිඩය ඇතුළත් කරන්න.");
        }

        let mediaBuffer = null;
        let mediaType = null;
        
        if (quoted && quoted.message && downloadMediaMessage) {
            const msgKeys = Object.keys(quoted.message);
            const type = msgKeys.find(key => key.includes("Message") || key.includes("Document") || key.includes("Audio") || key.includes("Video") || key.includes("Image"));
            if (type) {
                try {
                    mediaBuffer = await downloadMediaMessage(m.quoted, "buffer", {}, { logger: console });
                    mediaType = type.replace("Message", "").toLowerCase();
                } catch (err) {
                    console.log("Media download error: ", err);
                }
            }
        }

        const jobId = `${m.jid}_${Date.now()}`;
        await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });

        global.scheduledJobs[jobId] = cron.schedule(cronTime, async () => {
            try {
                if (mediaBuffer && mediaType) {
                    let sendOptions = {};
                    let finalCaption = textMessage || m.quoted.caption || m.quoted.text || "";

                    if (mediaType === "image") sendOptions = { image: mediaBuffer, caption: finalCaption, contextInfo: { externalAdReply } };
                    else if (mediaType === "video") sendOptions = { video: mediaBuffer, caption: finalCaption, contextInfo: { externalAdReply } };
                    else if (mediaType === "audio") sendOptions = { audio: mediaBuffer, ptt: m.quoted.ptt || false, contextInfo: { externalAdReply } };
                    else if (mediaType === "document") sendOptions = { document: mediaBuffer, mimetype: m.quoted.mimetype, fileName: m.quoted.fileName || "document", caption: finalCaption, contextInfo: { externalAdReply } };
                    
                    if (Object.keys(sendOptions).length > 0) {
                        await client.sendMessage(targetJid, sendOptions);
                    }
                } else {
                    await client.sendMessage(targetJid, {
                        text: textMessage,
                        contextInfo: { externalAdReply }
                    });
                }

                await client.sendMessage(m.jid, {
                    text: `✅ *Schedule Message Delivered!*\n\nඔබ විසින් *${displayTime}* ට සකසන ලද පණිවිඩය සාර්ථකව ලැබී ඇත.`
                });

            } catch (err) {
                console.error("Scheduling Execution Error:", err);
            } finally {
                if (global.scheduledJobs[jobId]) {
                    global.scheduledJobs[jobId].stop();
                    delete global.scheduledJobs[jobId];
                }
            }
        }, {
            scheduled: true,
            timezone: "Asia/Colombo"
        });

        const successText = `
╭━━━〔 SCHEDULE SUCCESS 〕━━━⬣
┃ ⏳ Time : ${displayTime}
┃ 📅 Target : ${targetJid.split("@")[0]}
┃ 💎 Status : Armed & Ready
╰━━━━━━━━━━━━━━━━━━⬣`;

        return client.sendMessage(m.jid, { image: { url: imageUrl }, caption: successText }, { quoted: m });

    } catch (e) {
        console.log(e);
        return m.reply(`❌ Error: ${e.message}`);
    }
});

