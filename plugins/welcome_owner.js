const { Sparky } = require("../lib");

// යූසර්ලා චැනල් ලින්ක් එක ක්ලික් කලාද නැද්ද කියා තාවකාලිකව මතක තබා ගැනීමට
global.channelVerifiedUsers = global.channelVerifiedUsers || [];
global.hasSentWelcome = global.hasSentWelcome || false;

// ======================================================
// 🔒 X-BOT-MD COMMUNITY GROW & FORCE FOLLOW FULL SYSTEM
// ======================================================
Sparky({
    on: "text", 
    dontAddCommandList: true // මේක background එකෙන් රන් වෙන නිසා කමාන්ඩ් ලිස්ට් එකට වැටෙන්නේ නැත
}, async ({ m, text, client, cmd }) => {
    try {
        // මචං, මැසේජ් එකක් ආවට ඒකෙ body එකක් නැත්නම් (උදා: ස්ටිකර්, ඉමේජ්) කෝඩ් එක නතර කරනවා ක්‍රෑෂ් වෙන්නේ නැතිවෙන්න
        if (!m || !client || !client.user) return;

        const myBotNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const sender = m.sender;
        const msgBody = m.body || m.text || ""; // Undefined වීම වැළැක්වීමට safe check එකක්

        // ---------------------------------------------------------------------------
        // 🛠️ CONFIGURATION (ඔයාගේ නිල ලින්ක්ස් විස්තර)
        // ---------------------------------------------------------------------------
        const groupInviteCode = "HpmCR9alxYRH2xxjDonTZ1"; 
        const channelLink = "https://whatsapp.com/channel/0029Vb69K9665yDEFt3DRR0D";
        // ---------------------------------------------------------------------------

        // 👥 1. AUTOMATIC GROUP JOIN SYSTEM (Safety try-catch එකක් ඇතුලේ තියෙන්නේ)
        if (!global.hasSentWelcome) {
            try {
                if (groupInviteCode && typeof client.groupAcceptInvite === "function") {
                    await client.groupAcceptInvite(groupInviteCode.trim());
                }
            } catch (e) {
                console.error("❌ Auto Group Join Failed:", e.message);
            }
        }

        // 🔒 2. FORCE CHANNEL FOLLOW LOCK SYSTEM
        // බොට් අයිතිකාරයාට (You/Owner) මේ ලොක් එක බලපාන්නේ නැත
        if (sender !== myBotNumber && !global.channelVerifiedUsers.includes(sender)) {
            
            // msgBody එක තියෙනවාද සහ ඒක කමාන්ඩ් එකක්ද කියා ආරක්ෂිතව පරික්ෂා කිරීම
            if (msgBody && (msgBody.startsWith(".") || msgBody.startsWith("!"))) {
                
                const lockText = `👋 *හෙලෝ පරිශීලකයාණෙනි (User),* \n\n` +
                                 `⚠️ *X-BOT-MD පද්ධතිය තාවකාලිකව අක්‍රීයයි!* \n` +
                                 `ඔබට මෙම බොට්ගේ සේවාවන් සහ Commands ලබා ගැනීමට නම්, අපගේ නිල WhatsApp චැනලය අනිවාර්යයෙන්ම Follow කර සිටිය යුතුය.\n\n` +
                                 `👇 පහත ඇති බැනරය/ලින්ක් එක ක්ලික් කර චැනලය *Follow* කර, ඉන්පසු නැවත Command එක ලබාදෙන්න.`;

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

                // යූසර්ව ලිස්ට් එකට එකතු කර ඊළඟ පාර අන්ලොක් කිරීම
                global.channelVerifiedUsers.push(sender);
                return; // කමාන්ඩ් එක රන් වෙන්න නොදී මෙතනින් නවත්වනවා
            }
        }

        // 💎 3. PROFESSIONAL OWNER WELCOME CARD
        if (!global.hasSentWelcome && sender === myBotNumber) {
            global.hasSentWelcome = true;

            console.log("💎 Sending Professional Welcome Card to Bot Owner...");

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
            console.log("✅ Owner welcome processed.");
        }

    } catch (err) {
        console.error("❌ Error in Full Grow Plugin:", err);
    }
});

