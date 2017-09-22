# SimpleSpoofNinja 
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/Ninja.png" height="150" />

A Simple Anti-Spoofing Discord bot for PokemonGo

In action for <b>SeattlePokeMaps</b><br />
-Alerts are triggered (with image) when <br />
-- someone joins the server while in a spoofing server, or<br />
-- someone joins a spoofing server while being in their server.<br />
<img src="https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/img/SpoofNinja.png" />

-I am **NO** a ["javascript","discord.js"] expert so I bet there are people out there that can make something better.

# REQUIREMENTS:
1) Node.js https://nodejs.org/en/download/  

2) Discord.js (npm install discord.js) 

3) Discord.js (npm install fs) 

4) A Discord dummy account

5) A dedicated Discord channel in your server (IE: #modlog/#mod-log/#spoofers/#noobs)

6) A Discord webhook url, for the channel above

7) User permisions to read messages, for the dummy account, to the channel above.

# SETTING IT UP:
1) MAKE SURE YOU MEET THE REQUIREMENTS ABOVE

2) Change IP-address (using proxy or vpn) in order to:
» Log into your dummy account, and set your status/visibility to: INVISIBLE

» Join all the spoofing servers using the invite codes in config.json<br />
-- most spoofing servers will have your IP banned already, they don't like mappers, but they like to scrape mapper's data<br />
-- and if you try to join their server you will be wasting the new dummy account and will need another<br />
-- if any of the code say "INVITE EXPIRED" you might be banned already - your proxy/new_ip address didnt work

» Logout of the dummy account

3) Go back to your regular connection or IP-address

4) LAUNCH THE SCRIPT
- Using command prompt or bash: node spoofninja.js<br />
-- The dummy account will not get banned as long as you DO NOT log into it using Discord app or browser<br />
-- If you close that window, the bot connection will be terminated<br />
Optional: you can install <b>PM2</b> in order to have it running in the background (instructions below)

# PM2:
PM2 allows you to run processes/scripts in the background, you can access PM2 from anywhere, 
but for a process/script to first start the command needs to be run from the folder where the files are.

### To install PM2:
npm install pm2 -g

### To start the bot, using command prompt
pm2 start spoofninja.js

### To watch it in action (logs)
pm2 log

-If you would like to modify the file and keep it up-to-date while it's running - instead of stopping the bot, and restarting it again...
» you can start/restart a process/script using "--watch"

pm2 start spoofninja.js --watch

### Other Commands:

pm2 list (display a list of running processes)

pm2 stop NAME/ID (stops the process)

pm2 kill (stops pm2)
