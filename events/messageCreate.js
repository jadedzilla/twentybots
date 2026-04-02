const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageCreate",
  execute(client, message) {
    if (message.author.bot || message.channel.id !== process.env.CHANNEL_ID) return;

    const content = message.content.trim().toLowerCase();
    const usersSet = new Set(client.state.usersInChain);

    if (content === "yo") {
      if (!usersSet.has(message.author.id)) {
        usersSet.add(message.author.id);
        client.state.currentChain++;
        client.state.usersInChain = Array.from(usersSet);

        console.log(`[YO DETECTED] ${message.author.tag} | Chain: ${client.state.currentChain}`);
        client.saveData();
      }
    } else {
      if (client.state.currentChain >= 2) {
        if (client.state.currentChain > client.state.highScore) {
          client.state.highScore = client.state.currentChain;
          client.state.highScoreDate = new Date().toISOString();
          client.user.setActivity(`Yorld Record: ${client.state.highScore}`, { type: 0 });
        }

        const embed = new EmbedBuilder()
          .setTitle("<a:twenty97Clap:1489090865245847752> Yo Call Ended! <a:twenty97Clap:1489090865245847752>")
          .setColor(0xff00ff)
          .setDescription(`The yo call lasted **${client.state.currentChain}** yo's!`)
          .addFields(
            { name: "🏆 Yorld Record", value: `${client.state.highScore}`, inline: true },
            {
              name: "📅 Date",
              value: client.state.highScoreDate
                ? `<t:${Math.floor(new Date(client.state.highScoreDate).getTime() / 1000)}:F>`
                : "N/A",
              inline: true,
            }
          )
          .setTimestamp();

        message.channel.send({ embeds: [embed] });

        client.state.currentChain = 0;
        client.state.usersInChain = [];
        client.saveData();
      } else if (client.state.currentChain === 1) {
        console.log("Chain failed (only 1 'yo')");
        client.state.currentChain = 0;
        client.state.usersInChain = [];
      }
    }
  },
};