module.exports = {
	
    //SWAPI config
	"swapi":{
      	"mongo":{
	        "user":"YOUR_DB_USER",
	        "pass":"YOUR_DB_PASS",
	        "host":"YOUR_DB_HOST",
	        "port":27017,
	        "auth":"?authSource=YOUR_AUTH_DB",
	        "db":"swapi"
      	},
      	"api":{
	        "username":"YOUR_API_USER",
	        "password":"YOUR_API_PASS",
        	"language":"eng_us"
      	}
    },

	//DISCORD config
	"discord":{
        "debug":true,
	    "token":"YOUR_DISCORD_BOT_TOKEN",
	    "prefix":"!",
        "master":[ "DISCORD_ID" ],	
	    "blacklist":["DISCORD_ID"],
	    "commands":{
	        "help_commands":{
	            "help":"This help menu",
	            "invite": "Invite this bot",
                "swgoh": "SWGoH bots and tools",
                "discord": "SWGoH related discords",
                "support": "Support me on patreon",
	        },
	        "utilities":{
	            "raw":"Data for your tools",
	            "add":"Register your allycode",
	            "rem":"Unregister your allycode",
	            "whois":"Lookup by mention or allycode",
                "translate": "Google translate"
            },
	        "player_commands":{
	            "p":"Player details",
	            "pz":"Player zetas",
	            "ps":"Player-ship details",
	            "pc":"Player-character details",
	            "pca":"Player-character arena",
	            "psa":"Player-ship arena",
	            "z":"Zeta recommendations",
	        },
	        "guild_commands":{
	            "g":"Guild details",
	            "gz":"Guild zetas",
	            "gs":"Guild-ship details",
	            "gc":"Guild-character details",
	            "gvs":"Guild-vs-guild summary",
	            "gvu":"Guild-vs-guild units of interest",
            },
	        "hidden":{
	            "status":true
	        }
	    }
	}
}
