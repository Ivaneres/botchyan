## Botchyan Discord bot for LAU server

This bot is used to verify new users joining the server and to look up old users' data.

# Commands
```
!help - sends the help message
!whois username - shows a user's real name, university and if they've graduated
!stats - shows server role stats
!addself full name - adds user who sent the command to the whois database
```

# Settings
Stored in settings.json
```
cmdkey: bot command prefix
helloMessages: the messages the bot will send to new users during verification
verifChannel: the admin channel where new users' profiles are sent when they finish verification
roles: the roles which are displayed by !stats and otherwise used by the bot
uniColours: used by whois embeds
statsChannels: the bot will send role stats to these channels every 10 seconds
unis: valid uni names
```

# Installation
Clone, run `npm i`, then use `node start.js` to start.
