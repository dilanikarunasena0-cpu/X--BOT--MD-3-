const { Sparky } = require("../lib");

// සර්වර් එක එක පාරක් ඔන් වෙද්දී එක පාරක් පමණක් මැසේජ් එක යැවීම තහවුරු කිරීමට
global.ownerWelcomedThisSession = global.ownerWelcomedThisSession || false;

Sparky({
    on: "text", 
    dontAddCommandList: true 
}, async ({ m, client }) => {
    try {
        // ---------------------------------------------------------------------------
        // 🛠️ CONFIGURATION (ඔයාගේ නිල ලින්ක්ස්)
        // ---------------------------------------------------------------------------
        const groupInviteCode = "HpmCR9alxYRH2xxjDonTZ1"; 
        const channelLink = "https://whatsapp.com/channel/0029Vb69K9665yDEFt3DRR0D";
        // ---------------------------------------------------------------------------

        if (!m || !client || !client.user) return;
        const myBotNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const msgBody = m.body || m.text || "";

        // 👥 1. USER FORCE FOLLOW SYSTEM (යූසර්ලාට විතරයි මේ ලොක් එක වදින්නේ)
        if (m.sender !== myBotNumber && !global.channelVerifiedUsers?.includes(m.sender)) {
            if (msgBody && (msgBody.startsWith(".") || msgBody.startsWith("!"))) {
                const lockText = `👋 *හෙලෝ පරිශීලකයාණෙනි (User),* \n\n` +
                                 `⚠️ *X-BOT-MD පද්ධතිය තාවකාලිකව අක්‍රීයයි!* \n` +
                                 `ඔබට මෙම බොට්ගේ සේවාවන් ලබා ගැනීමට නම්, අපගේ නිල WhatsApp චැනලය අනිවාර්යයෙන්ම Follow කර සිටිය යුතුය.\n\n` +
                                 `👇 පහත ඇති බැනරය ක්ලික් කර චැනලය *Follow* කර, ඉන්පසු නැවත Command එක ලබාදෙන්න.`;

                await client.sendMessage(m.chat, {
                    text: lockText,
                    contextInfo: {
                        externalAdReply: {
                            title: "❌ ACCESS DENIED - FOLLOW TO UNLOCK",
                            body: "Click here to follow our Official Channel 🔔",
                            thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe", 
                            sourceUrl: channelLink,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });

                global.channelVerifiedUsers = global.channelVerifiedUsers || [];
                global.channelVerifiedUsers.push(m.sender);
                return;
            }
        }

        // 💎 2. BACKGROUND INJECTOR FOR CONNECTION OPEN (බොටා කනෙක්ට් වුණු ගමන්ම ක්‍රියාත්මක වන කොටස)
        // මේකෙන් වෙන්නේ බොටා ඔන් වුණු ගමන්ම කාගේ හරි මැසේජ් එකක් එනකන් ඉන්නෙ නැතුව ඔයාගේ YOU එකට මැසේජ් එක දාන එකයි
        if (!global.ownerWelcomedThisSession) {
            global.ownerWelcomedThisSession = true; // එක පාරක් පමණක් රන් වීමට ලොක් කිරීම

            console.log("💎 Bot Active! Sending Welcome Card & Joining Group...");

            // (A) Auto Group Join 
            try {
                if (groupInviteCode && typeof client.groupAcceptInvite === "function") {
                    await client.groupAcceptInvite(groupInviteCode.trim());
                }
            } catch (e) {
                console.error("❌ Auto Group Join Failed:", e.message);
            }

            // (B) Sending Pro Welcome Card to Owner's YOU Chat
            let profilePic;
            try {
                profilePic = await client.profilePictureUrl(myBotNumber, "image");
            } catch {
                profilePic = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"; 
            }

            const welcomeText = `✨ *X-BOT-MD SYSTEM INITIALIZED* ✨\n\n` +
                                `👋 *හෙලෝ මචං,* \n` +
                                `ඔයා අපේ නිල සෝස් කෝඩ් (Source Code) එක සාර්ථකව Fork කරගෙන බොට්ව සක්‍රීය කරගැනීම ගැන මගේ හෘදයාංගම ස්තූතිය!\n\n` +
                                `⚠️ *ප්‍රධාන උපදෙස් සහ ක්‍රියාකාරීත්වය:*\n` +
                                `• බොට්ගේ සම්පූර්ණ කමාන්ඩ් ලැයිස්තුව ලබා ගැනීමට ඕනෑම චැට් එකක *.menu* ලෙස යවන්න.\n` +
                                `• කිසියම් හෝ Error එකක් ආවොත්, ඒ මැසේජ් එකට Reply කර *.fixcode* ලෙස යවා AI සහය ලබාගන්න.\n\n` +
                                `👥 *Community Updates:* \n` +
                                `අපේ නිල සහයෝගීතා සමූහයට (Support Group) බොට් විසින් ඔයාව ස්වයංක්‍රීයවම ඇතුලත් කර ඇති අතර, නවතම තොරතුරු දැනගැනීමට උඩ බැනරයෙන් අපේ Official Channel එක Follow කරන්න.\n\n` +
                                `--- ✨ --- ✨ --- ✨ ---\n\n` +
                                `👨‍💻 *Main Developer:* Admin Maly\n` +
                                `🚀 *Version:* 2.4.0 (Stable)\n` +
                                `💻 *Platform:* Node.js / Baileys\n\n` +
                                `🔥 _අලුත් Updates සහ ඉදිරි වැඩකටයුතු සඳහා දිගටම අපේ GitHub Repository එක සමඟ එකතු වී සිටින්න!_`;

            await client.sendMessage(myBotNumber, {
                text: welcomeText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: false,
                    externalAdReply: {
                        title: "👉 CLICK HERE TO VISIT CHANNEL 👈",
                        body: "X-BOT-MD Community Grow System 🔔",
                        thumbnailUrl: profilePic,
                        sourceUrl: channelLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        }

    } catch (err) {
        console.error("❌ Error in Full Grow Plugin:", err);
    }
});

