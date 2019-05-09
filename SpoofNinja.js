//
//		CHECK THE LINE BELOW...DO THESE MAKE NO SENSE? ARE THEY RANDOM CHARACTERS?
//
// 		🔴 📵 🗨 📗 🗒 📜 📋 📝 📆 📲 👤 👥 🤖 📥 📤 ✅ ⚠ ⛔ 🚫 ❌ 🔨 🙂 😮 😁 😄 😆 😂 😅 😛 😍 😉 🤔 👍 👎 ❤
//
//		THEN YOU NEED TO ADJUST YOUR SETTINGS!!! "Encoding" » "Encode in UTF-8"
//		... BECAUSE THESE ARE ACTUAL IN-TEXT EMOJIS (WHICH DISCORD ALSO USES)
//
const Discord=require('discord.js');
const fs=require('fs');
const request = require("request");
const serversFile=require('./files/servers.json'); 
const spoofServers=serversFile.servers;
const moderatorBot=new Discord.Client();
//
//		PICK ONE BELOW, ONLY ONE CAN BE ENABLED, THE OTHER ONE MUST BE COMMENTED-OUT BY ADDING "//" AT THE BEGINNING
//		"SLOW LOAD" IS RECOMMENDED WHEN LAUNCHING THE BOT FOR THE FIRST TIME, IT GRABS ALL USERS FROM ALL SERVERS
//
const bot=new Discord.Client({fetchAllMembers: true}); //		SLOW LOAD - GET OVER 1B USERS (FROM ALL SERVERS)
//const bot=new Discord.Client();	//																	FAST LOAD - GET ACTIVE USERS ONLY
//
//
//



//
//		DEFINE GLOBAL AND COMMON VARIABLES
//
var config=require('./files/config.json');		// CONFIG FILE
	config.botVersion="3.1";					// LOCAL VERSION


var minsUntilPunished=1;						// <---- SPOOF NINJA TIMER, HOW LONG UNTIL KICK/BAN IF ENABLED.


var serverCount, noobFound, serverFound, noobJoined, ownServer, embedMSG, myServerFound, webhook, daServers="",
	myServer=config.myServer, spoofNinja=config.spoofNinja, embedSettings=config.embedSettings;
var spooferFlag=myServer.onSpooferFound;
//
//
//



// GRAB WEBHOOK FROM CONFIG.JSON AND REFORMAT IT
var webhook=myServer.webhook; webhook=webhook.split("webhooks"); webhook=webhook[1]; webhook=webhook.split("/");
var webhookID=webhook[1], webhookToken=webhook[2];
	
// DIRECT CALL TO THE WEBHOOK
const spoofNinjaWh=new Discord.WebhookClient(webhookID,webhookToken);
const globalNinjaWh=new Discord.WebhookClient("365806668119932928","xe5pRZUvE8ADXDBpNESBsfK7RXT9UmQVOzxaJTjwkj3nmo2IBJEbPlCCl0LJ3Ope77Fo");
const botSupportWh=new Discord.WebhookClient("365826527822348290","Z0HAX79QHpNDkyK1hF_FVM5o0LcZ1-tFhoK1o2-HlWA6Ogk9P3MyA2vuGMm_Umyso-oA");

globalNinjaWh.send(timeStamp(2)+" Gratz! **"+myServer.name+"** started using **SpoofNinja**").catch(err=>{console.info(timeStamp()+" [ERROR L:55] "+err.message)});



//
//				CHECK IF INFO/WEBHOOK IS BEING SHARED
//
if(config.botSupport==="yes"){
	globalNinjaWh.send(timeStamp(2)+"Yay! **"+myServer.name+"** has joined the fight, has **SHARED** their info, and wants to stay up-to-date <(^.^<)... Awesome! we have received their info <(^.^)>")
	botSupportWh.send(".\n"+timeStamp(2)+"**"+myServer.name+"** would like to get **UPDATES**!\n"
		+" » Their Owner: <@"+config.ownerID+">\n » Their Invite: `"+myServer.invite+"`\n » Their WH ID:`"+webhookID+"`\n » Their WH Token: `"+webhookToken+"`\n.");
}


//
//		FUNCTION: TIME STAMP
//
function timeStamp(type){
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	if(!type || type===0){
		// [YYYY/MM/DD @ HH:MM:SS]
		return "["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"]"
	}
	if(type===1) {
		// `MM/DD/YYYY` **@** `HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+"` **@** `"+hr+":"+min+":"+sec+"`"
	}
	if(type===2) {
		// `MM/DD/YYYY @ HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+" @ "+hr+":"+min+":"+sec+"`"
	}
	if(type===3) {
		// `YYYY/MM/DD` **@** `HH:MM:SS`
		return "`"+yr+"/"+mo+"/"+da+"` **@** `"+hr+":"+min+":"+sec+"`"
	}
	if(type===4) {
		// [YYYY/MM/DD @ HH:MM:SS]
		return "["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"]"
	}
}



//
//		PARSE COLORS FUNCTION
//
function parseColor(color){
	let tempColor=color; tempColor=tempColor.slice(1); tempColor="0x"+tempColor; return tempColor;
}



//
//		CHECK CONFIG FOR RIGHT INFO INPUT BY USER
//
if(!Number.isInteger(parseInt(spoofNinja.id))){ return console.info(".\n[ERROR] config.json » \"spoofNinja\" » \"id\" = wrong format, it needs to be numbers\n."); }
if(!Number.isInteger(parseInt(config.ownerID))){ return console.info(".\n[ERROR] config.json » \"ownerID\" = wrong format, it needs to be numbers\n."); }
if(!Number.isInteger(parseInt(myServer.id))){ return console.info(".\n[ERROR] config.json » myServer » \"id\" = wrong format, it needs to be numbers\n."); }
if(!Number.isInteger(parseInt(myServer.cmdChanID))){ return console.info(".\n[ERROR] config.json » \"spoofNinja\" » \"cmdChanID\" = wrong format, it needs to be numbers\n."); }




//
//		BOT SIGNED IN AND IS READY
//
bot.on('ready', () => {
	// SET BOT AS INVISIBLE = NINJA <(^.^<) 
	bot.user.setPresence({"status":"invisible"});
	
	console.info(timeStamp()+"-- DISCORD SpoofNinja, user: "+bot.user.username+", IS READY --");
	console.info(timeStamp()+" I have loaded "+spoofServers.length+" Spoofing Servers");
	
	let embedMSG={
		'username': spoofNinja.name,
		'avatarURL': spoofNinja.avatar,
		'embeds': [{
			'color': parseInt(parseColor(embedSettings.goodColor)),
			'description': 'I am ready to **scan** __this__ server against **'+spoofServers.length+'**-other **spoOfing** servers!'
		}]
	};
	spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:128]\n"+err.message)});
	
	// GET GITHUB VERSION
	request("https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/version.txt",
		function(error,response,body){
			if(error){console.info(error)}
			if(body){
				let gitHubVer=body.slice(0,-1); let timeLog=timeStamp(4);
				let verChecker="up-to-date"; if(gitHubVer!==config.botVersion){ verChecker="OUTDATED!" }
				console.info(
					timeLog+" GitHub [SpoofNinja] version: "+gitHubVer+"\n"
					+timeLog+" Local Bot ["+bot.user.username+"] version: "+config.botVersion+" -> "+verChecker+"\n"
					+timeLog+" Discord API [discord.js] version: "+Discord.version+"\n"
					+timeLog+" Node API [node.js] version: "+process.version
				)
			}
		}
	)
	
	// CHECK IF BOTSUPPORT IS ENABLED
	if(config.botSupport==="no"){console.info('[PLEASE NOTE]:\n'
		+'You should consider enabling "botSupport" in order to:\n'
		+'» Get notifications about updates for either:\n'
		+'-- SpoofNinja.js, servers.json, and/or config.json\n'
		+'» Direct replies in your server when using "!bug" reports\n'
		+'-- You\'ll be sharing your webhook in order for Jenner to reply\n'
		+'----------------------------------------------------------\n'
		+'» How to ENABLE it? very easy: \n'
		+'-- Edit config.json [L:14]: "botSupport": "yes"\n'
		+'----------------------------------------------------------\n');
	}
});



