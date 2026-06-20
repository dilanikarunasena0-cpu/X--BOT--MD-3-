const { Sparky, isPublic } = require("../lib");

// --- 1. HELP / MENU COMMAND ---
Sparky({
    name: "help",
    alias: ["menu"],
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu"
}, async ({ m }) => {
    try {
        const helpText = `╭━━━〔 ❖ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎 〕━━━⬣
┃
┃ 👋 Welcome to X-KADIYA-MD Bot
┃
┃ 🚀 Our Services
┃ ─────────────
┃ [1] ➜ Convert Image to URL (.tourl)
┃ [2] ➜ Chat with AI (.ai)
┃ [3] ➜ Search Songs (.song)
┃ [4] ➜ Check Bot Speed (.ping)
┃ [5] ➜ Contact Owner (.owner)
┃
┃ 💡 මෙම පණිවිඩයට අදාළ අංකය (1-5) 
┃    Reply කරන්න. කෙලින්ම ක්‍රියාත්මක වේ!
╰━━━━━━━━━━━━━━⬣`;

        await m.reply(helpText);

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});

// --- 2. PING COMMAND ---
Sparky({
    name: "ping",
    category: "main",
    fromMe: isPublic,
    desc: "Check bot speed"
}, async ({ m }) => {
    try {
        const start = new Date().getTime();
        const end = new Date().getTime();
        const responseTime = (end - start);
        await m.reply(`⚡ *Pong!* \n\nResponse Speed: *${responseTime}ms*`);
    } catch (err) {
        await m.reply("❌ Error: " + err.message);
    }
});


// --- 3. CORE REPLY LISTENER (අංකයට අදාළ FUNCTION එක ක්‍රියාත්මක කිරීම) ---
Sparky({
    on: "text",
    fromMe: isPublic
}, async (context) => { // context එක ඇතුළේ m, client, text ඔක්කොම තියෙනවා
    const { m, client } = context;
    try {
        // රිප්ලයි එකක්ද සහ ඒකේ අංකයක් තියෙද බලන්න
        if (!m.quoted || !m.text) return;
        
        // රිප්ලයි කරපු මැසේජ් එක අපේ මෙනු එකක්දැයි තහවුරු කරගන්න
        if (!m.quoted.text.includes("𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃")) return;

        const choice = m.text.trim();

        // 💡 මෙතනදී බොටා මැසේජ් එකක් යවන්නේ නැහැ. 
        // යූසර් වෙනුවට අදාළ Command එකේ නම වෙනස් කරලා Core එකටම බාර දෙනවා (Execute කරවනවා)
        if (choice === "1") {
            m.text = ".tourl";
            await client.emit("messages.upsert", { messages: [m.messages || m] });
            
        } else if (choice === "2") {
            m.text = ".ai";
            await client.emit("messages.upsert", { messages: [m.messages || m] });
            
        } else if (choice === "3") {
            m.text = ".song";
            await client.emit("messages.upsert", { messages: [m.messages || m] });
            
        } else if (choice === "4") {
            m.text = ".ping";
            await client.emit("messages.upsert", { messages: [m.messages || m] });
            
        } else if (choice === "5") {
            m.text = ".owner";
            await client.emit("messages.upsert", { messages: [m.messages || m] });
        }

    } catch (err) {
        console.error("Internal Router Error: ", err);
    }
});
