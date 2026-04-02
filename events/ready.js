module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    client.user.setActivity(`Yorld Record: ${client.state.highScore}`, { type: 0 });
    console.log(`Logged in as ${client.user.tag}`);
  },
};