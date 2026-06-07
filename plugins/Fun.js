const { Sparky, isPublic } = require("../lib");

const questions = [
    { q: "ලංකාවේ අගනුවර මොකක්ද?", a: ["colombo", "කොළඹ", "sri jayawardenepura", "ශ්‍රී ජයවර්ධනපුර"] },
    { q: "1 + 1 x 0 = කීයද?", a: ["1", "one"] },
    { q: "පාට 7ක් තියෙන දෙයක් මොකක්ද?", a: ["rainbow", "දේදුන්න", "indradhanushaya"] },
    { q: "අතක් නෑ පායක් නෑ, පන තියෙනවා... මොකක්ද?", a: ["fish", "මාලුවා", "මාළු"] },
    { q: "ලෝකේ උසම කන්ද මොකක්ද?", a: ["everest", "එවරස්ට්"] }
];

const pendingUsers = new Map(); // join වෙනකම් wait කරන users

// උඹේ group link එක මෙතන දාපන්
const GROUP_LINK = "https://chat.whatsapp.com/HiN8XDhsKCoGVie6s1YbqR?s=cl&p=a&mlu=3";
const GROUP_ID = "120363416124042671@g.us"; // group ID එක. පහත කියන විදිහට ගන්න

Sparky({
    name: "fun",
    alias: ["games", "game"],
    category: "fun",
    fromMe: isPublic,
    desc: "Group එකට join වෙලා quiz ගහන්න"
}, async ({ client, m }) => {
    const isGroup = m.jid.endsWith("@g.us");

    // Group එක ඇතුලේ.fun ගැහුවොත් quiz එක එවනවා
    if (isGroup) {
        const gameId = m.jid + m.sender;
        const q = questions[Math.floor(Math.random() * questions.length)];
        pendingUsers.set(gameId, { type: "quiz", answer: q.a, time: Date.now() });

        await client.sendMessage(m.jid, {
            text: `*🎮 QUIZ TIME!* 🎮\n\n@${m.sender.split("@")[0]} ❓ ${q.q}\n\n⏱️ තත්පර 20\n📝 උත්තරේ: *.funn උඹේ උත්තරේ*`,
            mentions: [m.sender]
        }, { quoted: m });

        setTimeout(() => {
            if (pendingUsers.has(gameId)) {
                pendingUsers.delete(gameId);
                client.sendMessage(m.jid, { text: `⏰ Time's up!\n✅ හරි උත්තරේ: *${q.a[0]}*` }, { quoted: m });
            }
        }, 20000);
        return;
    }

    // Private chat එකේ.fun ගැහුවොත් link එක එවනවා + track කරනවා
    pendingUsers.set(m.sender, { waitingJoin: true, time: Date.now() });

    await m.reply(`*🎮 Quiz ගහන්න group එකට join වෙන්න* 🎮\n\n👇 මේ link එකෙන් join වෙයන්\n${GROUP_LINK}\n\nJoin උනාට පස්සේ group එක ඇතුලේ quiz එක auto එයි ✅\n⏱️ තත්පර 60ක් ඇතුලත join වෙන්න`);

    // 60s පස්සේ pending එක අයින් කරනවා
    setTimeout(() => pendingUsers.delete(m.sender), 60000);
});

// උත්තරේ check කරන command එක
Sparky({
    name: "funn",
    alias: ["ans"],
    category: "fun",
    fromMe: isPublic,
}, async ({ client, m, args }) => {
    const isGroup = m.jid.endsWith("@g.us");
    if (!isGroup) return await m.reply("⚠️ Group එක ඇතුලේ විතරක් උත්තරේ දෙන්න");

    const gameId = m.jid + m.sender;
    const game = pendingUsers.get(gameId);

    if (!game || game.waitingJoin) {
        return await m.reply("⚠️ දැනට quiz එකක් නෑ..fun ගහලා අලුත් එකක් ගන්න");
    }

    const userAnswer = args.join(" ").toLowerCase().trim();
    if (game.answer.some(a => userAnswer.includes(a.toLowerCase()))) {
        pendingUsers.delete(gameId);
        await client.sendMessage(m.jid, {
            text: `🎉 සුපිරිය @${m.sender.split("@")[0]}! උඹ දින්නා! ✅\nඋත්තරේ: *${game.answer[0]}*`,
            mentions: [m.sender]
        }, { quoted: m });
    } else {
        const timeLeft = Math.max(0, Math.floor((20000 - (Date.now() - game.time))/1000));
        await m.reply(`❌ වැරදියි @${m.sender.split("@")[0]}!\n⏱️ තව ${timeLeft}s ඉතුරුයි\n.ආපහු try:.funn උත්තරේ`, { mentions: [m.sender] });
    }
});

// මේක තමයි main trick එක - user join උනාද බලන listener
Sparky({
    name: "joinlistener",
    fromMe: false,
    dontAddCommandList: true
}, async ({ client, m }) => {
    client.ev.on("group-participants.update", async (update) => {
        // කවුරුහරි join උනාද බලනවා
        if (update.action === "add" && update.id === GROUP_ID) {
            for (const user of update.participants) {
                // pending list එකේ ඉන්න user කෙනෙක්ද බලනවා
                if (pendingUsers.has(user) && pendingUsers.get(user).waitingJoin) {
                    pendingUsers.delete(user);

                    // 2s delay දාලා group එකට quiz යවනවා
                    setTimeout(async () => {
                        const q = questions[Math.floor(Math.random() * questions.length)];
                        const gameId = GROUP_ID + user;
                        pendingUsers.set(gameId, { type: "quiz", answer: q.a, time: Date.now() });

                        await client.sendMessage(GROUP_ID, {
                            text: `🎉 Welcome @${user.split("@")[0]}! Group එකට join උනාට ස්තූතියි ✅\n\n*🎮 QUIZ TIME!*\n❓ ${q.q}\n\n⏱️ තත්පර 20\n📝 උත්තරේ: *.funn උඹේ උත්තරේ*`,
                            mentions: [user]
                        });
                    }, 2000);
                }
            }
        }
    });
});
