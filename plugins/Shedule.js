const { Sparky, isPublic } = require("../lib");
const cron = require("node-cron");

// Schedule කරපු මැසේජ් මතක තබා ගැනීමට (In-memory storage)
// Bot එක Restart වුවහොත් මේවා මැකී යන බැවින් සරලව තබා ඇත
global.scheduledJobs = global.scheduledJobs || {};

Sparky({
    name: "time",
    alias: ["sched", "sm"],
    category: "utility",
    fromMe: isPublic,
    desc: "Automated Message Scheduling System"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;
    const imageUrl = "https://files.catbox.moe/8gd2kj.jpg";

    // කිසිවක් ඇතුළත් නොකර .schedule ගැසූ විට ලැබෙන Menu එක
    if (!args || args.length === 0) {
        const menuText = `
⏰ *Message Schedule Menu*

.schedule [මිනත්තු] [පණිවිඩය]
→ දැනට සිටින Chat එකට විනාඩි ගණනකින් මැසේජ් එකක් යැවීමට
_Example: .schedule 5 Hello Team!_

.schedule [මිනත්තු] (Quote any message)
→ ඕනෑම Text, Image හෝ Video එකක් නියමිත විනාඩි ගණනකින් Forward කිරීමට

.schedule list
→ දැනට Schedule කර ඇති පණිවිඩ ලැයිස්තුව බැලීමට

---

💡 *ක්‍රියාත්මක වන ආකාරය (Format):*
* කාලය විනාඩි (Minutes) වලින් ලබා දිය යුතුය.
* පණිවිඩය සාර්ථකව යැවූ පසු ඔබට Alert එකක් ලැබෙනු ඇත.

Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎
        `;

        return client.sendMessage(m.jid, {
            image: { url: imageUrl },
            caption: menuText
        }, { quoted: m });
    }

    // 1. SCHEDULE LIST BROWSER (.schedule list)
    if (args[0] === "list") {
        const jobs = Object.keys(global.scheduledJobs).filter(key => key.startsWith(m.jid));
        if (jobs.length === 0) return m.reply("📅 දැනට මෙම Chat එක සඳහා කිසිදු පණිවිඩයක් Schedule කර නොමැත.");

        let listText = "📝 *Scheduled Messages List:*\n\n";
        jobs.forEach((jobId, index) => {
            listText += `${index + 1}. ID: \`${jobId.split("_")[1]}\` - Active 🟢\n`;
        });
        return m.reply(listText);
    }

    try {
        const minutes = parseInt(args[0]);

        if (isNaN(minutes) || minutes <= 0) {
            return m.reply("❌ කරුණාකර වලංගු විනාඩි ගණනක් ඇතුළත් කරන්න. (උදා: .schedule 10)");
        }

        // පණිවිඩය හෝ Quoted පණිවිඩය වෙන් කර ගැනීම
        let textMessage = args.slice(1).join(" ");
        
        if (!textMessage && !quoted) {
            return m.reply("❌ කරුණාකර යැවිය යුතු පණිවිඩය ඇතුළත් කරන්න හෝ පණිවිඩයක් Quote කරන්න.");
        }

        // Cron Time සකස් කිරීම (දැන් වේලාවට විනාඩි එකතු කිරීම)
        const date = new Date(Date.now() + minutes * 60000);
        const cronTime = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;

        const jobId = `${m.jid}_${Date.now()}`;
        await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });

        // Ad Context එක
        const externalAdReply = {
            title: "Automated Schedule System",
            body: "Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://whatsapp.com",
            mediaType: 1
        };

        // Cron Job එක ආරම්භ කිරීම
        global.scheduledJobs[jobId] = cron.schedule(cronTime, async () => {
            try {
                if (quoted) {
                    // බාහිර පණිවිඩයක් Quote කර ඇත්නම් එය Forward කිරීම
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
                    await client.relayMessage(m.jid, rawMessage, {});
                } else {
                    // සාමාන්‍ය Text මැසේජ් එකක් නම් Ad context එක සමඟ යැවීම
                    await client.sendMessage(m.jid, {
                        text: textMessage,
                        contextInfo: { externalAdReply }
                    });
                }

                // මැසේජ් එක ගියාට පස්සේ Notify කිරීම
                await client.sendMessage(m.jid, {
                    text: `✅ *Schedule Message Delivered!*\n\nඔබ විනාඩි ${minutes} කට පෙර සකසන ලද පණිවිඩය සාර්ථකව යවන ලදී.`
                });

            } catch (err) {
                console.error("Scheduling Error:", err);
            } finally {
                // වැඩේ ඉවර වුණාම Job එක මතකයෙන් ඉවත් කිරීම
                if (global.scheduledJobs[jobId]) {
                    global.scheduledJobs[jobId].stop();
                    delete global.scheduledJobs[jobId];
                }
            }
        });

        // Schedule වීම තහවුරු කිරීමේ පණිවිඩය
        const successText = `
╭━━━〔 SCHEDULE SUCCESS 〕━━━⬣
┃ ⏳ Time : විනාඩි ${minutes} කින්
┃ 📅 Target Chat : Current JID
┃ 👁️ Mode : Automated Trigger
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

