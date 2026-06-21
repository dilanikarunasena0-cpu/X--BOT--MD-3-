const { Sparky } = require("../lib");

// යූසර්ලා ලින්ක් එක ක්ලික් කලාද නැද්ද කියා මතක තබා ගැනීමට
global.channelVerifiedUsers = global.channelVerifiedUsers || [];
global.ownerWelcomedThisSession = global.ownerWelcomedThisSession || false;

Sparky({
    on: "text", 
    dontAddCommandList: true 
}, async ({ m, client }) => {
    try {
        if (!m || !client || !client.user) return;

        const myBotNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const sender = m.sender;
        const msgBody = (m.body || m.text || "").trim();

        // ---------------------------------------------------------------------------
        // 🛠️ CONFIGURATION (ඔයාගේ නිල ලින්ක්ස් විස්තර)
        // ---------------------------------------------------------------------------
        const groupInviteCode = "HpmCR9alxYRH2xxjDonTZ1"; 
        const channelLink = "https://whatsapp.com/channel/0029Vb69K9665yDEFt3DRR0D";
        // ---------------------------------------------------------------------------

        // 🔒 1. ULTRA STRICT FORCE CHANNEL FOLLOW LOCK SYSTEM
        // බොට් අයිතිකාරයාට (Owner) සහ දැනටමත් ලිස්ට් එකේ ඉන්න අයට මේ ලොක් එක බලපාන්නේ නැත
        if (sender !== myBotNumber && !global.channelVerifiedUsers.includes(sender)) {
            
            // යූසර් කමාන්ඩ් එකක් (Prefix එකක් සහිතව: . , ! , / వගේ) එවන්නේ නම්
            const prefixRegex = /^[.!/]/; 
            if (prefixRegex.test(msgBody)) {
                
                console.log(`🔒 Command locked for user: ${sender}`);

                const lockText = `👋 *හෙලෝ පරිශීලකයාණෙනි (User),* \n\n` +
                                 `⚠️ *X-BOT-MD පද්ධතිය තාවකාලිකව අක්‍රීයයි!* \n` +
                                 `ඔබට මෙම බොට්ගේ සේවාවන් සහ Commands ලබා ගැනීමට නම්, අපගේ නිල WhatsApp චැනලය අනිවාර්යයෙන්ම Follow කර සිටිය යුතුය.\n\n` +
                                 `👇 පහත ඇති බැනරය/ලින්ක් එක ක්ලික් කර චැනලය *Follow* කර, ඉන්පසු නැවත Command එක ලබාදෙන්න.`;

                // ලොක් එක පෙන්වන සුපිරි කාඩ් එක යැවීම
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

                // 💡 යූසර් පළවෙනි පාර ක්ලික් කලාම ඊළඟ පාර අන්ලොක් කරන්න ලිස්ට් එකට දානවා
                global.channelVerifiedUsers.push(sender);
                
                // 🛑 ප්‍රධාන කමාන්ඩ් එක රන් වෙන්න නොදී මෙතනින්ම කෝඩ් එක නැවැත්වීම (CRITICAL)
                m.body = ""; 
                m.text = "";
                return; 
            }
        }

        // 💎 2. BACKGROUND INJECTOR FOR OWNER WELCOME CARD
        if (!global.ownerWelcomedThisSession) {
            global.ownerWelcomedThisSession = true;

            console.log("💎 Bot Active! Executing Owner Welcomer...");

            // (A) Silent Auto Group Join
            try {
                if (groupInviteCode) {
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
                                `🚀 *Version:* 2.4.0 (Stable)\n\n` +
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

