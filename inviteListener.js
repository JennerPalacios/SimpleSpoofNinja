//
//		CHECK THE LINE BELOW...DO THESE MAKE NO SENSE? ARE THEY RANDOM CHARACTERS?
//
// 		🔴 📵 🗨 📗 🗒 📜 📋 📝 📆 📲 👤 👥 🤖 📥 📤 ✅ ⚠ ⛔ 🚫 ❌ 🔨 🙂 😮 😁 😄 😆 😂 😅 😛 😍 😉 🤔 👍 👎 ❤
//
//		THEN YOU NEED TO ADJUST YOUR SETTINGS!!! "Encoding" » "Encode in UTF-8"
//		... BECAUSE THESE ARE ACTUAL IN-TEXT EMOJIS (WHICH DISCORD ALSO USES)
//
const Discord=require('discord.js');
// const bot=new Discord.Client({fetchAllMembers: true});		//SLOW LOAD - GET OVER 1B USERS (FROM ALL SERVERS
const bot=new Discord.Client();		// FAST LOAD - GET ACTIVE USERS ONLY
const config=require('./files/config.json');
const servers=require('./files/servers.json'); 

const sql = require("sqlite");
sql.open("./files/invites.sqlite");



// GRAB THE SPOOFING SERVERS FROM JSON AND REFORMAT IT
spoofServers=servers.servers; myServer=config.myServer;

// GRAB WEBHOOK FROM CONFIG.JSON AND REFORMAT IT
let webhook=config.webhook; webhook=webhook.split("webhooks"); webhook=webhook[1]; webhook=webhook.split("/");
	webhookID=webhook[1]; webhookToken=webhook[2]; 
// DIRECT CALL TO THE WEBHOOK
const WHchan=new Discord.WebhookClient(webhookID,webhookToken);


// START SCRIPT
bot.on('ready', () => {
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	let timeStampSys="["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"] ";
	
	console.info('-- DISCORD SpoofNinjaBOT IS READY --');
	
	console.info(timeStampSys+"I have loaded "+spoofServers.length+" Spoofing Servers");
	
	// SET BOT AS INVISIBLE = NINJA <(^.^<) 
	bot.user.setPresence({"status":"invisible"});
	
	sql.run("CREATE TABLE IF NOT EXISTS inviteCodes (serverName TEXT, serverID TEXT, inviteCode TEXT, publishDate TEXT)").catch(console.error);
});



//
//				DEFINE GLOBAL AND COMMON VARIABLES
//
var serverCount, serverName, slackmsg;


//
//				FUNCTION: CHECK USER "ONJOIN" USING JSON FILE - VIA VARIABLE/FUNCTION
//
function getServName(serverID){
	serverCount="";
	for(serverCount="0"; serverCount < spoofServers.length; serverCount++){
		if(spoofServers[serverCount].server===serverID){
			return spoofServers[serverCount].name
		}
	}
}



