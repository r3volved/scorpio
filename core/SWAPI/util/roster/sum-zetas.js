module.exports = ( units ) => {
    return units.reduce((sum,c) => { 
        return sum + c.skills.filter(s => s.isZeta && s.tier === 8).length 
    },0)
}
