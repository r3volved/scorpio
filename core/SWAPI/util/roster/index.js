module.exports = {

    sum: {
    
        gp:require('./sum-gp.js'),
        
        zetas:require('./sum-zetas.js'),
        
        hardware:require('./sum-hardware.js'),

    },
    
    filter: {
    
        chars: require('./filter-characters.js'),
    
        ships: require('./filter-ships.js'),

        gear: require('./filter-gear.js'),

        rarity: require('./filter-rarity.js'),

    },
    
    map: {
    
        mods: require('./map-mods.js'),
    
    }

}
