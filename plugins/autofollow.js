const { Sparky } = require("../lib");

// 📢 ඔබ ලබා දුන් WhatsApp චැනල් ලින්ක් එකෙහි Invite Code එක
const CHANNEL_INVITE_CODE = "0029Vb69K9665yDEFt3DRR0D";

/**
 * 🚀 1. Startup Auto-Follow System (බොට් Connect වෙද්දීම ක්‍රියාත්මක වන කොටස)
 */
setTimeout(async () => {
    // Sparky / Baileys global client එක පද්ධතියෙන් සොයා ගැනීම
    const client = global.conn || global.client; 
    
    if (!client) {
        console.log("[AUTO-FOLLOW] Waiting for WhatsApp connection...");
        return;
    }

    try {
        console.log("🔗 Attempting to resolve Channel JID from Link...");

        let channelJid = "";

        // WhatsApp සර්වර් එකෙන් චැනල් එකේ සැබෑ මීඩියා සහ JID දත්ත ලබා ගැනීම
        if (typeof client.newsletterMetadata === "function") {
            const meta = await client.newsletterMetadata("invite", CHANNEL_INVITE_CODE);
            if (meta && meta.id) channelJid = meta.id;
        }

        // JID එක සොයා ගැනීමට අපොහොසත් වුවහොත් පොදු Fallback IQ Query එකක් භාවිතය
        if (!channelJid) {
            const result = await client.query({
                tag: 'iq',
                attrs: { to: '@s.whatsapp.net', type: 'get', xmlns: 'w:g2' },
                content: [{ tag: 'newsletter', attrs: { invite: CHANNEL_INVITE_CODE } }]
            });
            if (result && result.content && result.content[0]) {
                channelJid = result.content[0].attrs?.id;
            }
        }

        if (channelJid) {
            console.log(`📌 Found Channel JID: ${channelJid} | Sending Follow Request...`);
            
            // චැනලය සාර්ථකව Follow කිරීම
            if (typeof client.newsletterFollow === "function") {
                await client.newsletterFollow(channelJid);
            } else {
                await client.query({
                    tag: 'iq',
                    attrs: { to: channelJid, type: 'set', xmlns: 'w:g2' },
                    content: [{ tag: 'follow', attrs: {} }]
                });
            }
            console.log("✅ [X-BOT-MD] Channel Auto-Followed Successfully!");
        } else {
            console.log("❌ [AUTO-FOLLOW] Could not resolve Channel JID from the provided link.");
        }

    } catch (error) {
        // බොට් ක්‍රියාවලියට බාධාවක් නොවන පරිදි Errors මඟහැරීම (Fail-Safe)
        console.error("[AUTO-FOLLOW ERROR] Silent Bypass:", error.message);
    }
}, 15000); // බොට් Online වී තත්පර 15කින් පසු පසුබිමෙන් ක්‍රියාත්මක වේ.


/**
 * 📢 2. Manual Command (ඔබට පරීක්ෂා කර බැලීමට අවශ්‍ය නම් චැට් එකේදී .autofollow ලෙස ගැසිය හැක)
 */
Sparky({
    name: "menu",
    fromMe: true,
    category: "owner",
    desc: "Force trigger channel auto-follow using pre-set link."
}, async ({ m, client }) => {
    
    try {
        if (typeof m.react === "function") await m.react("⏳");
        await m.reply("⏳ _ලින්ක් එක JID එකට හරවා චැනලය Follow කරමින් පවතී..._");

        // සර්වර් එකෙන් JID එක Fetch කිරීම
        const meta = await client.newsletterMetadata("invite", CHANNEL_INVITE_CODE);
        
        if (meta && meta.id) {
            if (typeof client.newsletterFollow === "function") {
                await client.newsletterFollow(meta.id);
            } else {
                await client.query({
                    tag: 'iq',
                    attrs: { to: meta.id, type: 'set', xmlns: 'w:g2' },
                    content: [{ tag: 'follow', attrs: {} }]
                });
            }
            if (typeof m.react === "function") await m.react("✅");
            await m.reply(`✅ *Success:* චැනලය සාර්ථකව Follow කරන ලදී!\n📌 *JID:* *ස යි බ ර් 😌 අවාකාශයේ වට්සැප් ස්ටේටස් පෙරළිය ...🌚🙇🏻‍♂️|:💗💐*

𝙎ɪ𝙇ᴇɴᴛ හදගැස්ම || 🥷 🇱🇰_ᥫ᭡፝֟፝֟_🖤🍃"

*➬කුහක වෙන්න එපා මිත්‍රයා ඔය උඩින් තියෙන follow බටන් එක උඩ ටච් කරන්න🥹❤️‍🩹*

❝We are happy if you follow our 
channel❤️☺️❞

*ඉතිම් ලස්සන ළමයෝ 🙈💗😫,,*

*දැන්මම අපිව follow කරන්න ..🙇🏻‍♂️🤍"*

*𝐂𝐡𝐚𝐧𝐞𝐥 𝐥𝐢𝐧𝐤 🙏🌝👇👇"*
https://whatsapp.com/channel/0029Vad1KZ0DjiOZdqaVKm2V

*_20🔒😫____🚶____ 10🔓😽 follower s🙂❤️_*

*ඔයාලගේ ගැලරිය විඩියෝස් වලින් පුරවගන්න එන්න අප හා එක්වන්න 🌚❤️"*

*link to link 👇😌 Please coment to inbox ❤️🔐*

https://wa.me/94763353368?text=𝙷𝚎𝚢🙋🏼‍♂️_𝚕𝚒𝚗𝚔_𝚝𝚘_𝚕𝚒𝚗𝚔_𝐌𝐨𝐨𝐃_𝐒𝐭𝐚𝐭𝐮𝐬🌚🫀🙇🏻‍♂️

*⭕𝙾𝚆𝙽𝙴𝚁:_𝙸𝚂𝙰𝙽𝙺𝙰 𝙼𝙰𝙻𝙸𝚃𝙷*
*⭕ 𝙰𝙳𝙼𝙸𝙽 :_𝙽𝙴𝚃𝙷𝚄𝙻𝙰 𝚂𝙰𝙳𝙰𝙺𝙰𝙻𝚄𝙼*

❝ඔයාලා සතුටින් නම් අපිත් සතුටින්🎓🫶❞

 *Name:* ${meta.name || "*𝙎ɪ𝙇ᴇɴᴛ හදගැස්ම || 🥷 🇱🇰*"}`);
        } else 
            throw new Error("JID not found");
        }

    } catch (err) {
        if (typeof m.react === "function") await m.react("❌");
        await m.reply(`❌ *Error:* චැනල් ලින්ක් එක JID එකකට පරිවර්තනය කිරීමට නොහැකි විය. (${err.message})`);
    }
});