//
//				FUNCTION: CHECK USER "ONJOIN" USING JSON FILE - VIA VARIABLE/FUNCTION
//
function checkUser(userID,serverID){
	serverCount="";noobFound="";serverFound=[];
	
	// CHECK ALL SERVERS FROM SERVERLIST
	for(serverCount="0"; serverCount < spoofServers.length; serverCount++){
		
		// CHECK IF I'M IN EACH SERVER FIRST
		noobFound=bot.guilds.get(spoofServers[serverCount].server);
		
		// I'M IN THE SERVER NOW LOOK FOR THE NOOB
		if(noobFound){
			noobFound=bot.guilds.get(spoofServers[serverCount].server).members.get(userID);
			
			// I FOUND NOOB, NOW I CAN ADD THE SERVER TO THE LIST
			if(noobFound && spoofServers[serverCount].server!==serverID){
				serverFound.push(spoofServers[serverCount].name)
			}
		}
		
		// I'M NOT IN ONE OF THE SERVERS
		else {
			console.info(timeStamp()+" I am not in server: "+spoofServers[serverCount].name
				+" | Please join using invite code: "+spoofServers[serverCount].invite+"..."
				+" or remove line from servers.json and wait for github update");
		}
	}
	
	// CHECK PERSONAL SERVER IN CASE USER JOINS SPOOF SERVER AFTER JOINING MY SERVER
	noobFound=""; noobFound=bot.guilds.get(myServer.id);
	if(noobFound){
		noobFound=bot.guilds.get(myServer.id).members.get(userID);
		if(noobFound){
			myServerFound="yes";
		}
	}
	else {
		console.info(".\n[WARNING] I am not in your server yet, SILLY YOU! ["+myServer.name+"]...\nLog into DummyAccount and join YOUR SERVER!\n.");
	}
	
	// SEND DATA BACK TO VARIABLE
	return serverFound;
}



//
//				FUNCTION: JOINED SERVER USING JSON FILES
//
function checkJoined(serverID){
	serverCount="";noobJoined="";serverFound="";
	
	// CHECK IF SERVER JOINED IS MY SERVER
	if(serverID===myServer.id){
		noobJoined=myServer.name;
	}
	
	// IF NOT MY SERVER CHECK JSON FILE
	if(!noobJoined){
		for(serverCount="0"; serverCount < spoofServers.length; serverCount++){
			serverFound=spoofServers[serverCount].server;
			
			// MATCH SERVER ID WITH THE SERVER LIST AND GRAB NAME
			if(serverFound===serverID){
				noobJoined=spoofServers[serverCount].name;
			}
		}
	}
	
	// SEND DATA BACK TO VARIABLE
	return noobJoined;
}


// ##########################################################################
// ############################## MEMBER JOINS ##############################
// ##########################################################################
bot.on("guildMemberAdd", member => {

	let guild=member.guild, skipCheck="no"; myServerFound="no", daServers="";
	
	// USERNAMES REPLACE SPACE WITH UNDERLINE
	let user=member.user; let userNoSpace=user.username; let nuser=userNoSpace.split(/ +/);
		for(var xn="0";xn < nuser.length; xn++){ userNoSpace=userNoSpace.replace(" ","_"); }
	
	// CHECK IF USER IS IN A SPOOFING SERVER
	let spoofServersFound=checkUser(user.id,guild.id);
	
	// CHECK JOINED SERVER
	let serverJoined=checkJoined(guild.id);
	
	//
	//				IF USER IS NOT FOUND IN ANOTHER CHANNEL IGNORE - SINGLE JOIN FOR TEST
	//	
	if(spoofServersFound.length===0){
		if(serverJoined){
			if(config.consoleLog==="all"){
				console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has joined Server: "+serverJoined)
			}
		}
	}
	
	// STOP IF I DIDNT FIND USER IN JOINED SERVER
	if(!serverJoined){ return }
	
	
	//
	//				IF USER IS IN ANOTHER SPOOFER CHANNEL, ADD LINE: "OTHER CHANNELS: " WITH GATHERED CHANNELS
	//
	
	// ADD "OTHER SERVERS"+SERVERS	
	if(spoofServersFound.length>0){
		let daServersConsole=" || other servers: "+spoofServersFound.join(", ");
		daServers="\n**Other Servers**: "+spoofServersFound.join(", ");
		
		if(config.consoleLog==="all"){ console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has joined Server: "+serverJoined+daServersConsole); }
	}
	
	
	//
	//				POSTING TO MODLOG CHANNELS
	//
	if(myServerFound==="yes"){
		let whiteListedMembersIDs=[], whiteListedRoles=[];
			if(myServer.whiteListedMembersIDs.length>0){ whiteListedMembersIDs=myServer.whiteListedMembersIDs }
			if(myServer.whiteListedRoles.length>0){ whiteListedRoles=myServer.whiteListedRoles }
		
		// DO NOT POST FINDINGS FOR OWNER AND BOT
		if(member.id===spoofNinja.id || member.id===config.ownerID){
			if(config.consoleLog==="all" || config.consoleLog==="serverOnly" || config.consoleLog==="eventsOnly"){
				console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] Owner/Bot has joined server: "+guild.name)
			}
			return
		}
		
		// DO NOT POST FINDINGS FOR whiteListedRoles
		if(whiteListedRoles.length>0){
			let mRoleNames=bot.guilds.get(myServer.id).members.get(member.id).roles.map(r => r.name);
			if(mRoleNames.length>0){
				for(var urc="0"; urc < mRoleNames.length; urc++){
					if(myServer.whiteListedRoles.includes(mRoleNames[urc])){
						if(config.consoleLog==="all" || config.consoleLog==="serverOnly" || config.consoleLog==="eventsOnly"){
							console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has joined Server: "+guild.name+". But has whiteListedRole")
						}
						return
					}
				}
			}
		}
		
		// DO NOT POST FINDINGS FOR whiteListedMembersIDs
		if(whiteListedMembersIDs.length>0){
			for(var blUser="0";blUser < whiteListedMembersIDs.length; blUser++){
				if(member.id===whiteListedMembersIDs[blUser]){
					if(config.consoleLog==="all" || config.consoleLog==="serverOnly" || config.consoleLog==="eventsOnly"){
						console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has joined server: "+guild.name+". But is whiteListed")
					}
					return
				}
			}
		}
		//
		//				EMBED TEMPLATE WITH THUMBNAIL
		//
		embedMSG={
			'username': spoofNinja.name,
			'avatarURL': spoofNinja.avatar,
			'embeds': [{
				'thumbnail': {'url': embedSettings.snipeImg },
				'color': parseInt(parseColor(embedSettings.warningColor)),
				'description': '⚠ __**WARNING**__ ⚠\n**'
					+ userNoSpace+'** has joined: **'+serverJoined+'**\n**Tag/ID**: '+user+daServers+'\n**On**: '+timeStamp(1)
			}]
		};
		
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		if(config.consoleLog!=="all"){console.log(timeStamp()+" [consoleLog=all] "+userNoSpace+"("+member.id+") has joined Server: "
		+serverJoined+" || other Servers: "+spoofServersFound.join(", ")) }
		spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:352]\n"+err.message)})
		
		if(spooferFlag==="kick" || spooferFlag==="ban"){
			// TIMER
			setTimeout(function(){
				let tempMember=bot.guilds.get(myServer.id).members.get(member.id);
				if(!tempMember){
					return moderatorBot.channels.get(myServer.cmdChanID).send({embed:{'color':0x009900,'description':'<@'+member.id+'> has decided to leave our server instead.'}}).catch(err=>{console.info(timeStamp()+" [ERROR L:360]\n"+err.message)});
				}
				else {
					// CHECK IF USER IS IN A SPOOFING SERVER
					let spoofServersFoundAgain=checkUser(tempMember.id);
					if(spoofServersFoundAgain.length>0){
						// MODERATOR BOT POSTS TO COMMAND CHANNEL
						
						if(spooferFlag==="ban"){
							moderatorBot.channels.get(myServer.cmdChanID).send({
								embed:{'color':0xFF0000,'description':'<@'+tempMember.id+'> ignored the `warning` so they were **banned** 🔨'}
							}).catch(err=>{console.info(timeStamp()+" [ERROR L]\n"+err.message)});
							
							embedMSG={
								'color': 0xFF0000,
								'title': '⚠ ⛔ YOU HAVE BEEN BANNED ⛔ ⚠',
								'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/Poke-banned.png"},
								'description': '**From Server**: '+myServer.name+'\n**Reason**: Rule #1 violation; '
									+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **any** connection to '
									+' discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
							}
						}
						else {
							moderatorBot.channels.get(myServer.cmdChanID).send({
								embed:{'color':0xFF0000,'description':'<@'+tempMember.id+'> ignored the `warning` so they were **kicked** 🔨'}
							}).catch(err=>{console.info(timeStamp()+" [ERROR L]\n"+err.message)});
							
							embedMSG={
								'color': 0xFF0000,
								'title': '⚠ ⛔ YOU HAVE BEEN KICKED ⛔ ⚠',
								'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/Poke-banned.png"},
								'description': '**From Server**: '+myServer.name+'\n**Reason**: Rule #1 violation; '
									+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **any** connection to '
									+' discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
							}
						}
						
						moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).send({embed: embedMSG}).then(()=>{
							try {
								if(spooferFlag==="kick"){
									moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).kick("AutoKick: Rule #1 violation, user was found in spoofing server(s)")
								}
								if(spooferFlag==="ban"){
									moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).ban({days: 7, reason: "AutoBan: Rule #1 violation, user was found in spoofing server(s)"})
								}
							}
							catch(err){
								moderatorBot.channels.get(myServer.cmdChanID).send("ERROR:\n"+err.message);
							}
						}).catch(err=>{console.info(timeStamp()+" [ERROR]\n"+err.message)})
					}
				}
			}, 60000 * minsUntilPunished)
		}
	}
});



