module.exports = ( players, rarity, ships ) => {
    return players.reduce((sum,player) => { 
        return sum + player.roster.filter(u => u.crew.length == ships && u.rarity === rarity).length
    },0)
}