// ##########################################################################
// ############################## TEXT COMMANDS #############################
// ##########################################################################
bot.on('message', message => { 
	
	// TIME AND DATE FOR TIMESTAMP IN LOGS - COMMANDLINE AND DISCORD MODLOG
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	let timeStamp="`"+yr+"/"+mo+"/"+da+"` **@** `"+hr+":"+min+":"+sec+"`";let timeStampSys="["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"] ";
	let tsdb=yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec;
	
	
	
// ############################## INVITE LISTENER ##############################
	let invLinks=message.content.match(/discord.gg/g);
	if(invLinks){
		let servName=getServName(message.guild.id); if(!servName){servName="WAPokeMap"}
		invPos=message.content.indexOf("discord.gg");invStart=invPos+11; invEnd=invPos+18;
		let invCode=message.content.slice(invStart,invEnd);
		
		
		// sql.run("CREATE TABLE IF NOT EXISTS inviteCodes (serverName TEXT, serverID TEXT, inviteCode TEXT, publishDate TEXT)").catch(console.error);
		sql.get(`SELECT * FROM inviteCodes WHERE inviteCode="${invCode}"`).then(row => {
			if (!row) {
				sql.run("INSERT INTO inviteCodes (serverName, serverID, inviteCode, publishDate) VALUES (?, ?, ?, ?)",
					[servName, message.guild.id, invCode, tsdb]);
				let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
				slackmsg={
					'username': config.botName,
					'avatarURL': config.botAvatar,
					'embeds': [{
						'color': parseInt(daColor),
						'description': '✅ **NEW Invite Link Was Shared** 👍\n**In Server**: '+servName+'\n**Invite Code**: '+invCode+'\n`-- saved to database --`'
						}]
					};
				return WHchan.send(slackmsg).catch(console.error);
			}
			else {
				let daColor=config.dangerColor; daColor=daColor.slice(1); daColor="0x"+daColor;
				slackmsg={
					'username': config.botName,
					'avatarURL': config.botAvatar,
					'embeds': [{
						'color': parseInt(daColor),
						'description': '⛔ Invite code received, but **already exist** in my DataBase'
						}]
					};
				// return WHchan.send(slackmsg).catch(console.error);
			}
		}).catch(console.error);
		
		let daColor=config.warningColor; daColor=daColor.slice(1); daColor="0x"+daColor;
		slackmsg={
			'username': config.botName,
			'avatarURL': config.botAvatar,
			'embeds': [{
				'color': parseInt(daColor),
				'description': '🤔 **Invite Link Was Shared** 🤔\n**In Server**: '+servName+'\n**Invite Code**: `'+invCode+'`'
				}]
			};
		// return WHchan.send(slackmsg).catch(console.error);
	}
	
	
	
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT CMDCHANID AKA COMMAND CHANNEL ID AKA MODLOG
	if(message.channel.id===config.cmdChanID){
		
		// IGNORE REGULAR CHAT
		if(!message.content.startsWith(config.prefix)){ return }
		
		if(config.logAll==="yes"){ console.info("[CONFIG_LOG_ALL] Command typed in CommandChannel (config.json » cmdChanID)"); }
		
		// DEFINE SHORTER DISCORD PROPERTIES
		let g=message.guild; let c=message.channel; let m=message.member;let msg=message.content;
		let command=msg.toLowerCase(); command=command.split(" ")[0]; command=command.slice(1);
		args=msg.split(" ").slice(1);
		
		// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
		let adminRole=g.roles.find("name", config.adminRoleName); if(!adminRole){adminRole=""}
		let modRole=g.roles.find("name", config.modRoleName); if(!modRole){modRole=""}
		
		
		
		// COMMAND: !HELP
		if(command==="bug" || command==="feedback"){
			if(m.roles.has(adminRole.id) || m.roles.has(modRole.id) || m.user.id===config.ownerID){
				let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
				if(command==="bug"){
					slackmsg={'username': 'JennerPalacios','avatarURL': config.botAvatar,'embeds': [{
					'color': parseInt(daColor),'description': 'Your `BugReport` has been recorded! Stay tuned <(^.^<)'}]};
					sharedWH.send("⚠ [BUG_REPORT] on "+timeStamp+"\n**By: **"+m.user.username+"[`"+m.user.id+"`]\n**From: **"+config.myServer.name+"[`"+config.myServer.invite+"`]\n```\n"+message.content.slice(4)+"\n```");
					return WHchan.send(slackmsg).catch(console.error);
				}
				slackmsg={'username': 'JennerPalacios','avatarURL': config.botAvatar,'embeds': [{'color': parseInt(daColor),'description': 'Thanks for your feedback <(^.^<)'}]};
				sharedWH.send("✅ [FEEDBACK] on "+timeStamp+"\n**By: **"+m.user.username+" [`"+m.user.id+"`]\n**From: **"+config.myServer.name+"[`"+config.myServer.invite+"`]\n```\n"+message.content.slice(9)+"\n```");
				return WHchan.send(slackmsg).catch(console.error);
			}
		}


		// RESTART THIS MODULE
		if(command==="restart" && m.id===config.ownerID && args[0]==="il"){
			process.exit(1)
		}
	}
});

// BOT LOGIN TO DISCORD
bot.login(config.token);

// BOT DISCONNECTED
bot.on('disconnected', function (){
		console.log('Disconnected.');console.log(console.error);
		process.exit(1);
});