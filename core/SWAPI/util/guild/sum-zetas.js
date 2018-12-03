module.exports = ( players ) => {
    return players.reduce((sum,player) => { 
        return sum + Bot.swapi.util.roster.sum.zetas( player.roster )
    },0)
}
