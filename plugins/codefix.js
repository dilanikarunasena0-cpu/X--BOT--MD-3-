const axios = require("axios");
const { Sparky, isPublic } = require("../lib"); 

// ======================================================
// 🔍 AI CODE COMPANION & ERROR FIXER (PROFESSIONAL TOOL)
// ======================================================
Sparky({
    name: "fixcode",
    alias: ["debug", "errorfix", "coder"],
    category: "tools",
    fromMe: isPublic,
    desc: "Analyze code, find errors, and provide fixed code with explanation."
}, async ({ m, text }) => {
    try {
        const input = (text || m.text || m.body || "").trim();

        let cleanInput = input;
        // Command prefix එකක් තිබේ නම් එය ඉවත් කිරීම
        if (cleanInput.startsWith(".")) {
            cleanInput = cleanInput.replace(/^\.\w+\s+/, "");
        }

        if (!cleanInput) {
            return m.reply(
                "❌ *කරුණාකර විශ්ලේෂණය කිරීමට අවශ්‍ය Code එක ලබා දෙන්න!*\n\n" +
                "💡 *Example:* \n.fixcode const x = 10\nx = 20\nconsole.log(x)"
            );
        }

        // Bot වැඩ කරන බව පෙන්වීමට මැසේජ් එකක්
        await m.reply("🧠 *AI මඟින් ඔබේ කේතය (Code) පරීක්ෂා කරමින් පවතී... කරුණාකර මොහොතක් රැඳී සිටින්න.*");

        const apiKey = "wxa_f_21e17ba43b"; 

        // AI එකට හරියටම උපදෙස් (System Prompt) එකක් සකස් කිරීම - ලස්සනට Output එක ගන්න
        const systemPrompt = "You are an expert software engineer and code debugger. " +
                             "Analyze the user's provided code, identify any syntax or logical errors, " +
                             "explain the problem briefly in simple English, and provide the fully corrected code " +
                             "inside a proper markdown code block. Keep the explanation professional and clear.";

        const fullPrompt = `${systemPrompt}\n\nUser Code to Fix:\n${cleanInput}`;

        // XWolf API GPT-4o Endpoint
        const apiUrl = `https://apis.xwolf.space/api/ai/chatbot/gpt4o?q=${encodeURIComponent(fullPrompt)}&key=${apiKey}`;

        const response = await axios.get(apiUrl, { timeout: 45000 });
        const data = response?.data;

        // XWolf API එකේ response එක check කිරීම
        let aiResult = data?.result || data?.reply || null;

        if (!aiResult) {
            return m.reply("❌ කේතය පරීක්ෂා කිරීමට නොහැකි වුණා. API ප්‍රතිචාරයක් ලැබුණේ නැත.");
        }

        // Output එක ලස්සන Format එකකට සකස් කිරීම
        const finalResponse = `💻 *AI CODE ASSISTANT & DEBUGGER*\n\n` +
                              `${aiResult}\n\n` +
                              `⚡ *Powered by XWolf API*`;

        return await m.reply(finalResponse);

    } catch (err) {
        console.error("❌ Code Fixer Error:", err);
        return m.reply(
            "❌ Error occurred while debugging:\n" +
            (err.response?.data?.message || err.message || "Unknown error")
        );
    }
});

