const util = require('util')
const STRING = OUTPUT["guild-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.vsHelp.title,
        description : STRING.vsHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.vsHelp.example.name,
            value:util.format( 
                STRING.vsHelp.example.value,
                message.prefix+message.command
            )
        }]
    }
    message.channel.send({embed})
}

const command = async ( message ) => {

    if( !Bot.premium.users.includes(message.author.id) ) {
        return message.reply('Sorry, this is a premium feature')
    }
    
    let MESSAGE = null
    let embed = {
        title:"",
        description:""
    }
    
    try {

        //Parse allycodes
        let allycodes = await Bot.discord.util.allycodes( message )
        if( allycodes.length !== 2 ) {
            let e = new Error(STRING.error.twoGuildsTitle)
                e.description = util.format(STRING.error.twoGuilds, allycodes.length, allycodes.join(", "))
            throw e
        }

        console.log("Found input", allycodes)

        //Collect unit index
        
        let unitIndex = await Bot.swapi.units(unit => {
            return {
                name:unit.nameKey,
                defId:unit.baseId
            }
        })
        
        unitIndex = unitIndex.result
        

        //Find initial players
        
        embed.title = "Found "+allycodes.length+" allycodes"
        embed.description = "**Searching for players...**\n"+allycodes.join("\n")+"\n"
        
        MESSAGE = await Bot.discord.util.loading(message, embed, MESSAGE)

        let vs = await Bot.discord.util.fetchLive('player', allycodes)
        vs = vs.map(p => {
            if( p.error ) { throw p.error }
            if( !p.guildId.length ) { throw new Error(p.allyCode+' is not affiliated with a guild') }
            return {
                name:p.name,
                allyCode:p.allyCode,
                guildName:p.guildName,
                guildId:p.guildId
            }
        })
            
        console.log("Found players", vs.length)

        //Find initial guilds

        embed.title = "Found "+vs.length+" players"
        embed.description = "**Searching for players...**\n"+vs.map(v => v.allyCode+" ( "+v.name+" )").join(" **✓**\n")+" **✓**\n"
        embed.description += "**Searching for guilds...**\n"+vs.map(v => v.name+" ( "+v.guildName+" )").join("\n")

        MESSAGE = await Bot.discord.util.loading(message, embed, MESSAGE)

        let guilds = await Bot.discord.util.fetchLive('guild', vs.map(p => p.guildId))
        let members = guilds.map(g => g.roster.map(m => m.playerId))
        let players = []

        console.log("Found guilds", guilds.length)

        //Find guild members

        embed.title = "Found "+guilds.length+" guilds"
        embed.description = "**Searching for players...**\n"+vs.map(v => v.allyCode+" ( "+v.name+" )").join(" **✓**\n")+" **✓**\n"
        embed.description += "**Searching for guilds...**\n"+vs.map(v => v.name+" ( "+v.guildName+" )").join(" **✓**\n")+" **✓**\n"
        embed.description += "**Searching for guild members...**\n"
            
        for( let g = 0; g < guilds.length; ++g ) {
                    
            //Find guild members for each guild

            embed.description += guilds[g].name+" ("+members[g].length+")"

            MESSAGE = await Bot.discord.util.loading(message, embed, MESSAGE)

            players.push( await Bot.discord.util.fetchLive('player', members[g]) )

            console.log("Found guildmembers", players[g].length)

            embed.description += " **✓**\n"

        }        
        
        embed.title = "Found all data!"
        embed.description = "**Searching for players...**\n"+vs.map(v => v.allyCode+" ( "+v.name+" )").join(" **✓**\n")+" **✓**\n"
        embed.description += "**Searching for guilds...**\n"+vs.map(v => v.name+" ( "+v.guildName+" )").join(" **✓**\n")+" **✓**\n"
        embed.description += "**Searching for guild members...**\n"+guilds.map(g => g.name+" ( "+g.roster.length+" )").join(" **✓**\n")+" **✓**\n"
        embed.description += "**Calculating ...**"

        //Calculate
        MESSAGE = await Bot.discord.util.loading(message, embed, MESSAGE)

        let gnames = guilds.map(g => g.name.split(/\s/g).length >= 2 ? g.name.split(/\s/g).map(w => w.charAt(0).toUpperCase()).join("") : g.name.slice(0,3))
            gnames = gnames.map(g => g.length > 4 ? g.slice(0,3) : g)
        if( gnames[0] === gnames[1] ) {
            gnames[0] = gnames[0].slice(0,3)+"1"            
            gnames[1] = gnames[1].slice(0,3)+"2"
        }
        
        guilds[0].gname = gnames[0]
        guilds[1].gname = gnames[1]
        
        embed = {
            title: "**"+guilds[0].name+"** ("+gnames[0]+")\n *-vs-* \n**"+guilds[1].name+"** ("+gnames[1]+")",
            description: "`"+"-".repeat(32)+"`\n",
            color: 0x666666,
            footer: {
                text: "Calculated"
            },
            timestamp: new Date(),
            fields:[]
        }
        
        const squads = [
            [["JEDIKNIGHTREVAN","GENERALKENOBI","JOLEEBINDO","GRANDMASTERYODA"],["BASTILASHAN","HERMITYODA","EZRABRIDGERS3"]],
            [["DARTHTRAYA","DARTHSION","DARTHNIHILUS","GRANDADMIRALTHRAWN"],["EMPERORPALPATINE","BASTILASHANDARK","SITHTROOPER"]],
            [["BOSSK","BOBAFETT","GREEDO"],["IG88","AURRA_SING"]],
            [["COMMANDERLUKESKYWALKER","HANSOLO","CHEWBACCALEGENDARY"],["R2D2_LEGENDARY","OLDBENKENOBI"]],
            [["QIRA","ENFYSNEST"],["ZAALBAR","L3_37","YOUNGCHEWBACCA","YOUNGHAN"]],
            [["MOTHERTALZIN","ASAJVENTRESS","DAKA"],["NIGHTSISTERZOMBIE","NIGHTSISTERACOLYTE","NIGHTSISTERSPIRIT"]]
        ]

        let adv = {}
        squads.forEach(s => {

            let result = {}

            let field = {
                name: "**"+s[0].map(u => unitIndex.find(ui => ui.defId === u).name).join("**\n**")+"**\n*"+s[1].map(u => unitIndex.find(ui => ui.defId === u).name).join("*\n*")+"*",
                value: graph( gnames ).start,
                inline:true
            }

            for( let gm = 0; gm < guilds.length; ++gm ) {

                let ready = false
                ready = players[gm].reduce((sum,p) => {
                    return sum + (p.roster.filter(u => s[0].includes(u.defId) && u.level === 85).length + p.roster.filter(u => s[1].includes(u.defId) && u.level === 85).length >= 5 ? 1 : 0)
                },0) || 0
                result.ready = result.ready || []
                result.ready.push(ready)
                
                result.star7 = result.star7 || []
                result.star7.push( players[gm].reduce((sum,p) => {
                    return sum + (p.roster.filter(u => s[0].includes(u.defId) && u.rarity === 7).length + p.roster.filter(u => s[1].includes(u.defId) && u.rarity === 7).length >= 5 ? 1 : 0)
                },0) || 0 )
            
                result.gear11plus = result.gear11plus || []
                result.gear11plus.push( players[gm].reduce((sum,p) => {
                    return sum + (p.roster.filter(u => s[0].includes(u.defId) && u.gear >= 11).length + p.roster.filter(u => s[1].includes(u.defId) && u.gear >= 11).length >= 5 ? 1 : 0)
                },0) || 0 )
                
                result.zetad = result.zetad || []
                result.zetad.push( players[gm].reduce((sum,p) => {
                    return sum + (p.roster.filter(u => s[0].includes(u.defId) && ( u.skills.filter(s => s.isZeta).length === u.skills.filter(s => s.isZeta && s.tier === 8).length ) ).length === s[0].length ? 1 : 0)
                },0) || 0 )
                
                
                
            }

            field.value += graph( gnames ).insert( "Total squads", result.ready[0], result.ready[1] )
            field.value += graph( gnames ).insert( "7-star ready", result.star7[0], result.star7[1] )
            field.value += graph( gnames ).insert( "G11+ ready", result.gear11plus[0], result.gear11plus[1] )
            field.value += graph( gnames ).insert( "Full zetas", result.zetad[0], result.zetad[1] )
            field.value += graph( gnames ).end

            let advantage = result.gear11plus[0] + result.star7[0] + (result.zetad[0]*2) > result.gear11plus[1] + result.star7[1] + (result.zetad[1]*2)
                ? gnames[0] 
                : result.gear11plus[0] + result.star7[0] + (result.zetad[0]*2) < result.gear11plus[1] + result.star7[1] + (result.zetad[1]*2)
                    ? gnames[1]
                    : "equal"
                    
            adv[advantage] = adv[advantage] || 0
            adv[advantage]++
    
            field.value += "`Advantage => "+ advantage +"`\n"
            field.value += graph( gnames ).end
        
            embed.fields.push( field )
            
        })
        
        let scored = Object.keys(adv).filter(a => a !== 'equal').sort((a,b) => adv[b] - adv[a])

        let advout = !scored[0] && !scored[1]
            ? "equal"
            : scored[0] && !scored[1] 
                ? guilds.find(g => g.gname === scored[0]).name 
                : adv[scored[0]] === adv[scored[1]] 
                    ? "equal" 
                    : adv[scored[0]] > adv[scored[1]] 
                        ? guilds.find(g => g.gname === scored[0]).name 
                        : guilds.find(g => g.gname === scored[1]).name 
                
        embed.description += "**Required unit**\n*Optional unit*\n"
        embed.description += "`"+"-".repeat(32)+"`\n"

        embed.fields.push({
            name:"__**Final Advantage**__ ",
            value:"```\n"+advout+"\n```\n",
            inline:false
        })
        
        //Final Report
        MESSAGE = await MESSAGE.edit({embed})
        MESSAGE = null
        
    } catch(error) {
        console.error(error)
        await Bot.discord.util.reply.error(message, error, MESSAGE)
        MESSAGE = null
    }
    
}

