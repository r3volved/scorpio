module.exports = ( units, rarity ) => {
    return units.filter(c => c.rarity == rarity)
}
