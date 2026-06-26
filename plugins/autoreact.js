const { Sparky } = require("../lib");

// 🎭 ඔබට කැමති Reaction Emojis ලැයිස්තුව (Status එකක් දැමූ විට මෙයින් එකක් Random ලෙස තෝරා ගනී)
const STATUS_EMOJIS = ["❤️", "🔥", "🥰", "👑", "✨", "💯", "🙌", "🤩", "⚡"];

/**
 * 🚀 24-Hour WhatsApp Auto Status React System
 */
Sparky({
    on: "status", // WhatsApp Status අප්ඩේට් නිරීක්ෂණය කිරීම (Listen to Status)
    fromMe: false
}, async ({ m, client }) => {
    
    try {
        // Status එකක් ආවේ status@broadcast එකෙන්දැයි තහවුරු කර ගැනීම
        if (!m.key || m.key.remoteJid !== "status@broadcast") return;

        // දැනටමත් React කර ඇත්නම් හෝ තමන්ගේම Status එකක් නම් මඟ හැරීම
        if (m.key.fromMe) return;

        const statusSender = m.sender || m.key.participant;
        if (!statusSender) return;

        // 🧠 Emojis ලැයිස්තුවෙන් සසම්බලව (Random) එකක් තෝරා ගැනීම
        const randomEmoji = STATUS_EMOJIS[Math.floor(Math.random() * STATUS_EMOJIS.length)];

        console.log(`[STATUS REACT] New status detected from: ${statusSender}. Reacting with ${randomEmoji}`);

        // ⚡ Baileys සෘජු Message Reaction ක්‍රමවේදය (Strict & Error-Free)
        await client.sendMessage(
            "status@broadcast",
            {
                react: {
                    text: randomEmoji,
                    key: m.key // ආපු Status එකේ නියම Message Key එක
                }
            },
            { 
                // Status එක දැමූ පුද්ගලයාගේ JID එක participant ලෙස අනිවාර්යයෙන්ම යැවිය යුතුය
                participant: statusSender 
            }
        );

    } catch (error) {
        // පැය 24 පුරාම බොට් නොනැවතී වැඩ කිරීමට Errors සියල්ල සයිලන්ට්ලි බයිපාස් කිරීම
        console.error("[STATUS REACT ERROR] Silent Bypass:", error.message);
    }
});

