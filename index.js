require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const DATA_FILE = path.join(__dirname, 'data.json');
const WATCH_CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let state = {
  currentChain: 0,
  highScore: 0,
  usersInChain: []
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE);
    state = JSON.parse(raw);
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

client.once('ready', () => {
  loadData();
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  // ✅ Only watch the specified channel
  if (message.channel.id !== WATCH_CHANNEL_ID) return;

  const content = message.content.trim().toLowerCase();
  const usersSet = new Set(state.usersInChain);

  if (content === "yo") {
    if (!usersSet.has(message.author.id)) {
      usersSet.add(message.author.id);
      state.currentChain++;
      state.usersInChain = Array.from(usersSet);

      saveData();
    }
  } else {
    if (state.currentChain > 0) {
      if (state.currentChain > state.highScore) {
        state.highScore = state.currentChain;
      }

      message.channel.send(
        `🔥 Yo chain ended at **${state.currentChain}**!\n🏆 High score: **${state.highScore}**`
      );

      state.currentChain = 0;
      state.usersInChain = [];

      saveData();
    }
  }
});

client.login(process.env.TOKEN);