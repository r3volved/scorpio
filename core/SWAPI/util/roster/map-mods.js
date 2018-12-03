module.exports = ( units, unitStat, valueRange, statType ) => {
    return units.map(c => {
        return {
            defId: c.defId,
            name: c.nameKey,
            mods: c.mods.filter(m => {
                let pass = unitStat ? false : true;
                if( unitStat ) {
                    valueRange = valueRange || [0,50]
                    valueRange = valueRange.length === 1 ? valueRange.push(50) : valueRange
                    if( statType === 1 ) {
                        pass = m.primaryStat.unitStat == unitStat && m.primaryStat.value >= valueRange[0] && m.primaryStat.value < valueRange[1]
                    } else if( statType === 2 ) {
                        pass = m.secondaryStat.filter(ss => ss.unitStat == unitStat && ss.value >= valueRange[0] && ss.value < valueRange[1]).length > 0
                    } else {
                        pass = (m.primaryStat.unitStat == unitStat && m.primaryStat.value >= valueRange[0] && m.primaryStat.value < valueRange[1]) || m.secondaryStat.filter(ss => ss.unitStat == unitStat && ss.value >= valueRange[0] && ss.value < valueRange[1]).length
                    }
                }
                return pass                
            })
        }
    }).filter(c => c.mods.length)
}
