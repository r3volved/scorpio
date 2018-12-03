const util = require('util')

const help = async ( message ) => {
    const cmd = message.prefix+message.command;
	const embed = {
        title : OUTPUT["google-translate"].help.title,
        description : util.format(OUTPUT["google-translate"].help.description, cmd, cmd),
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[]
    }
    message.channel.send({embed})
}


const command = async ( message ) => {

    let MESSAGE = null
    
	// $translate me french 3

    try {

        let user = message.parts.slice(2).find(p => p.match(/\d{17,18}/) || p === 'me')
            user = user ? user.replace(/[\<\@\!\>]/g,'') : user
            user = !user || user === 'me' ? message.author.id : user.replace(/[\<\@\!\>]/,'')

        if( !user ) { 
            return message.reply( OUTPUT["google-translate"].error.noUser )
        }

        let authorName = await fetchDiscordUser( user );
        if( !authorName ) { 
            return message.reply( OUTPUT["google-translate"].error.noAuthor )
        } 

        
        let language = message.parts.slice(2).find(p => !Number(p) && p !== 'me' && !p.includes(user))
        if( !language ) { 
            return message.reply( OUTPUT["google-translate"].error.noLanguage )
        }

        let num = message.parts.slice(2).find(p => Number(p)) || 1

        // GET MESSAGES
        let filteredMessages = await fetchMessages( message, user, num )
        if( !filteredMessages ) { 
            return message.reply( OUTPUT["google-translate"].error.noMessages )
        } 


        // PARSE FILTERED MESSAGES
        let ogcontent = "";
        for( let x = filteredMessages.length - 1; x >= 0; --x ) {
            ogcontent += `${filteredMessages[x].content}\n`;
        }


        // Translate ogcontent
        let translationResult = null;
        try {
            const translate = require('google-translate-api');
            translationResult = await translate(ogcontent, {to: language});
        } catch(e) { 
            Report.error(e)
            return message.reply( e.message )
        }
        
        if( !translationResult || !translationResult.text ) { 
            return message.reply( OUTPUT["google-translate"].error.noTranslations )
        }
         
        if( translationResult.text.length > 2000 ) { 
            return message.reply( OUTPUT["google-translate"].error.tooLong )
        } 

        
        const embed = {
            title : util.format(OUTPUT["google-translate"].command.title, num, authorName),
            description : '`------------------------------`\n',
            color: 0x5884B5,
            footer: {
              text: translationResult.from.language.iso+' => '+language
            },
            timestamp: new Date(),
            fields:[]
        }
        
	    embed.description += translationResult.text+'\n';
	    embed.description += '`------------------------------`\n';

	    message.react('ℹ');
	    message.channel.send({embed})
    
    } catch(e) {
        Report.error(e)
        Bot.discord.util.reply.error(message, e)
    }
}


async function fetchDiscordUser( discordId ) {

    return new Promise((resolve, reject) => {
    
    	Bot.discord.client.fetchUser(discordId).then( (user) => {
             if( !user || !user.username ) { resolve(false) }
             resolve(user.username)
        }).catch((err) => {
             resolve(null)
        })
    
    })
    
}

async function fetchMessages( message, discordId, numMsgs ) {
    
    return new Promise((resolve, reject) => {
       
    	message.channel.fetchMessages({before:message.id}).then( (messages) => {

	        if( !messages || messages.length == 0 ) { resolve(false); }

	        let filteredMessages = messages.filter(m => m.author.id === discordId && !m.content.startsWith(Bot.config.discord.prefix)).first(Number(numMsgs))
	        if( !filteredMessages || filteredMessages.length == 0 ) { resolve(false) }

	        resolve( filteredMessages )
	        
	    }).catch((err) => {
	        resolve(null)
	    })

    })
    
}


module.exports = {
    help:help,
    command:command
}