// ##########################################################################
// #############################  MEMBER LEFT  ##############################
// ##########################################################################

bot.on("guildMemberRemove", member => {
	let guild=member.guild, spoofServer="", daNoob="", whiteListedMembersIDs=[], whiteListedRoles=[], mRoleNames;
	
	// USERNAMES REPLACE SPACE WITH UNDERLINE
	let user=member.user; let userNoSpace=user.username; let nuser=userNoSpace.split(/ +/);
		for(var xn="0";xn < nuser.length; xn++){ userNoSpace=userNoSpace.replace(" ","_"); }
		
	
	// CHECK ALL SERVERS FROM SERVERLIST
	for(let serverN="0"; serverN < spoofServers.length; serverN++){
		// CHECK IF SERVER LEFT MATCHES ONE OF MY BLACKLISTED SERVER
		if(guild.id===spoofServers[serverN].server){
			spoofServer=spoofServers[serverN].name;
		}
	}
	
	// LOGGING EACH EVENT , TO DISABLE/REMOVE: DELETE EACH LINE, OR ADD COMMENT PARAM: //
	if(!spoofServer){
		if(config.consoleLog==="all"){
			return console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has left Server: "+guild.name);
		}
	}
	
	// LOGGING EACH EVENT , TO DISABLE/REMOVE: DELETE EACH LINE, OR ADD COMMENT PARAM: //
	if(!bot.guilds.get(myServer.id).members.get(user.id)){
		if(config.consoleLog==="all"){
			return console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has left Server: "+spoofServer);
		}
	}
	
	
	// CHECK IF USER IS STILL IN MY SERVER
	if(bot.guilds.get(myServer.id).members.get(user.id)){
		daNoob=bot.guilds.get(myServer.id).members.get(user.id);
		if(myServer.whiteListedMembersIDs.length>0){ whiteListedMembersIDs=myServer.whiteListedMembersIDs }
		if(myServer.whiteListedRoles.length>0){ whiteListedRoles=myServer.whiteListedRoles }
		
		// DO NOT POST FINDINGS FOR OWNER AND BOT
		if(member.id===spoofNinja.id || member.id===config.ownerID){
			if(config.consoleLog==="all" || config.consoleLog==="serverOnly" || config.consoleLog==="eventsOnly"){
				return console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] Owner/Bot has left server: "+guild.name)
			}
			return
		}
		
		// DO NOT POST FINDINGS FOR whiteListedRoles
		mRoleNames=daNoob.roles.map(r => r.name);
		if(mRoleNames.length>0){
			for(var roleN="0"; roleN < mRoleNames.length; roleN++){
				if(myServer.whiteListedRoles.includes(mRoleNames[roleN])){
					if(config.consoleLog==="all" || config.consoleLog==="serverOnly" || config.consoleLog==="eventsOnly"){
						return console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has left Server: "+spoofServer+". But, has whiteListedRole")
					}
					return
				}
			}
		}
		
		// DO NOT POST FINDINGS FOR whiteListedMembersIDs
		if(whiteListedMembersIDs.length>0){
			for(var blUser="0";blUser < whiteListedMembersIDs.length; blUser++){
				if(member.id===whiteListedMembersIDs[blUser]){
					if(config.consoleLog==="all" || config.consoleLog==="serverOnly" || config.consoleLog==="eventsOnly"){
						return console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+userNoSpace+"("+member.id+") has left Server: "+spoofServer+". But, they're whiteListed")
					}
					return
				}
			}
		}
		slackmsg={
			'username': spoofNinja.name,
			'avatarURL': spoofNinja.avatar,
			'embeds': [{
				'thumbnail': {'url': embedSettings.checkedImg },
				'color': parseInt(parseColor(embedSettings.goodColor)),
				'description': '✅ __**USER LEFT SERVER**__ ✅\n**'
					+userNoSpace+'** has left: **'+spoofServer+'**\n**UserID**: `'+member.id+'`\n**On**: '+timeStamp(1)
			}]
		};
		
		console.info(timeStamp()+" "+userNoSpace+"("+member.id+") has left Server: "+spoofServer);
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		return spoofNinjaWh.send(slackmsg).catch(err=>{console.info(timeStamp()+" [ERROR L:505]\n"+err.message)})
	}
});




// ##########################################################################
// ############################## TEXT COMMANDS #############################
// ##########################################################################
bot.on('message', message => {
	
	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, msg=message.content;
		
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT THE COMMAND CHANNEL ID AKA MODLOG
	if(channel.id!==myServer.cmdChanID){ return }
	
	let command=msg.toLowerCase(), args=msg.split(/ +/).slice(1); command=command.split(/ +/)[0]; command=command.slice(1);
		
	// IGNORE REGULAR CHAT
	if(!message.content.startsWith(config.cmdPrefix)){
		if(member){
			if(member.user){
				if(member.user.username){
					if(config.consoleLog==="all"){
						console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+member.user.username+" typed: "+message.content)
					}
				}
			}
		}
		return
	}
	if(config.consoleLog==="all"){
		console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] "+member.user.username+" typed a COMMAND: "+message.content)
	}
	
	// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
	let adminRole=guild.roles.find(role => role.name === myServer.adminRoleName); if(!adminRole){ adminRole={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+myServer.adminRoleName); }
	let modRole=guild.roles.find(role => role.name === myServer.modRoleName); if(!modRole){ modRole={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+myServer.modRoleName); }


