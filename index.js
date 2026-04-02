require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");

// ------------------- CLIENT -------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ------------------- STATE -------------------
const DATA_FILE = path.join(__dirname, "data.json");
client.state = {
  currentChain: 0,
  highScore: 0,
  usersInChain: [],
  highScoreDate: null,
};

if (fs.existsSync(DATA_FILE)) {
  client.state = JSON.parse(fs.readFileSync(DATA_FILE));
}

client.saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(client.state, null, 2));
};

// ------------------- SLASH COMMANDS -------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
  }

  // Automatically register all commands
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  (async () => {
    try {
      console.log("Registering slash commands...");
      const commandsArray = client.commands.map(cmd => cmd.data.toJSON());
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commandsArray }
      );
      console.log("Slash commands registered.");
    } catch (err) {
      console.error(err);
    }
  })();
}

// ------------------- MESSAGE HANDLERS -------------------
client.messageHandlers = [];
const messageHandlersPath = path.join(__dirname, "events", "messageHandlers");
if (fs.existsSync(messageHandlersPath)) {
  const handlerFiles = fs.readdirSync(messageHandlersPath).filter(f => f.endsWith(".js"));
  for (const file of handlerFiles) {
    const handler = require(path.join(messageHandlersPath, file));
    client.messageHandlers.push(handler);
  }
}

// ------------------- EVENT HANDLERS -------------------
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js") && !f.includes("messageHandlers"));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  }
}

// ------------------- MESSAGE CREATE -------------------
client.on("messageCreate", async (message) => {
  for (const handler of client.messageHandlers) {
    try {
      await handler.execute(client, message);
    } catch (err) {
      console.error(`Error in message handler ${handler.name || "unknown"}:`, err);
    }
  }
});

// ------------------- INTERACTION CREATE -------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(client, interaction);
  } catch (err) {
    console.error(`Error executing command ${interaction.commandName}:`, err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "There was an error executing this command.", ephemeral: true });
    } else {
      await interaction.reply({ content: "There was an error executing this command.", ephemeral: true });
    }
  }
});

// ------------------- LOGIN -------------------
client.login(process.env.TOKEN);