const soi = [
    "HOUNDSTOOTH",
    "XANADUBLOOD",
    "SITHBOMBER",
    "IG2000",
    "JEDISTARFIGHTERANAKIN"
]

const graph = ( guildNames ) => {
    let blank = "-"
    let space = " "
    let n1 = space+guildNames[0]+space
    let n2 = space+guildNames[1]+space
    let spacer = blank.repeat(26 - n1.length - n2.length >= 0 ? 26 - n1.length - n2.length : 0)
    return {
        start: "`"+spacer+n1+blank+n2+"`"+"\n",
        title: "`"+spacer+n1+blank+n2+"`"+"\n",
        insert: ( label, v1, v2 ) => {
            let vo1 = space.repeat(n1.length - v1.toString().length -1 >= 0 ? n1.length - v1.toString().length -1 : 0) + v1.toString() + space
            let vo2 = space.repeat(n2.length - v2.toString().length -1 >= 0 ? n2.length - v2.toString().length -1 : 0) + v2.toString() + space
            let logical = v1 > -1 && v2 > -1 ? v1 > v2 ? ">" : v1 < v2 ? "<" : "=" : ""
            label += space.repeat(spacer.length - label.length -1 > 0 ? spacer.length - label.length -1 : 0)
            return "`"+label+space+vo1+logical+vo2+"`"+"\n"
        },
        end: "`"+"-".repeat(28)+"`\n"
    }

}

module.exports = {
    help:help,
    command:command
}
