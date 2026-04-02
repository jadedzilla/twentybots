const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("twentystream")
    .setDescription("Tells how long since twentybucks last went live"),
  async execute(client, interaction) {
    const startDate = new Date("2024-06-28T13:59:00Z");
    const diffMs = new Date() - startDate;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    const embed = new EmbedBuilder()
      .setColor(0x00ffcc)
      .setDescription(
        `It has been **${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds** since twentybucks last went live. peepoCry.`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};