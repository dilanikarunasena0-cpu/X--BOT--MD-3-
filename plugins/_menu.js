const { commands, prefix } = require("./commands");

const icons = {
  General: "📌",
  Utility: "⚙️",
  Fun: "🎮",
  Admin: "🛡️"
};

function getDateTime() {
  const now = new Date();

  return {
    date: now.toLocaleDateString("en-GB"),
    time: now.toLocaleTimeString("en-GB", { hour12: false })
  };
}

function buildMenu() {

  const { date, time } = getDateTime();

  const categories = [...new Set(commands.map(c => c.category))];

  const totalCmds = commands.length;

  let text =
`╭━━〔 🤖 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗕𝗢𝗧 〕━━╮
│ 👑 Owner : Isanka
│ ⚡ Prefix : ${prefix}
│ 📅 Date : ${date}
│ ⏰ Time : ${time}
│ 📊 Commands : ${totalCmds}
╰━━━━━━━━━━━━━━━━━━━━╯\n`;

  for (const cat of categories) {

    text += `\n╭──〔 ${icons[cat] || "📁"} ${cat.toUpperCase()} 〕──╮\n`;

    const cmds = commands.filter(c => c.category === cat);

    for (const cmd of cmds) {
      text += `│ ◦ ${prefix}${cmd.name} ➜ ${cmd.description}\n`;
    }

    text += `╰────────────────────╯\n`;
  }

  text += `\n💡 Type ${prefix}help for more info`;

  return text;
}

module.exports = { buildMenu };