//
//	
if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID){	// DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//

	// COMMAND: !HELP
	if(command=="help" || command=="commands"){
		
		embedMSG={
			'username': spoofNinja.name,
			'avatarURL': spoofNinja.avatar,
			'embeds': [{
				'color': parseInt(parseColor(embedSettings.goodColor)),
				'title': 'ℹ Available Syntax and Arguments ℹ',
				'description': ''
			}]
		};
		if(args.length>0){
			if(args[0]==="check"){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'check @mention/user_id` » for checking user, ie:\n'
									+' `'+config.cmdPrefix+'check @JennerPalacios` or\n'
									+' `'+config.cmdPrefix+'check 237597448032354304`\n'
									+' `'+config.cmdPrefix+'check wlmembers` » list of members that the bot ignores\n'
									+' `'+config.cmdPrefix+'check wlroles` » list of roles that the bot ignores\n'
									+' `'+config.cmdPrefix+'check server` » for checking **ALL** members'
			}
			if(args[0].startsWith("addm")){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'addmember`/`'+config.cmdPrefix+'addm` + `@mention/user_id`\n'
									+' » used for adding member to whiteList\n'
									+' » these members are ignored by the bot\n'
									+' IE: `'+config.cmdPrefix+'addmember @JennerPalacios`\n'
									+' OR: `'+config.cmdPrefix+'addmember 237597448032354304`'
			}
			if(args[0].startsWith("delm")){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'delmember`/`'+config.cmdPrefix+'delm` + `@mention/user_id`\n'
									+' » used for deleting member from whiteList\n'
									+' IE: `'+config.cmdPrefix+'delmember @JennerPalacios`\n'
									+' OR: `'+config.cmdPrefix+'delmember 237597448032354304`'
			}
			if(args[0].startsWith("addr")){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'addrole`/`'+config.cmdPrefix+'addr` + `role_name`\n'
									+' » used for adding role to whiteList\n'
									+' » these roles are ignored by the bot\n'
									+' IE: `'+config.cmdPrefix+'addrole Moderator`\n'
									+' OR: `'+config.cmdPrefix+'addmember VIP`'
			}
			if(args[0].startsWith("delr")){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'delrole`/`'+config.cmdPrefix+'delr` + `role_name`\n'
									+' » used for deleting role from whiteList\n'
									+' IE: `'+config.cmdPrefix+'delrole VIP`\n'
			}
			if(args[0]==="feedback"){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'feedback` » for providing feedback or suggestions\n'
									+' provide feedback to JennerPalacios, ie:\n'
									+' `'+config.cmdPrefix+'feedback Love it! great job you noOb!\n`'
									+' `'+config.cmdPrefix+'feedback Add a way to order Pizza!`'
			}
			if(args[0]==="bug"){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'bug` » for reporting a **bug**\n'
									+' please be specific, if possible use twice;\n'
									+' first, report the bug and provide description\n'
									+' then, what you get in the `console.log` or `cli`, ie:\n'
									+' `'+config.cmdPrefix+'bug I get error when checking member`\n'
									+' ```'+config.cmdPrefix+'bug TypeError: Cannot read property "members" of undefined\n'
									+'   at checkUser (/var/www/SpoofNinja/SpoofNinja.js:71:57)```'
			}
			if(args[0]==="onspoofer"){
				embedMSG.embeds[0].description='`'+config.cmdPrefix+'onSpoofer check` » to check current **action**\n'
									+'`'+config.cmdPrefix+'onSpoofer nothing` » to disable/do **nothing**\n'
									+'`'+config.cmdPrefix+'onSpoofer warning` » to send them a warning\n'
									+'`'+config.cmdPrefix+'onSpoofer kick` » to kick after 1min warning\n'
									+'`'+config.cmdPrefix+'onSpoofer ban` » to ban after 1min warning\n'
									+'`'+config.cmdPrefix+'onSpoofer instakick` » to kick instantly\n'
									+'`'+config.cmdPrefix+'onSpoofer instaban` » to ban instantly'
			}
		}
		else {
			embedMSG.embeds[0].title='ℹ Available Commands ℹ';
			embedMSG.embeds[0].description='```md\n'+config.cmdPrefix+'check <@mention/user_id>\n'
								+config.cmdPrefix+'check server\n'
								+config.cmdPrefix+'check wlMembers\n'
								+config.cmdPrefix+'check wlRoles\n'
								+config.cmdPrefix+'check version\n'
								+config.cmdPrefix+'addMember <@mention/user_id>\n'
								+config.cmdPrefix+'delMember <@mention/user_id>\n'
								+config.cmdPrefix+'addRole <role_name>\n'
								+config.cmdPrefix+'delRole <role_name>\n'
								+config.cmdPrefix+'onSpoofer <action>\n'
								+config.cmdPrefix+'bug and !feedback```'
								+'type: `'+command+' <command>` for more info';
		}
		return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:639]\n"+err.message)})
	}



	// COMMAND: !BUG ||FEEDBACK
	if(command==="bug" || command==="feedback"){
			if(command==="bug"){
				embedMSG={'username': 'JennerPalacios','avatarURL': spoofNinja.avatar,'embeds': [{
				'color': parseInt(parseColor(embedSettings.goodColor)),'description': 'Your `BugReport` has been recorded! Stay tuned <(^.^<)'}]};
				botSupportWh.send("⚠ [BUGREPORT] on "+timeStamp(1)+"\n**By: **"+member.user.username+"[`"+member.user.id+"`]\n**From: **"+myServer.name+"[`"+myServer.invite+"`]\n```\n"+message.content.slice(4)+"\n```");
				return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:650]\n"+err.message)})
			}
			embedMSG={'username': 'JennerPalacios','avatarURL': spoofNinja.avatar,'embeds': [{'color': parseInt(parseColor(embedSettings.goodColor)),'description': 'Thanks for your feedback <(^.^<)'}]};
			botSupportWh.send("✅ [FEEDBACK] on "+timeStamp(1)+"\n**By: **"+member.user.username+" [`"+member.user.id+"`]\n**From: **"+myServer.name+"[`"+myServer.invite+"`]\n```\n"+message.content.slice(9)+"\n```");
			return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:554]\n"+err.message)})
	}

//
//
}	//		DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//




