//Command handler map - only map commands provided in config
const groups = Object.keys( Bot.config.discord.commands )
const commands = groups.reduce((acc,a) => {
    const cmds = Object.keys( Bot.config.discord.commands[a] );
    cmds.forEach( c => {
        if( Bot.config.discord.commands[a][c] ) {
            acc[c] = true;
        }
    })
    return acc
},{})

Report.dev( "BOT: Loaded discord commands:", Object.keys(commands) )

module.exports = {

    //Help commands
    help    : commands.help    ? require('./help/help.js')            : null,
    invite  : commands.invite  ? require('./help/invite.js')          : null,
    swgoh   : commands.swgoh   ? require('./help/swgoh-tools.js')     : null,
    discord : commands.discord ? require('./help/discord-servers.js') : null,
    support : commands.support ? require('./help/support-me.js')      : null,
    raw     : commands.raw     ? require('./help/raw.js')             : null,

    //Registration
    add    : commands.add    ? require('./registration/registration-add.js') : null,
    rem    : commands.rem    ? require('./registration/registration-rem.js') : null,
    whois  : commands.whois  ? require('./registration/registration-get.js') : null,

    //SWGoH Commands
    p   : commands.p   ? require('./player/player-info.js') : null,
    pz  : commands.pz  ? require('./player/player-zetas.js') : null,
    pc  : commands.pc  ? require('./player/player-info-characters.js') : null,
    pca : commands.pca ? require('./player/player-arena-characters.js') : null,
    ps  : commands.ps  ? require('./player/player-info-ships.js') : null,
    psa : commands.psa ? require('./player/player-arena-ships.js') : null,
    z   : commands.z   ? require('./player/zeta-recommendations.js') : null,

    g   : commands.g   ? require('./guild/guild-info.js') : null,
    gz  : commands.gz  ? require('./guild/guild-zetas.js') : null,
    gc  : commands.gc  ? require('./guild/guild-info-characters.js') : null,
    gs  : commands.gs  ? require('./guild/guild-info-ships.js') : null,
    ggp : commands.ggp ? require('./guild/guild-info-gp.js') : null,
    gvs : commands.gvs ? require('./guild/guild-vs.js') : null,
    gvu : commands.gvu ? require('./guild/guild-vs-coi.js') : null,
    tb  : commands.tb  ? require('./guild/guild-info-tb.js') : null,
    


    //Utilities
    status    : commands.status    ? require('./utilities/bot-status.js')       : null,
    translate : commands.translate ? require('./utilities/google-translate.js') : null,
    

    //SWAPI DEMO
    players : commands.players ? require('./demo/demo-players.js') : null,
    guilds  : commands.guilds  ? require('./demo/demo-guilds.js')  : null,
    events  : commands.events  ? require('./demo/demo-events.js')  : null,
    battles : commands.events  ? require('./demo/demo-battles.js') : null,
    squads  : commands.events  ? require('./demo/demo-squads.js')  : null,
    zetas   : commands.events  ? require('./demo/demo-zetas.js')   : null,


    blacklist : commands.blacklist ? require('./utilities/blacklist.js') : null,
    premium : commands.premium ? require('./utilities/premium.js') : null,
    vsu : commands.vsu ? require('./premium/guild-vs-units.js') : null,
    vss : commands.vss ? require('./premium/guild-vs-squads.js') : null,


}
