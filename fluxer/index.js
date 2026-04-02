require("dotenv").config();
const { Client, EmbedBuilder } = require("@fluxerjs/core");
const { loadData, handleMessage, getState } = require("./yoChain");

const WATCH_CHANNEL_ID = process.env.CHANNEL_ID;
const PREFIX = "!";

const client = new Client({ token: process.env.FLUXER_BOT_TOKEN });

// ---------------- COMMAND HANDLER ----------------
const commands = {
  testembed: async (message) => {
    const state = getState();
    const embed = new EmbedBuilder()
      .setTitle("<a:twenty97Clap:1489090865245847752> Yo Call Ended! <a:twenty97Clap:1489090865245847752>")
      .setColor(0xff00ff)
      .setDescription("This is a test embed for the Yo call!")
      .addField("🏆 Yorld Record", `${state.highScore}`, true)
      .addField(
        "📅 Date",
        state.highScoreDate
          ? `<t:${Math.floor(new Date(state.highScoreDate).getTime() / 1000)}:F>`
          : "N/A",
        true
      )
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  twentystream: async (message) => {
    const startDate = new Date("2024-06-28T13:59:00Z");
    const now = new Date();
    const diffMs = now - startDate;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    const embed = new EmbedBuilder()
      .setColor(0x00ffcc)
      .setDescription(
        `It has been **${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds** since twentybucks last went live. peepoCry.`
      );

    await message.channel.send({ embeds: [embed] });
  },
};

// ---------------- READY ----------------
client.on("ready", () => {
  loadData();
  console.log(`Logged in as ${client.user?.username}`);
  console.log(`Current Yorld Record: ${getState().highScore}`);
});

// ---------------- MESSAGE HANDLER ----------------
client.on("messageCreate", async (message) => {
  // Removed the check for bots so all messages are included

  // YO CHAIN
  if (message.channel.id === WATCH_CHANNEL_ID) {
    await handleMessage(message);
  }

  // PREFIX COMMANDS
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  if (commands[command]) {
    try {
      await commands[command](message, args);
    } catch (err) {
      console.error(`Error executing command ${command}:`, err);
    }
  }
});

// ---------------- LOGIN ----------------
(async () => {
  try {
    await client.login(process.env.FLUXER_BOT_TOKEN);
    console.log("Bot logged in successfully!");
  } catch (err) {
    console.error("Failed to log in:", err);
  }
})();