module.exports = {
	
    //SWAPI config
	"swapi":{
      	"mongo":{
	        "user":"YOUR_DB_USER",
	        "pass":"YOUR_DB_PASS",
	        "host":"YOUR_DB_HOST",
	        "port":27017,
	        "auth":"?authSource=YOUR_ADMIN_DB",
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
	    "token":"YOUR_BOT_TOKEN",
	    "prefix":"$",
        "master":[ "YOUR_DISCORD_ID" ],	
	    "blacklist":"/config/data/blacklist.json",
	    "premium":"/config/data/premium.json",
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
	            "ggp":"Guild details by GP",
	            "gvs":"Guild-vs-guild summary",
	            "gvu":"Guild-vs-guild units of interest",
	            "tb":"List guild members by unit",
            },
            "premium_commands":{
                "vsu":"G-vs-G Units of interest",
                "vss":"G-vs-G Squads of interest"
            },
	        "hidden":{
	            "status":true,
	            "premium":true,
	            "blacklist":true,
	        }
	    }
	}
}
