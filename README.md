# scorpio
Discord bot for Star Wars Galaxy of Heroes - Integrated api-swgoh-help with mongodb caching layer

## Required ##
Node 8+
MongoDB 

```
npm install
```

## Config ##
Three configs are provided for development, test and production bots
Update the configs with your Discord, Mongo and API credentials

```
/config/bots/development.js
/config/bots/test.js
/config/bots/production.js
```

If not specified, config will default to development.
To run each instance:

### Development ###

```
node bot.js
```

### Test ###

```
NODE_ENV=test node bot.js
```

### Production ###

```
NODE_ENV=production node bot.js
```


## Commands ##
Discord commands are located in the DISCORD core and mapped in index.js
Your config files will drive the command loading - add or remove commands from your configs to enable or disable them respectively

```
/core/DISCORD/commands/index.js
```


## Localization ##
Localization strings are provided in order to run your bot with a specific language.
Language is specified in your config api section. The swapi core will fetch data and the discord core will present data in your specified language

```
/localization
```

