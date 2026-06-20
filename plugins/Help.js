const { Sparky, isPublic } = require("../lib");
// සටහන: සමහරවිට ඔයාගේ බොට්ගේ lib එක ඇතුළේ commands run කරන function එකක් ඇති (උදා: plugins, commands)
const plugins = require("../lib/plugins") || require("../lib/commands"); 

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

// --- 2. CORE REPLY LISTENER ---
Sparky({
    on: "text",
    fromMe: isPublic
}, async (context) => {
    const { m, client, text } = context;
    try {
        // රිප්ලයි එකක්ද සහ මැසේජ් එකක් තියෙද බලන්න
        if (!m.quoted || !m.text) return;
        
        // රිප්ලයි කරපු මැසේජ් එක අපේ මෙනු එකක්දැයි තහවුරු කරගන්න
        if (!m.quoted.text.includes("𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃")) return;

        const choice = m.text.trim();
        let targetCommand = "";

        // අංකය අනුව අදාළ command එක තෝරාගැනීම
        if (choice === "1") targetCommand = "tourl";
        else if (choice === "2") targetCommand = "ai";
        else if (choice === "3") targetCommand = "song";
        else if (choice === "4") targetCommand = "ping";
        else if (choice === "5") targetCommand = "owner";

        if (targetCommand) {
            // 💡 ක්‍රමය A: Sparky වල තියෙන commands list එකෙන් අදාළ ප්ලගින් එක සොයාගෙන කෙලින්ම එහි function එක රන් කිරීම
            const cmd = Sparky.commands?.find(c => c.name === targetCommand || c.alias?.includes(targetCommand));
            
            if (cmd && typeof cmd.function === "function") {
                // යූසර් එවපු text එක වෙනස් කරලා ප්ලගින් එකේ function එක කෙලින්ම රන් කරනවා
                context.text = `.${targetCommand}`;
                m.body = `.${targetCommand}`; 
                
                await cmd.function(context, { ...context, text: `.${targetCommand}` });
            } else {
                // 💡 ක්‍රමය B: ක්‍රමය A වැඩ නොකරන්නේ නම්, Core එකට command එක parse කරන්න බල කිරීම (Fallback)
                m.text = `.${targetCommand}`;
                if (client.onMessage) {
                    await client.onMessage(m);
                }
            }
        }

    } catch (err) {
        console.error("Internal Router Error: ", err);
    }
});
