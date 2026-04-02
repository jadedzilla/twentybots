const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testembed")
    .setDescription("Test the Yo call embed"),
  async execute(client, interaction) {
    const { state } = client;
    const embed = new EmbedBuilder()
      .setTitle("<a:twenty97Clap:1489090865245847752> Yo Call Ended! <a:twenty97Clap:1489090865245847752>")
      .setColor(0xff00ff)
      .setDescription(`This is a test embed for the Yo call!`)
      .addFields(
        { name: "🏆 Yorld Record", value: `${state.highScore}`, inline: true },
        {
          name: "📅 Date",
          value: state.highScoreDate
            ? `<t:${Math.floor(new Date(state.highScoreDate).getTime() / 1000)}:F>`
            : "N/A",
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};