module.exports = ( players, tier ) => {
    return players.reduce((sum,player) => { 
        return sum + Bot.swapi.util.roster.sum.hardware( player.roster, tier )
    },0)
}