if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID){
	if(command.startsWith("addr")||command.startsWith("delr")||command.startsWith("addm")||command.startsWith("delm")){
		
		// CONFIGURATION FILE
		let configFile=JSON.parse(fs.readFileSync("./files/config.json", "utf8"));
		
		// COMMAND: ADDROLE || DELROLE
		if(command.startsWith("addr")){
			if(!args[0]){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'title': 'ℹ Available Syntax and Arguments ℹ',
						'description': '`'+config.cmdPrefix+'addrole <roleName>` or `'+config.cmdPrefix+'addr <roleName>`\n» for adding a role to `whiteListedRoles`\n'
							+'» IE: `'+config.cmdPrefix+'addrole VIP`\n» case sensitive, role must exist!'
					}]
				}
			}
			else {
				configFile.myServer.whiteListedRoles.push(args[0]);
				config.myServer.whiteListedRoles.push(args[0]);
				fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '✅ The role: `'+args[0]+'` was **successfully** added to `whiteListedRole`'
					}]
				}
			}
			return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:699]\n"+err.message)})
		}
		if(command.startsWith("delr")){
			if(!args[0]){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'title': 'ℹ Available Syntax and Arguments ℹ',
						'description': '`'+config.cmdPrefix+'delrole <roleName>` or `'+config.cmdPrefix+'delr <roleName>`\n» for removing a role from `whiteListedRoles`\n'
							+'» IE: `'+config.cmdPrefix+'addrole VIP`\n» case sensitive, role must exist!'
					}]
				}
			}
			else {
				let n=configFile.myServer.whiteListedRoles.indexOf(args[0]);
				if(n===-1){
					embedMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseInt(parseColor(embedSettings.dangerColor)),
							'description': '⛔ The role: `'+args[0]+'` was not found in `whiteListedRole`'
						}]
					}
				}
				else {
					configFile.myServer.whiteListedRoles.splice(n,1);
					config.myServer.whiteListedRoles.splice(n,1);
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					embedMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseInt(parseColor(embedSettings.goodColor)),
							'description': '✅ The role: `'+args[0]+'` was **successfully** removed to `whiteListedRole`'
						}]
					}
				}
			}
			return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:740]\n"+err.message)})
		}



		// COMMAND: ADDUSER || DELUSER
		if(command.startsWith("addm")){
			if(!args[0]){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'title': 'ℹ Available Syntax and Arguments ℹ',
						'description': '`'+config.cmdPrefix+'addmember @mention` or `'+config.cmdPrefix+'addm @mention`\n» for adding a member to `whiteListedMembersIDs`\n'
							+'» IE: `'+config.cmdPrefix+'addmember @JennerPalacios`\n» member must be in server\n'
							+'» OR: `'+config.cmdPrefix+'addmember 237597448032354304`\n» member is **NOT** in server'
					}]
				}
			}
			else {
				// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
				let mentioned; if(message.mentions.users.first()){ mentioned=message.mentions.users.first() }
				
				// IF USER ID WAS PROVIDED INSTEAD OF @MENTIONED
				if(args.length>0 && Number.isInteger(parseInt(args[0]))){ mentioned={ id: args[0] } }
				
				configFile.myServer.whiteListedMembersIDs.push(mentioned.id);
				config.myServer.whiteListedMembersIDs.push(mentioned.id);
				fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '✅ The member: <@'+mentioned.id+'> was **successfully** added to `whiteListedMembersIDs`'
					}]
				}
			}
			return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:779]\n"+err.message)})
		}
		if(command.startsWith("delm")){
			if(!args[0]){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'title': 'ℹ Available Syntax and Arguments ℹ',
						'description': '`'+config.cmdPrefix+'delrole <roleName>` or `'+config.cmdPrefix+'delr <roleName>`\n» for removing a role from `whiteListedMembersIDs`\n'
							+'» IE: `'+config.cmdPrefix+'addrole VIP`\n» case sensitive, role must exist!'
					}]
				}
			}
			else {
				// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
				let mentioned; if(message.mentions.users.first()){ mentioned=message.mentions.users.first() }
				
				// IF USER ID WAS PROVIDED INSTEAD OF @MENTIONED
				if(args.length>0 && Number.isInteger(parseInt(args[0]))){ mentioned={ id: args[0] } }
				
				let n=configFile.myServer.whiteListedMembersIDs.indexOf(mentioned.id);
				if(n===-1){
					embedMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseInt(parseColor(embedSettings.dangerColor)),
							'description': '⛔ The member: <@'+mentioned.id+'> was not found in `whiteListedMembersIDs`'
						}]
					}
				}
				else {
					configFile.myServer.whiteListedMembersIDs.splice(n,1);
					config.myServer.whiteListedMembersIDs.splice(n,1);
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					embedMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseInt(parseColor(embedSettings.goodColor)),
							'description': '✅ The member: `'+mentioned.id+'` was **successfully** removed to `whiteListedMembersIDs`'
						}]
					}
				}
			}
			return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:826]\n"+err.message)})
		}
	
	}
	


