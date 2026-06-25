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
    name: "autofollow",
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
            await m.reply(`✅ *Success:* චැනලය සාර්ථකව Follow කරන ලදී!\n📌 *JID:* ${meta.id}\n👑 *Name:* ${meta.name || "X-Channel"}`);
        } else {
            throw new Error("JID not found");
        }

    } catch (err) {
        if (typeof m.react === "function") await m.react("❌");
        await m.reply(`❌ *Error:* චැනල් ලින්ක් එක JID එකකට පරිවර්තනය කිරීමට නොහැකි විය. (${err.message})`);
    }
});

