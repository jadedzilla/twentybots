const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("@fluxerjs/core");

const DATA_FILE = path.join(__dirname, "data.json");

let state = {
  currentChain: 0,
  highScore: 0,
  usersInChain: [],
  highScoreDate: null,
};

// ---------------- DATA ----------------
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    state = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

// ---------------- YO CHAIN HANDLER ----------------
async function handleMessage(message) {
  // Users and allowed bots already filtered in index.js
  const content = message.content.trim().toLowerCase();
  const usersSet = new Set(state.usersInChain);
  const isBot = message.author.bot;

  if (content === "yo") {
    if (!usersSet.has(message.author.id)) {
      usersSet.add(message.author.id);
      state.currentChain++;
      state.usersInChain = Array.from(usersSet);

      console.log(
        `[YO DETECTED] ${message.author.username} (${isBot ? "BOT" : "HUMAN"}) | Chain: ${state.currentChain}`
      );
      saveData();
    }
  } else {
    if (state.currentChain >= 2) {
      if (state.currentChain > state.highScore) {
        state.highScore = state.currentChain;
        state.highScoreDate = new Date().toISOString();
        console.log(`New Yorld Record: ${state.highScore}`);
      }

      const embed = new EmbedBuilder()
        .setTitle("<a:twenty97Clap:1489090865245847752> Yo Call Ended! <a:twenty97Clap:1489090865245847752>")
        .setColor(0xff00ff)
        .setDescription(`The yo call lasted **${state.currentChain}** yo's!`)
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

      // Log all users in the chain with bot/human info
      state.usersInChain.forEach((id) => {
        const userTag = message.guild?.members.cache.get(id)?.user?.username || id;
        const member = message.guild?.members.cache.get(id);
        const botStatus = member?.user?.bot ? "BOT" : "HUMAN";
        console.log(`[CHAIN PARTICIPANT] ${userTag} (${botStatus})`);
      });

      state.currentChain = 0;
      state.usersInChain = [];
      saveData();
    } else if (state.currentChain === 1) {
      console.log("Chain failed (only 1 'yo')");
      state.currentChain = 0;
      state.usersInChain = [];
    }
  }
}

// ---------------- EXPORTS ----------------
module.exports = {
  loadData,
  handleMessage,
  getState: () => state,
};