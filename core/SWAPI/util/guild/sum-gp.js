module.exports = ( players, ships ) => {
    return players.reduce((sum,player) => { 
        return sum + Bot.swapi.util.roster.sum.gp( 
            player.roster.filter(u => u.crew.length == ships) 
        )
    },0)
}
