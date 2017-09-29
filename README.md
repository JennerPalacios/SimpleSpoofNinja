# SimpleSpoofNinja 
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/Ninja.png" height="150" />

A Simple Anti-Spoofing Discord bot for PokemonGo

In action for <b>SeattlePokeMaps</b><br />
-Alerts are triggered (with image) when <br />
-- someone joins the server while in a spoofing server, or<br />
-- someone joins a spoofing server while being in their server.<br />
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/SpoofNinja.png" />
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/SpoofCheck.png" />

-I am **NO** a ["javascript","discord.js"] expert so I bet there are people out there that can make something better.<br />
See it in action at my Discord server: https://discord.gg/2BGCV2K 

# REQUIREMENTS:
1) Node.js https://nodejs.org/en/download/  

2) Discord.js (npm install discord.js) 

3) File-System (npm install fs) 

4) A Discord dummy account

5) A dedicated Discord channel in your server (IE: #modlog/#mod-log/#spoofers/#noobs)

6) A Discord webhook url, for the channel above

7) User permisions to read messages, for the dummy account, to the channel above.

# SETTING IT UP:
1. MAKE SURE YOU MEET THE REQUIREMENTS ABOVE

2. Change IP-address (using proxy or vpn) in order to:
  1. Log into your dummy account, and set your status/visibility to: **INVISIBLE**
  2. Join **all** the spoofing servers using the invite codes in `config.json`
    * most spoofing servers will have your IP banned already, they don't like mappers, but they like to scrape mapper's data
    * and if you try to join their server you will be wasting the new dummy account and will need another
    * if any of the code say "**INVITE EXPIRED**" you might be banned already - your proxy or ipaddress didnt work
  3. GET the **Dummy Account's Token**, which will be needed for the script to run (check users `onJoin` and `commands`)
    * This is not a **USERBOT** nor **DiscordApp**; this is an actually discord dummy account specifically created and used by this script
    * **HOW TO GET TOKEN**?:
    * Using your browser or discord, while logged into the dummy account, do the shortcut key combination:
    [`CTRL`]+[`SHIFT`]+[`I`] - this should open Developer's Console **Application** and follow screenshot below in order to get the **Token**:
    <img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/Token.jpg" height="300" />
    
3. Logout of the dummy account

4. Go back to your regular connection or IP-address

5. LAUNCH THE SCRIPT
  1. Using command prompt or bash: node spoofninja.js<br />
    * The dummy account will not get banned as long as you DO NOT log into it using Discord app or browser<br />
    * If you close that window, the bot connection will be terminated<br />
  * Optional: you can install <b>PM2</b> in order to have it running in the background (instructions below)

# PM2:
PM2 allows you to run processes/scripts in the background, you can access PM2 from anywhere, <br />
but for a process/script to first start the command needs to be run from the folder where the files are.

### To install PM2:
npm install pm2 -g

### To start the bot, using command prompt
pm2 start spoofninja.js

### To watch it in action (logs)
pm2 log

-If you would like to modify the file and keep it up-to-date while it's running - instead of stopping the bot, and restarting it again...<br />
» you can start/restart a process/script using "--watch"

pm2 start spoofninja.js --watch

### Other Commands:

pm2 list (display a list of running processes)

pm2 stop NAME/ID (stops the process)

pm2 kill (stops pm2)
