module.exports = ( units ) => {
    return units.reduce((sum,c) => { 
        return sum + c.gp
    },0)
}