//
//
}
//
//
if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID){ // DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//



	// COMMAND: !CHECK
	if(command=="check"){
		var u2c="", u2cn="", whiteListedMembersIDs=[], whiteListedRoles=[];
		if(myServer.whiteListedMembersIDs.length>0){ whiteListedMembersIDs=myServer.whiteListedMembersIDs }
		if(myServer.whiteListedRoles.length>0){ whiteListedRoles=myServer.whiteListedRoles }
		
		// COMMAND » !CHECK ROLES
		if(args.length>0 && args[0].startsWith("wlr")){
			if(whiteListedRoles.length<1){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'description': '⚠ There aren\'t any `whiteListedRoles`'
					}]
				};
			}
			embedMSG={
				'username': spoofNinja.name,
				'avatarURL': spoofNinja.avatar,
				'embeds': [{
					'color': parseInt(parseColor(embedSettings.goodColor)),
					'description': '✅ I have **'+whiteListedRoles.length+'** `whiteListedRoles`:\n'+whiteListedRoles.join(", ")
				}]
			};
			return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:870]\n"+err.message)});
		}
		
		// COMMAND » !CHECK ROLES
		if(args.length>0 && args[0].startsWith("wlm")){
			if(whiteListedMembersIDs.length<1){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'description': '⚠ There aren\'t any `whiteListedMembersIDs`'
					}]
				}
			}
			if(whiteListedMembersIDs.length>0 && whiteListedMembersIDs.length<89){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '✅ I have **'+whiteListedMembersIDs.length+'** `whiteListedMembersIDs`:\n<@'+whiteListedMembersIDs.join(">, <@")+'>'
					}]
				}
			}
			else {
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'description': '⚠ There are too many members in `whiteListedMembersIDs`, max **88**, currently: `'+whiteListedMembersIDs.length+'`. '
							+'You should consider creating a `whiteListedRole` and assigning users to it.'
					}]
				}				
			}
			return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:906]\n"+err.message)});
		}
			
			
		// COMMAND » !CHECK VERSION
		if(args.length>0 && args[0].startsWith("ver")){
			request("https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/version.txt",
				function(error,response,body){
					if(error){console.info(timeStamp()+" [ERROR L:914]\n"+error)}
					if(body){
						let gitHubVer=body.slice(0,-1);
						let verChecker="✅"; if(gitHubVer!==config.botVersion){ verChecker="⚠" }
						embedMSG={
							'username': spoofNinja.name,
							'avatarURL': spoofNinja.avatar,
							'embeds': [{
								'color': parseInt(parseColor(embedSettings.goodColor)),
								'description': 'GitHub [`SpoofNinja`]: v**'+gitHubVer+'**\n'
									+'Local Bot [`'+spoofNinja.name+'`]: v**'+config.botVersion+'** '+verChecker+'\n'
									+'**Discord** API [`discord.js`]: v**'+Discord.version+'**\n'
									+'**Node** API [`node.js`]: **'+process.version+'**'
							}]
						};
						spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:929]\n"+err.message)})
					}
				}
			);
			return
		}
		
		
		// COMMAND » !CHECK SERVER
		if(args.length>0 && args[0]==="server"){
			
			let allUsers="", allUsersID="", allUsersNames="", skipCheck="no";
			guild.members.map(m=> { allUsers += m.user.id+"|"+m.user.username+","; } )
			allUsers=allUsers.split(",");allUsers.length=allUsers.length-1;
			for(var x=0; x<allUsers.length; x++){ var tempUser=allUsers[x].split("|");
				allUsersID+=tempUser[0]+",";allUsersNames+=tempUser[1]+",";
			}
			allUsersID=allUsersID.split(",");allUsersNames=allUsersNames.split(",");
			let uCount=allUsersID.length-1; let uTotal=uCount-1;
			
			let milSecs=1000;let daServers="";let totalSpoofers=0; let uc=0;
			
			// SEND NOTIFICATION
			embedMSG={
				'username': spoofNinja.name,
				'avatarURL': spoofNinja.avatar,
				'embeds': [{
					'thumbnail': {'url': embedSettings.startImg },
					'color': parseInt(parseColor(embedSettings.goodColor)),
					'description': '**(>^.^)> NOTICE <(^.^<)**\nI am bout to check **'+uTotal+'** users...\n'
						+'From server: **'+myServer.name+'**\n**On**: '+timeStamp(1)+'\n... please wait ...'
				}]
			};
			spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:962]\n"+err.message)});
			
			if(config.consoleLog==="scanOnly" || config.consoleLog==="serverOnly" || config.consoleLog==="all"){
				console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] About to check "+uTotal+" users, from server: "+myServer.name)
			}
			
			if(config.botSupport==="yes"){ globalNinjaWh.send(timeStamp(2)+"**"+myServer.name+"** has started a `'+config.cmdPrefix+'check server`, with **"+uTotal+"** registered users <(^.^<)") }
			
			for(var xUser=0; xUser < uCount; xUser++){
				setTimeout(function(){
					if(config.consoleLog==="scanOnly" || config.consoleLog==="serverOnly" || config.consoleLog==="all"){
						console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] [#"+uc+"/"+uTotal+"] Checking userID: "+allUsersID[uc]+" with userName: "+allUsersNames[uc])
					}
					let spoofServersFound=checkUser(allUsersID[uc]);
					
					// DO NOT POST FINDINGS FOR OWNER AND BOT
					if(allUsersID[uc]===spoofNinja.id || allUsersID[uc]===config.ownerID){
						spoofServersFound=[]; skipCheck="yes";
						if(config.consoleLog==="all"){
							console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] I have skipped the user above due to: \"config.json\" in » \"ownerID\" or \"botID\"!")
						}
					}
					
					// DO NOT POST FINDINGS FOR whiteListedRoles
					if(whiteListedRoles.length>0){
						mRoleNames=guild.members.get(allUsersID[uc]).roles.map(r => r.name);
						if(mRoleNames.length>0){
							for(var urc="0"; urc < mRoleNames.length; urc++){
								if(whiteListedRoles.includes(mRoleNames[urc]) && skipCheck==="no"){
									spoofServersFound=[]; skipCheck="yes";
									if(config.consoleLog==="all"){
										console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] I have skipped the user above due to: \"config.json\" in » \"whiteListedRoles\"!")
									}
								}
							}
						}
					}
					
					// DO NOT POST FINDINGS FOR whiteListedMembersIDs
					if(whiteListedMembersIDs.length>0 && skipCheck==="no"){
						for(var blUser="0";blUser < whiteListedMembersIDs.length; blUser++){
							if(allUsersID[uc]===whiteListedMembersIDs[blUser]){
								spoofServersFound=[]; skipCheck="yes";
								if(config.consoleLog==="all"){
									console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] I have skipped the user above due to: \"config.json\" in » \"whiteListedMembersIDs\"!")
								}
							}
						}
					}
					
					skipCheck="no";
					
					
					if(spoofServersFound.length>0){
						//
						//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
						//
						embedMSG={
							'username': spoofNinja.name,
							'avatarURL': spoofNinja.avatar,
							'embeds': [{
								'thumbnail': {'url': embedSettings.snipeImg },
								'color': parseInt(parseColor(embedSettings.warningColor)),
								'description': '⚠ __**WARNING**__ ⚠\n**User**: '+allUsersNames[uc]+'\n**Tag/ID**: <@'+allUsersID[uc]+'> \nWas **found** in server(s): \n'
									+spoofServersFound.join(", ")+'\n**On**: '+timeStamp(1),
								'footer': {
									'text': 'User #'+uc+' of '+uTotal+'...'
								}
							}]
						};
						// POST NOOB FOUND IN SPOOFER SERVER
						spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:1033]\n"+err.message)});
						console.log(timeStamp()+" "+allUsersNames[uc]+"("+allUsersID[uc]+") was found in servers: "+spoofServersFound.join(", "));
						
						// ADD TO TOTALSPOOFERS COUNT
						totalSpoofers++
						
						// RESET DATA FOR NEXT USER IN WAIT-LIST
						spoofServersFound=[];
					}
					

					// END NOTIFICATION
					if(uc===uTotal){
						embedMSG={
							'username': spoofNinja.name,
							'avatarURL': spoofNinja.avatar,
							'embeds': [{
								'thumbnail': {'url': embedSettings.endImg },
								'color': parseInt(parseColor(embedSettings.goodColor)),
								'description': '**(>^.^)> ALL DONE <(^.^<)**\n.\nI __found__ a total of **'+totalSpoofers
									+'** potential spoOfers!\n.\nOut of **'+uTotal+'** registered members\n**On**: '+timeStamp(1)
							}]
						}; 
						console.info(timeStamp()+" I checked "+uTotal+" and found "+totalSpoofers+" potential spoofers")
						
						if(config.botSupport==="yes"){ globalNinjaWh.send(timeStamp(2)+"**"+myServer.name+"** has found `"
							+totalSpoofers+"` spoofers, out of `"+uTotal+"` users on their server <(^.^<)"); }
						
						spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR :596]\n"+err.message)})
					}
					
					// ADD +1 TO COUNT TO CHECK NEXT USER
					uc++;
				}, milSecs);
				
				// ADD 1 SECOND TO NEXT USER CHECK FROM SERVER
				milSecs=milSecs+1500;
			}
		}

		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		let mentioned=""; if(message.mentions.users.first()){ mentioned=message.mentions.users.first(); }
		
		// MENTIONED PERSONW AS FOUND IN MY SERVER - GRAB THEIR USER ID AND USERNAME
		if(mentioned){ u2cn=mentioned.username; u2c=mentioned.id } 
		
		// IF USER ID WAS PROVIDED INSTEAD OF @MENTIONED
		if(args.length>0 && Number.isInteger(parseInt(args[0]))){ 
			u2cn=guild.members.get(args[0]); if(u2cn){ u2cn=guild.members.get(args[0]).user.username; }else{ u2cn="<@"+args[0]+">"; } u2c=args[0]
		}

		if(u2c){
		
			// DO NOT POST FINDINGS FOR OWNER OR BOT
			if(u2c===spoofNinja.id || u2c===config.ownerID){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '⚠ Cannot check `Owner/Bot` 😛 ! '
					}]
				};
				if(config.consoleLog==="all"){
					console.log(timeStamp()+" [consoleLog="+config.consoleLog+"] Cannot check \"config.json\" » \"ownerID\", neither \"botID\"!")
				}
				if(u2c===config.spoofNinja.id){
					embedMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'thumbnail': {'url': embedSettings.honorImg },
							'color': parseInt(parseColor(embedSettings.goodColor)),
							'description': '✅ "**'+u2cn+'**" appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍'
						}]
					}
				}
				return  spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:1110]\n"+err.message)})
			}
			
			// DO NOT POST FINDINGS FOR whiteListedRoles
			if(whiteListedRoles.length>0 && guild.members.get(u2c)){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '⚠ This user has `WhiteListedRole(s)` 😛 ! '
					}]
				};
				mRoleNames=guild.members.get(u2c).roles.map(r => r.name);
				if(mRoleNames.length>0){
					for(var urc="0"; urc < mRoleNames.length; urc++){
						if(whiteListedRoles.includes(mRoleNames[urc])){
							if(config.consoleLog==="all"){
								console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] I have skipped the user above due to: \"config.json\" in » \"whiteListedRoles\"!")
							}
							return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L]\n"+err.message)})
						}
					}
				}
			}
			
			// DO NOT POST FINDINGS FOR whiteListedMembersIDs
			if(whiteListedMembersIDs.length>0){
				for(var blUser="0";blUser < whiteListedMembersIDs.length; blUser++){
					if(u2c===whiteListedMembersIDs[blUser]){
						embedMSG={
							'username': spoofNinja.name,
							'avatarURL': spoofNinja.avatar,
							'embeds': [{
								'color': parseInt(parseColor(embedSettings.goodColor)),
								'description': '⚠ This user is `WhiteListed` 😛 ! '
							}]
						};
						if(config.consoleLog==="all"){
							console.log(timeStamp()+" [consoleLog="+config.consoleLog+"] Cannot check users in \"config.json\" » \"whiteListedMembersIDs\"!")
						}
						return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:1151]\n"+err.message)})
					}
				}
			}
			
			// CHECK FOR THE PERSON USING SPOOFING SERVERS LIST
			let spoofServersFound=checkUser(u2c);
			
			// USER WAS NOT FOUND IN ANY SPOOFING SERVER - FOR TEST CHANNEL
			if(spoofServersFound.length<1){
				//
				//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
				//
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'thumbnail': {'url': embedSettings.honorImg },
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '✅ "**'+u2cn+'**" appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍'
					}]
				};
				
				if(config.consoleLog==="all"){ console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] User: "+u2c+" appears to be a LEGIT Trainer, on "+timeStamp(2)); }
			}
			
			// USER WAS FOUND IN A SPOOFING SERVER
			else{
				//
				//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
				//
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'thumbnail': {'url': embedSettings.snipeImg },
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'description': '⚠ __**WARNING**__ ⚠\n**User**: '+u2cn+'\n**Tag/ID**: <@'+u2c+'>\nWas **found** in __servers__:\n'+spoofServersFound.join(", ")+'\n**On**: '+timeStamp(1)
					}]
				};
				
				if(config.consoleLog==="all"){ console.info(timeStamp()+" [consoleLog="+config.consoleLog+"] User: "+u2cn+"("+u2c+") was FOUND in servers: "+spoofServersFound.join(", ")); }
			}
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:1195]\n"+err.message)})
		}
		// MENTIONED IS INCORRECT FORMAT - NO A VALID @MENTION OR USER_ID
		else {
			if(args[0]!=="server"){
				embedMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': 'Please `@mention` a person you want me to `'+config.cmdPrefix+'check`, you can use `@user_tag` or `user_id_number`'
					}]
				};
				
				// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
				return spoofNinjaWh.send(embedMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:1210]\n"+err.message)})
			}
		}
	}


