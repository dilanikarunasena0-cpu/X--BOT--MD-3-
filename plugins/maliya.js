Sparky({
  name: "imr",
  fromMe: isPublic,
  category: "info",
  desc: "Show user details"
},
  async ({
    m, client
  }) => {
    try {
      await m.react('📝');
      
      // ඔබට අවශ්‍ය ෆොටෝ එකේ direct link එක මෙතනට දාන්න
      const imageUrl = "https://files.catbox.moe/v79ep1.png"; 
      
      // Header එකට Welcome කැප්ෂන් එක එකතු කර සකස් කළ මැසේජ් එක
      const responseText = `Welcome ❤️‍🩹\n\n*Name:* Isanka\n*Village:* Kosdeniya`;
      
      await client.sendMessage(m.jid, { 
        image: { url: imageUrl }, 
        caption: responseText 
      }, { quoted: m });

      await m.react('✅');
    } catch (error) {
      await m.react('❌');
      m.reply(error.toString());
    }
  });

