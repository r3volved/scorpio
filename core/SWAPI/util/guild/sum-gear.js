module.exports = ( players, tier, equipped ) => {
    return players.reduce((sum,player) => { 
        return sum + Bot.swapi.util.roster.filter.gear( player.roster, tier, equipped ).length
    },0)
}