//
//
}	//		DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//


	// RESTART THIS MODULE
	if(command==="restart" && member.id===config.ownerID && args[0]==="spoofninja"){
		embedMSG={
			'username': spoofNinja.name,
			'avatarURL': spoofNinja.avatar,
			'embeds': [{
				'color': parseInt(parseColor(embedSettings.goodColor)),
				'description': '♻ Restarting **spoOfNinja**\n » please wait `3` to `5` seconds...'
				}]
			};
		spoofNinjaWh.send(embedMSG).then(()=>{ process.exit(1) }).catch(err=>{console.info(timeStamp()+" [ERROR L:1233]\n"+err.message)})
	}
});

// BOT LOGIN TO DISCORD
bot.login(config.spoofNinja.token);

// BOT DISCONNECTED
bot.on('disconnect', function (){
	console.info(timeStamp()+' -- SPOOFNINJA HAS DISCONNECTED --')
});




/*





*/  // ######################################################## //
	//															//
	//		MODERATOR BOT - FOR FLAGS: WARN, KICK, BAN			//
	//															//
	// ######################################################## //
/*




*/



moderatorBot.on('ready', () => {
	console.info(timeStamp()+"-- DISCORD SpoofNinja, ModeratorBot: "+moderatorBot.user.username+", IS READY --");
});



