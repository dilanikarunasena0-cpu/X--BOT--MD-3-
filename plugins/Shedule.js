const { Sparky, isPublic } = require("../lib");
const cron = require("node-cron");

// Schedule කරපු මැසේජ් මතක තබා ගැනීමට
global.scheduledJobs = global.scheduledJobs || {};

Sparky({
    name: "time",
    alias: ["schedule", "sched", "sm"],
    category: "utility",
    fromMe: isPublic,
    desc: "Automated Message Scheduling System"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;
    const imageUrl = "https://files.catbox.moe/8gd2kj.jpg";

    // args String එකක් නම් එය Array එකක් බවට ආරක්ෂිතව පත් කර ගැනීම
    const argsArray = Array.isArray(args) ? args : (args ? args.split(" ") : []);

    // කිසිවක් ඇතුළත් නොකර .time ගැසූ විට ලැබෙන Menu එක
    if (argsArray.length === 0) {
        const menuText = `
⏰ *Advanced Message Schedule Menu*

*1. විනාඩි ක්‍රමයට (Minutes Mode):*
.time [විනාඩි] [පණිවිඩය]
_Example: .time 5 Hello_

*2. නිශ්චිත දිනය සහ වෙලාවට (Date & Time Mode):*
.time [YYYY-MM-DD]_[HH:MM] | [නම්බර්/Current] | [පණිවිඩය]
_Example: .time 2026-06-15_14:30 | current | Hi all_
_Example: .time 2026-06-15_14:30 | 9477xxxxxxx | Hi all_

*3. Quoted Media Schedule කිරීම:*
Media එකක් Quote කර .time [විනාඩි] හෝ දිනය/වෙලාව ලබා දෙන්න.

*4. ලැයිස්තුව බැලීමට:*
.time list

---
💡 *සැලකිය යුතුයි:* වෙලාව පැය 24 ක්‍රමයට (24-Hour Format) ලබා දිය යුතුය. (උදා: සවස 2:30 යනු 14:30 වේ)

Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎
        `;

        return client.sendMessage(m.jid, {
            image: { url: imageUrl },
            caption: menuText
        }, { quoted: m });
    }

    // 1. SCHEDULE LIST BROWSER (.time list)
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
        let targetJid = m.jid; // Default වෙන්නේ දැනට ඉන්න Chat එක
        let textMessage = "";
        let displayTime = "";

        const externalAdReply = {
            title: "Automated Schedule System",
            body: "Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://whatsapp.com",
            mediaType: 1
        };

        // -------------------------------------------------------------
        // ක්‍රමය A: දිනය සහ වෙලාව අනුව ක්‍රියා කිරීම
        // -------------------------------------------------------------
        if (argsArray[0].includes("_")) {
            const fullInput = argsArray.join(" ");
            const parts = fullInput.split("|").map(p => p.trim());

            if (parts.length < 2 && !quoted) {
                return m.reply("❌ වැරදි Format එකක්. කරුණාකර Format එක පරීක්ෂා කරන්න.\nඋදා: `.time 2026-06-15_14:30 | current | මැසේජ් එක`");
            }

            const dateTimeInput = parts[0]; 
            const targetInput = parts[1];   
            textMessage = parts.slice(2).join(" | "); 

            const [datePart, timePart] = dateTimeInput.split("_");
            if (!datePart || !timePart) return m.reply("❌ දිනය සහ වෙලාව නිවැරදිව ඇතුළත් කරන්න. (YYYY-MM-DD_HH:MM)");

            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute] = timePart.split(":").map(Number);

            if (!year || !month || !day || hour === undefined || minute === undefined) {
                return m.reply("❌ දිනය හෝ වෙලාව වලංගු නැත.");
            }

            // Target JID එක තීරණය කිරීම
            if (targetInput && targetInput.toLowerCase() !== "current") {
                let cleanNum = targetInput.replace(/\D/g, "");
                if (cleanNum.endsWith("@g.us")) {
                    targetJid = cleanNum;
                } else {
                    targetJid = `${cleanNum}@s.whatsapp.net`;
                }
            }

            // Cron Format එක සකසා ගැනීම
            cronTime = `${minute} ${hour} ${day} ${month} *`;
            displayTime = `${datePart} වෙලාව ${timePart} ට`;

        } 
        // -------------------------------------------------------------
        // ක්‍රමය B: සාමාන්‍ය විනාඩි ගණන අනුව ක්‍රියා කිරීම
        // -------------------------------------------------------------
        else {
            const minutes = parseInt(argsArray[0]);
            if (isNaN(minutes) || minutes <= 0) {
                return m.reply("❌ කරුණාකර වලංගු විනාඩි ගණනක් හෝ දිනය/වෙලාව ඇතුළත් කරන්න.");
            }

            textMessage = argsArray.slice(1).join(" ");
            
            const date = new Date(Date.now() + minutes * 60000);
            cronTime = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
            displayTime = `විනාඩි ${minutes} කින්`;
        }

        if (!textMessage && !quoted) {
            return m.reply("❌ කරුණාකර යැවිය යුතු පණිවිඩය ඇතුළත් කරන්න හෝ පණිවිඩයක් Quote කරන්න.");
        }

        const jobId = `${m.jid}_${Date.now()}`;
        await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });

        // Cron Job එක Register කිරීම
        global.scheduledJobs[jobId] = cron.schedule(cronTime, async () => {
            try {
                if (quoted) {
                    let rawMessage = JSON.parse(JSON.stringify(quoted.message));
                    if (rawMessage.viewOnceMessageV2) rawMessage = rawMessage.viewOnceMessageV2.message;
                    if (rawMessage.viewOnceMessage) rawMessage = rawMessage.viewOnceMessage.message;
                    if (rawMessage.ephemeralMessage) rawMessage = rawMessage.ephemeralMessage.message;

                    const msgType = Object.keys(rawMessage)[0];
                    if (rawMessage[msgType]) {
                        rawMessage[msgType].contextInfo = {
                            ...rawMessage[msgType].contextInfo,
                            externalAdReply
                        };
                    }
                    if (textMessage) {
                        if (rawMessage[msgType].caption !== undefined) rawMessage[msgType].caption = textMessage;
                    }
                    await client.relayMessage(targetJid, rawMessage, {});
                } else {
                    await client.sendMessage(targetJid, {
                        text: textMessage,
                        contextInfo: { externalAdReply }
                    });
                }

                // සාර්ථකව මැසේජ් එක ගිය පසු ඔබට (Sender) දැනුම් දීම
                await client.sendMessage(m.jid, {
                    text: `✅ *Schedule Message Delivered!*\n\nඔබ විසින් *${displayTime}* ට සකසන ලද පණිවිඩය සාර්ථකව යවන ලදී.`
                });

            } catch (err) {
                console.error("Scheduling Execution Error:", err);
            } finally {
                if (global.scheduledJobs[jobId]) {
                    global.scheduledJobs[jobId].stop();
                    delete global.scheduledJobs[jobId];
                }
            }
        });

        // තහවුරු කිරීමේ Message එක
        const successText = `
╭━━━〔 SCHEDULE SUCCESS 〕━━━⬣
┃ ⏳ Time : ${displayTime}
┃ 📅 Target : ${targetJid.split("@")[0]}
┃ 👁️ Mode : Advanced Auto-Trigger
┃ 💎 Status : Armed & Ready
╰━━━━━━━━━━━━━━━━━━⬣

Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        return client.sendMessage(m.jid, {
            image: { url: imageUrl },
            caption: successText
        }, { quoted: m });

    } catch (e) {
        console.log(e);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ Error:\n${e.message}`);
    }
});

