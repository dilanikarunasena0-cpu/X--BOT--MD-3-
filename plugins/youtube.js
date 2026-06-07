const {
  Sparky,
  isPublic,
  YtInfo,
  yts,
  yta,
  ytv
} = require("../lib");
const { getString, isUrl, convertToMp3 } = require('./pluginsCore');
const fetch = require('node-fetch');
const lang = getString('download');


Sparky({
  name: "yts",
  fromMe: isPublic,
  category: "youtube",
  desc: "search in youtube"
}, async ({ m, client, args }) => {
  if (!args) return await m.reply(lang.NEED_Q);
  if (await isUrl(args)) {
    const yt = await YtInfo(args);
    return await client.sendMessage(m.jid, { image: { url: yt.thumbnail }, caption: "*title :* " + yt.title + "\n*author :* " + yt.author + "\n*url :* " + args + "\n*video id :* " + yt.videoId });
  } else {
    const videos = await yts(args);
    const result = videos.map(video => `*🏷️ Title :* _*${video.title}*_\n*📁 Duration :* _${video.duration}_\n*🔗 Link :* _${video.url}_`);
    return await m.reply(`\n\n_*Result Of ${args} 🔍*_\n\n` + result.join('\n\n'))
  }
});

Sparky({
  name: "ytv",
  fromMe: isPublic,
  category: "youtube",
  desc: "Find details of a song"
},
  async ({
    m, client, args
  }) => {
    try {
      args = args || m.quoted?.text;
      if (!args) return await m.reply(lang.NEED_URL);
      if (!await isUrl(args)) return await m.reply(lang.INVALID_LINK);
      await m.react('⬇️');
      const url = await ytv(args);
      await m.sendMsg(m.jid, url, { quoted: m }, "video")
      await m.react('✅');
    } catch (error) {
      await m.react('❌');
      m.reply(error);
    }
  });

Sparky({
  name: "yta",
  fromMe: isPublic,
  category: "youtube",
  desc: "Find details of a song"
},
  async ({
    m, client, args
  }) => {
    try {
      args = args || m.quoted?.text;
      if (!args) return await m.reply(lang.NEED_URL);
      if (!await isUrl(args)) return await m.reply(lang.INVALID_LINK);
      await m.react('⬇️');
      const url = await yta(args);
      await m.sendMsg(m.jid, url, { quoted: m, mimetype: 'audio/mpeg' }, "audio");
      await m.react('✅');
    } catch (error) {
      await m.react('❌');
      m.reply(error);
    }
  });

Sparky({
  name: "play",
  fromMe: isPublic,
  category: "youtube",
  desc: "play a song"
},
  async ({
    m, client, args
  }) => {
    try {
      args = args || m.quoted?.text;
      if (!args) return await m.reply(lang.NEED_Q);
      await m.react('🔎');
      const play = (await yts(args))[0]
      await m.react('⬇️');
      await m.reply(`Downloading ${play.title}`)
      const url = await yta(play.url);
      await m.sendMsg(m.jid, url, { quoted: m, mimetype: 'audio/mpeg' }, "audio");
      await m.react('✅');
    } catch (error) {
      await m.react('❌');
      m.reply(error);
    }
  });

Sparky({
  name: "song",
  fromMe: isPublic,
  category: "youtube",
  desc: "play a song"
},
  async ({
    m, client, args
  }) => {
    try {
      args = args || m.quoted?.text;
      if (!args) return await m.reply(lang.NEED_Q);
      await m.react('🔎');
      const play = (await yts(args))[0]
      await m.react('⬇️');
      await m.reply(`Downloading ${play.title}`)
      const url = await yta(play.url);
      await m.sendMsg(m.jid, url, { quoted: m, mimetype: 'audio/mpeg' }, "audio");
      await m.react('✅');
    } catch (error) {
      await m.react('❌');
      m.reply(error);
    }
  });

Sparky({
  name: "maliya", // කමාන්ඩ් එක .maliya ලෙස වෙනස් කරන ලදී
  fromMe: isPublic,
  category: "info",
  desc: "Show active commands list for Maliya Bot"
},
  async ({ m, client }) => {
    try {
      // වඩාත් ගැලපෙන සහ ලස්සන Emoji එකක්
      await m.react('👑'); 
      
      // පින්තූරයේ Direct Link එක (ඔබට අවශ්‍ය නම් වෙනස් කරන්න)
      const imageUrl = "https://files.catbox.moe/v79ep1.png"; 
      
      // දැනට වැඩ කරන ප්‍රධාන විධානයන් (Commands) ලැයිස්තුව
      const basicCommands = ["alive", "imr", "owner", "help", "facke"];

      // මෙනු එකේ ප්‍රධාන පෙනුම (Header) - MALIYA THEME
      let menuText = `╭═════════════════════════╮\n`;
      menuText += `│   ⚡ 𝐌𝐀𝐋𝐈𝐘𝐀 𝐁𝐎𝐓-𝐌𝐃 ⚡   │\n`;
      menuText += `╰═════════════════════════╯\n\n`;
      
      menuText += `  👋 *Welcome User* ❤️‍🩹\n`;
      menuText += `  👤 *Owner:* _🅸🆂🅰🅽🅺🅰_\n`;
      menuText += `  📞 *Number:* _94763353368_\n`;
      menuText += `  📊 *Active Cmds:* _${basicCommands.length}_\n`;
      menuText += `  🧧 *Status:* _Keep Waiting for Updates_\n\n`;

      // කමාන්ඩ්ස් පෙන්වන කොටස
      menuText += `┌─────────────────────────┐\n`;
      menuText += `│      📑  *𝐌𝐀𝐈𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒* │\n`;
      menuText += `└─────────────────────────┘\n`;
      
      basicCommands.forEach(cmd => {
        menuText += `  📌  .${cmd}\n`;
      });
      
      menuText += `───────────────────────────\n`;
      menuText += `💻 _𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐌𝐚𝐥𝐢𝐲𝐚 𝐁𝐨𝐭_`;

      // මැසේජ් එක පින්තූරය සමඟ යැවීම
      await client.sendMessage(m.jid, { 
        image: { url: imageUrl }, 
        caption: menuText 
      }, { quoted: m });

      await m.react('✅');
    } catch (error) {
      await m.react('❌');
      m.reply(error.toString());
    }
  });