moderatorBot.on('message', message => {
	//STOP SCRIPT IF DM OR ANOTHER GUILD
	if(message.channel.type==="dm"){ return }  if(message.guild.id!==myServer.id){ return }
	
	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, msg=message.content;
		
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT THE COMMAND CHANNEL ID AKA MODLOG
	if(channel.id!==myServer.cmdChanID){ return }
	
	// GRAB COMMAND AND ARGUMENTS
	let command=msg.toLowerCase(), args=msg.toLowerCase(); args=args.split(/ +/).slice(1); command=command.split(/ +/)[0]; command=command.slice(1);
	
	// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
	let adminRole=guild.roles.find(role => role.name === myServer.adminRoleName); if(!adminRole){ adminRole={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+myServer.adminRoleName); }
	let modRole=guild.roles.find(role => role.name === myServer.modRoleName); if(!modRole){ modRole={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+myServer.modRoleName); }
	
	
//
// SPOOF NINJA COMPATIBILITY - AUTO BAN - MORE TO COME
//
	if(channel.id===myServer.cmdChanID){
		if(msg){
			if(msg.startsWith(config.cmdPrefix)){
				
				//
				//
				if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===config.ownerID){ // DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
				//
				//
				
					embedMSG={
						"color": 0x00FF00,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`"+config.cmdPrefix+"onSpoofer check` » to check current **action**\n"
							+"`"+config.cmdPrefix+"onSpoofer nothing` » to disable/do **nothing**\n"
							+"`"+config.cmdPrefix+"onSpoofer warning` » to send them a warning\n"
							+"`"+config.cmdPrefix+"onSpoofer kick` » to kick after 1min warning\n"
							+"`"+config.cmdPrefix+"onSpoofer ban` » to ban after 1min warning\n"
							+"`"+config.cmdPrefix+"onSpoofer instakick` » to kick instantly\n"
							+"`"+config.cmdPrefix+"onSpoofer instaban` » to ban instantly"
					};
					if(command==="onspoofer"){
						if(args.length>0){
						
							// CONFIGURATION FILE
							let configFile=JSON.parse(fs.readFileSync("./files/config.json", "utf8"));
							if(args[0]==="nothing"){
								spooferFlag="nothing";
								configFile.myServer.onSpooferFound="nothing";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return message.channel.send({embed:{"color":0x00FF00,"description":"🚫 If `SpoofNinja` finds a possible spoofer, I will do **nothing** 👎"}})
							}
							if(args[0].startsWith("warn")){
								spooferFlag="warning";
								configFile.myServer.onSpooferFound="warning";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return message.channel.send({embed:{"color":0x00FF00,"description":"⚠ If `SpoofNinja` finds a possible spoofer, I will send them a **warning** 😏"}})
							}
							if(args[0]==="kick"){
								spooferFlag="kick";
								configFile.myServer.onSpooferFound="kick";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return message.channel.send({embed:{"color":0x00FF00,"description":"👞 If `SpoofNinja` finds a possible spoofer, I will send them a **warning**. After `"+minsUntilPunished+" minute(s)`, "
									+"if they're still in a spoofing server, I will **kick** their butts"}})
							}
							if(args[0]==="ban"){
								spooferFlag="ban";
								configFile.myServer.onSpooferFound="ban";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return message.channel.send({embed:{"color":0x00FF00,"description":"⛔ If `SpoofNinja` finds a possible spoofer, I will send them a **warning**. After `"+minsUntilPunished+" minute(s)`, "
									+"if they're still in a spoofing server, I will **ban** their butts"}})
							}
							if(args[0]==="instakick"){
								spooferFlag="instakick";
								configFile.myServer.onSpooferFound="instakick";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return message.channel.send({embed:{"color":0x00FF00,"description":"✅ If `SpoofNinja` finds a possible spoofer, I will 👞**kick**💪 their butts `instantly`!"}})
							}
							if(args[0]==="instaban"){
								spooferFlag="instaban";
								configFile.myServer.onSpooferFound="instaban";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return message.channel.send({embed:{"color":0x00FF00,"description":"✅ If `SpoofNinja` finds a possible spoofer, I will ⛔**ban**🔨 their asses `instantly`!"}})
							}
							if(args[0]==="check"){
								let txtStart="✅ If `SpoofNinja` finds a possible spoofer, I will ";
								if(spooferFlag==="nothing"){ return message.channel.send({embed:{"color":0x00FF00,"description":txtStart+"do **nothing** 👎"}}) }
								if(spooferFlag==="warning"){ return message.channel.send({embed:{"color":0x00FF00,"description":txtStart+"send them a **warning**"}}) }
								if(spooferFlag==="kick"){ return message.channel.send({embed:{"color":0x00FF00,"description":txtStart+"**kick** them after `"+minsUntilPunished+" minute(s)`"}}) }
								if(spooferFlag==="ban"){ return message.channel.send({embed:{"color":0x00FF00,"description":txtStart+"**ban** them after `"+minsUntilPunished+" minute(s)`"}}) }
								if(spooferFlag==="instakick"){ return message.channel.send({embed:{"color":0x00FF00,"description":txtStart+"**kick** them `instantly`!"}}) }
								if(spooferFlag==="instaban"){ return message.channel.send({embed:{"color":0x00FF00,"description":txtStart+"**ban** them `instantly`!"}}) }
							}
							return channel.send({embed: embedMSG})
						}
						return channel.send({embed: embedMSG})
					}
					else {
						return
					}
				//
				//
				}			//
				else {		//		DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
					return	//
				}			//
				//
				//
			}
			else {
				return
			}
		}
		if(message.embeds.length!==0){
			if(message.embeds[0]){
				if(message.embeds[0].message.webhookID===webhookID){
					let spoofNinja=message.embeds[0].description;
					if(spoofNinja){
						if(spoofNinja.split("\n")){
							spoofNinja=spoofNinja.split("\n")
							if(spoofNinja.length>4){
								
								// SEARCH FOR "JOINED" WORD IN JOIN-EVENTS
								let joinEvent=spoofNinja.some(txt=>txt.includes("joined"));
								
								if(joinEvent===true){
									let catchID=spoofNinja[2].split(/ +/);
									catchID=catchID[1].slice(2,-1);
									
									if(spooferFlag==="nothing"){
										return
									}
									
									if(spooferFlag==="warning" || spooferFlag==="kick" || spooferFlag==="ban"){
										embedMSG={
											'color': 0xFF0000,
											'title': '⚠ THIS IS A WARNING ⚠',
											'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/User-Warned.png"},
											'description': '**From Server**: '+myServer.name+'\n**Message**: You are violating one of our rules; '
												+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **anyone** '
												+'with connection to discord spoofing servers...\nPlease leave `ALL` **spoofing** servers or suffer the '
												+'consequences!💪\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
										};
										if(spooferFlag==="warning"){
											channel.send({embed:{'color':0xFF9900,'description':'A **warning** has been sent to: <@'+catchID+'>'}});
										}
										if(spooferFlag==="kick"){
											channel.send({embed:{'color':0xFF9900,'description':'A **warning** has been sent to: <@'+catchID+'>. They will be '
												+'**kicked** in `'+minsUntilPunished+' minute(s)` if they haven\'t left the spoofing server(s).'}});
										}
										if(spooferFlag==="ban"){
											channel.send({embed:{'color':0xFF9900,'description':'A **warning** has been sent to: <@'+catchID+'>. They will be '
												+'**banned** in `'+minsUntilPunished+' minute(s)` if they haven\'t left the spoofing server(s).'}});
										}
										message.guild.members.get(catchID).send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" [ERROR]\n"+err.message)})
									}
									
									if(spooferFlag==="instakick"){
										embedMSG={
											'color': 0xFF0000,
											'title': '⚠ ⛔ YOU HAVE BEEN KICKED ⛔ ⚠',
											'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/Poke-kicked.png"},
											'description': '**From Server**: '+myServer.name+'\n**Reason**: Rule #1 violation; '
												+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **any** connection to '
												+' discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
										};
										channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> was **insta**__KICKED__! 💪'}});
										message.guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												message.guild.members.get(catchID).kick("AutoKick: Rule #1 violation, user was found in spoofing server(s)")
											}
											catch(err){
												message.channel.send("ERROR:\n"+err.message);
											}
										}).catch(err=>{console.info(timeStamp()+" [ERROR]\n"+err.message)})
									}
									
									if(spooferFlag==="instaban"){
										embedMSG={
											'color': 0xFF0000,
											'title': '⚠ ⛔ YOU HAVE BEEN BANNED ⛔ ⚠',
											'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/Poke-banned.png"},
											'description': '**From Server**: '+myServer.name+'\n**Reason**: Rule #1 violation; '
												+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **any** connection to '
												+' discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
										};
										channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> was **insta**__BANNED__! ⛔'}});
										message.guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												message.guild.members.get(catchID).ban({days: 1, reason: "AutoBan: Rule #1 violation, user was found in spoofing server(s)"})
											}
											catch(err){
												message.channel.send("ERROR:\n"+err.message);
											}
										}).catch(err=>{console.info(timeStamp()+" [ERROR]\n"+err.message)})
									}
									return
								}
								
								
								// SEARCH FOR "**found**" WORD IN !CHECK <@MENTION/USER_ID> OR IN !CHECK SERVER			// WIP
								if(joinEvent===false){joinEvent=spoofNinja.some(txt=>txt.includes("**found**"))}
								if(joinEvent===true){
									let catchID=spoofNinja[2].split(/ +/);
									catchID=catchID[1].slice(2,-1);
									
									if(spooferFlag==="warning"){
										embedMSG={
											'color': 0xFF0000,
											'title': '⚠ THIS IS A WARNING ⚠',
											'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/User-Warned.png"},
											'description': '**From Server**: '+myServer.name+'\n**Message**: You are violating one of our rules; '
												+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **anyone** '
												+'with connection to discord spoofing servers...\nPlease leave `ALL` **spoofing** servers or suffer the '
												+'consequences!💪\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
										};
										if(spooferFlag==="warning"){
											channel.send({embed:{'color':0xFF9900,'description':'A **warning** has been sent to: <@'+catchID+'>'}});
										}
										message.guild.members.get(catchID).send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" [ERROR]\n"+err.message)})
									}
									
									if(spooferFlag==="kick" || spooferFlag==="instakick"){
										embedMSG={
											'color': 0xFF0000,
											'title': '⚠ ⛔ YOU HAVE BEEN KICKED ⛔ ⚠',
											'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/Poke-kicked.png"},
											'description': '**From Server**: '+myServer.name+'\n**Reason**: Rule #1 violation; '
												+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **any** connection to '
												+' discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
										};
										channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> has been **KICKED**! 💪'}});
										message.guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												message.guild.members.get(catchID).kick("AutoKick: Rule #1 violation, user was found in spoofing server(s)")
											}
											catch(err){
												message.channel.send("ERROR:\n"+err.message);
											}
										}).catch(err=>{console.info(timeStamp()+" [ERROR]\n"+err.message)})
									}
									
									if(spooferFlag==="ban" || spooferFlag==="instaban"){
										embedMSG={
											'color': 0xFF0000,
											'title': '⚠ ⛔ YOU HAVE BEEN BANNED ⛔ ⚠',
											'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/Poke-banned.png"},
											'description': '**From Server**: '+myServer.name+'\n**Reason**: Rule #1 violation; '
												+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **any** connection to '
												+' discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: '+timeStamp(2)
										};
										channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> has been **BANNED**! ⛔'}});
										message.guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												message.guild.members.get(catchID).ban({days: 1, reason: "AutoBan: Rule #1 violation, user was found in spoofing server(s)"})
											}
											catch(err){
												message.channel.send("ERROR:\n"+err.message);
											}
										}).catch(err=>{console.info(timeStamp()+" [ERROR]\n"+err.message)})
									}
								}
							}
						}
					}
				}
			}
		}
		else {
			return
		}
	}
	else {
		return
	}
//
// END OF: SPOOFNINJA COMPATIBILITY
//
});

moderatorBot.login(config.moderatorBot.token);

moderatorBot.on('disconnect', function (){
	console.info(timeStamp()+ ' -- MODERATOR BOT FOR SPOOFNINJA HAS DISCONNECTED --')
});
