# SimpleSpoofNinja 
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/Ninja.png" height="150" />

A Simple Anti-Spoofing Discord bot for PokemonGo

**EXAMPLE:**<br />
Here you can see it in action for <b>SeattlePokeMaps</b><br />
Alerts are triggered (with image) when 
   * someone joins your server while in a spoofing server, or 
   * someone joins a spoofing server while being in your server.<br />
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/SpoofNinja.png" height="400" />
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/SpoofCheck.png" />

-I am **NO** a ["javascript","discord.js"] expert so I bet there are people out there that can make something better.<br />
See it in action at my Discord server: https://discord.gg/2BGCV2K 

<hr />
# REQUIREMENTS:
1) Node.js (https://nodejs.org/en/download/ `ver 8.4+`)

2) Discord.js (`npm install discord.js` « should be `ver 12.2+`) 

3) File-System (`npm install fs`) 

4) A Discord dummy account

5) A dedicated Discord channel in your server (IE: #modlog/#mod-log/#spoofers/#noobs)

6) A Discord webhook url, for the channel above

7) User permisions to read messages, for the dummy account, to the channel above.

<hr />
# SETTING IT UP:
1. MAKE SURE YOU MEET THE REQUIREMENTS ABOVE

2. Change IP-address (using proxy or vpn) in order to:
    1. Log into your dummy account, and set your status/visibility to: **INVISIBLE**
    2. Join **all** the spoofing servers using the invite codes in `servers.json`
        * most spoofing servers will have your IP banned already, they don't like mappers, but they like to scrape mapper's data - and if you try to join their server you will be wasting the new dummy account and will need another
        * if any of the code say "**INVITE EXPIRED**" you might be banned already - your proxy or ipaddress didnt work
        * **EDITED** PRIVATE MESSAGE ME HERE OR DISCORD FOR INVITE CODES, IT APPEARS SPOOFINGSERVER-OWNERS ARE DELETING THE INVITE CODES AND KICK/BANNING PEOPLE USING THEM.
    3. GET the **Dummy Account's Token**, which will be **required** for the script to run (check users `onJoin` and `commands`)
        * This is not a **UserBot** nor **DiscordApp**; this is an actual discord [`dummy/alternate`] **account** - specifically created and used by this script; DiscordApps, even when UserBot (aka `App Bot User`) is enabled it **DOES NOT** work, as they have to independently invited by the admins at each spoofing server - in other words: impossible to use.
        * **HOW TO GET TOKEN**?:
        * Using your browser or discord, while logged into the dummy account, do the shortcut key combination:
        [`CTRL`]+[`SHIFT`]+[`I`] - this should open Developer's Console **Application** and follow screenshot below in order to get the **Token**:
    <img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/Token.jpg" height="300" />
    
3. Logout of the dummy account

4. Go back to your regular connection or IP-address

5. Modify `config.json` 

6. LAUNCH THE SCRIPT
    1. Using command prompt or bash: `node spoofninja.js`
        * The dummy account will not get banned as long as you DO NOT log into it using Discord app or browser
        * If you close that window, the bot connection will be terminated
        * Optional: you can install **PM2** in order to have it running in the background (instructions below)

<hr />
# COMMANDS

1. `!check @mention/user_id` - use a `@mention` or `user_id`, ie:
  * `!check @JennerPalacios`
  * `!check 237597448032354304`

2. `!check server` - to check entire server, for online users and invisible users; users that are currently logged in - not the entire list of users that are registered to the server.

3. `!suggest` - to suggest a feature, command, etc... ie:
  * `!suggest a way to order pizza`

4. `!feedback` - to offer feedback, comments, concerns, etc... ie:
  * `feedback not bad you noOb, but you can do better`

<hr />
# PM2:
PM2 allows you to run scripts in the background, you can access PM2 from anywhere (any folder, using `cmd` prompt), <br />
but for the first launch, the command needs to be run from the folder where the files are located.

### To install PM2:
`npm install pm2 -g`

### To start the bot, using command prompt
`pm2 start spoofninja.js`

### To watch it in action (logs)
`pm2 log`

-If you would like to modify the file and keep it up-to-date while it's running - instead of stopping the bot, and restarting it again...<br />
» you can start/restart a process/script using "`--watch`"<br />

`pm2 start spoofninja.js --watch`

### Other Commands:

`pm2 list` (display a list of running processes)

`pm2 stop <NAME/ID>` (stops the process)

`pm2 kill` (stops pm2)
