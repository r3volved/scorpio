module.exports = ( units, tier, equipped ) => {
    equipped = equipped || 0
    return units.filter(c => c.gear == tier && c.equipped.length >= equipped)
}
