module.exports = ( players, unitStat, valueRange, statType ) => {
    return players.reduce((sum,player) => { 
        const mods = Bot.swapi.util.roster.map.mods( player.roster, unitStat, valueRange, statType )
        return sum + mods.reduce((msum,unit) => {
            return msum + unit.mods.length
        },0)
    },0)
}
