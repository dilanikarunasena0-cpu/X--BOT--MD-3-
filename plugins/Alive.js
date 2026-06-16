const replyText = (
replyMsg.message.conversation ||
replyMsg.message.extendedTextMessage?.text ||
""
).trim();

switch (replyText) {

case "1":
    await client.sendMessage(m.jid, {
        text: `🏓 *PONG!*\n\n⚡ Response Time: ${Date.now() - m.messageTimestamp * 1000}ms`
    }, { quoted: m });
    break;

case "2":
    const fakeMenu = {
        ...replyMsg,
        message: {
            conversation: `${prefix}menu`
        }
    };

    client.ev.emit("messages.upsert", {
        messages: [fakeMenu],
        type: "notify"
    });
    break;

case "3":
    await client.sendMessage(m.jid, {
        text:

`👑 OWNER INFORMATION

• Name : ${ownerName}
• Bot : ${botName}
• Version : ${config.VERSION || "1.0.0"}

📞 Contact your owner for support.`
}, { quoted: m });
break;

case "4":
    await client.sendMessage(m.jid, {
        text:

`📊 SYSTEM INFORMATION

💾 RAM : ${ramUsed} / ${ramTotal}
🧠 CPU : ${cpuInfo.name}
🚀 CPU Speed : ${cpuInfo.speed}
📦 Storage : ${storageInfo}
🌐 Network : ${networkSpeed}
🖥️ Host : ${os.hostname()}
⌛ Uptime : ${runtime(process.uptime())}`
}, { quoted: m });
break;

case "5":
    await client.sendMessage(m.jid, {
        text: "🔄 Restarting Bot..."
    }, { quoted: m });

    process.exit(1);
    break;

}
