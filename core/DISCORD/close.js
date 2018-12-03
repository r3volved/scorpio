module.exports = async () => {
    
    return Bot.discord.client ? await Bot.discord.client.destroy() : true;

}
