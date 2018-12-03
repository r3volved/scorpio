module.exports = ( units , tier) => {
    tier = tier || 3
    return units.reduce((sum,c) => { 
        return sum + c.skills.filter(s => s.id.toLowerCase().includes('hardware') && s.tier === tier).length
    },0)
}
