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
const bot=new Discord.Client({fetchAllMembers: true}); //			SLOW LOAD - GET OVER 1B USERS (FROM ALL SERVERS)
//const bot=new Discord.Client(); //						FAST LOAD - GET ACTIVE USERS ONLY
//
//
//


//
//		FUNCTION: TIME STAMP
//
function timeStamp(type){
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	if(!type || type===0){
		// [YYYY/MM/DD @ HH:MM:SS]
		return cc.blue+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+cc.reset+" |"
	}
	if(type===1) {
		// `MM/DD/YYYY` **@** `HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+"` **@** `"+hr+":"+min+":"+sec+"`"
	}
	if(type===2) {
		// `MM/DD/YYYY @ HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+" @ "+hr+":"+min+":"+sec+"`"
	}
}



//
//		DEFINE GLOBAL AND COMMON VARIABLES
//
var config=require('./files/config.json');		// CONFIG FILE
	config.botVersion="4.0";					// LOCAL VERSION
//
//
//
var serverCount, noobFound, serverFound, noobJoined, ownServer, slackMSG, embedMSG, myServerFound, memberIsSpoofer, webhook,
	myServer=config.myServer, spoofNinja=config.spoofNinja, embedSettings=config.embedSettings, validUsername=/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{1,})$/igm,
	minsUntilPunished=parseInt(config.myServer.minsUntilPunished), spooferFlag=config.myServer.onSpooferFound, daServers, whiteListedMembersIDs=[], whiteListedRoles=[],
	cc={"reset": "\x1b[0m","black": "\x1b[30m","red": "\x1b[31m","green": "\x1b[32m","yellow": "\x1b[33m","blue": "\x1b[34m",
	"magenta": "\x1b[35m","cyan": "\x1b[36m","white": "\x1b[37m","bgblack": "\x1b[40m","bgred": "\x1b[41m","bggreen": "\x1b[42m",
	"bgyellow": "\x1b[43m","bgblue": "\x1b[44m","bgmagenta": "\x1b[45m","bgcyan": "\x1b[46m","bgwhite": "\x1b[47m"};
	
	// LOAD WHITELISTED MEMBERS
	if(myServer.whiteListedMembersIDs.length>0){ whiteListedMembersIDs=myServer.whiteListedMembersIDs }
	
	// LOAD WHITELISTED ROLES
	if(myServer.whiteListedRoles.length>0){ whiteListedRoles.concat(myServer.whiteListedRoles) }
	if(myServer.adminRoleName){ whiteListedRoles.push(myServer.adminRoleName) }
	if(myServer.modRoleName){ whiteListedRoles.push(myServer.modRoleName) }
	
	// SPOOFNINJA EMBED MESSAGE SETTINGS - DO NOT MODIFY - DO IT FROM CONFIG
	slackMSG={"username":spoofNinja.name,"avatarURL":spoofNinja.avatar,"embeds":[{"color":"","description":""}]};
	
	// MODERATOR EMBED MESSAGE SETTINGS - DO NOT MODIFY
	
	
	// WARNING MESSAGE SENT TO USER (try to include "From: myServer.name" minimum)
	warningMSG={
		"title": "⚠ THIS IS A WARNING ⚠",
		"description": "**From Server**: "+myServer.name+"\n**Message**: You are violating one of our rules; "
			+"**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **anyone** "
			+"with connection to discord spoofing servers...\nPlease leave `ALL` **spoofing** servers or suffer the "
			+"consequences!💪\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: "+timeStamp(2)
	};
	
	// MESSAGE SENT TO USER ONCE KICKED (try to include "From: myServer.name" minimum)
	kickMSG={
		"title": "⚠ ⛔ YOU HAVE BEEN KICKED ⛔ ⚠",
		"description": "**From Server**: "+myServer.name+"\n"
			+"**Reason**: Rule violation; **you** were found in **spoofing** server(s). "
			+"We have zero tolerance for **spoofers**, and **any** connection to "
			+"discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: "+timeStamp(2)
	};
	
	// MESSAGE SENT TO USER ONCE BANNED (try to include "From: myServer.name" minimum)
	banMSG={
		"title": "⚠ ⛔ YOU HAVE BEEN BANNED ⛔ ⚠",
		"description": "**From Server**: "+myServer.name+"\n**"
			+"Reason**: Rule violation; **you** were found in **spoofing** server(s). "
			+"We have zero tolerance for **spoofers**, and **any** connection to "
			+"discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: "+timeStamp(2)
	};
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

globalNinjaWh.send({"embeds": [{"description": timeStamp(2)+" Gratz! **"+myServer.name+"** started using **SpoofNinja**"}]}).catch(err=>{console.info(timeStamp()+" [ERROR L:53] "+err.message)});



//
//				CHECK IF INFO/WEBHOOK IS BEING SHARED
//
if(config.botSupport==="yes"){
	if(!myServer.invite){myServer.invite="no invite"}
	globalNinjaWh.send({"embeds": [{"description": timeStamp(2)+" Yay! **"+myServer.name+"** have **SHARED** their info, and wants to recieve *major* update-**notifications**", "color": parseInt(parseColor("#005500"))}]})
	botSupportWh.send({"embeds": [{"description": timeStamp(2)+" **"+myServer.name+"** would like to get **UPDATES**!\n"
	+" » Their Owner: <@"+config.ownerID+">\n » Their Invite: ` "+myServer.invite+" `\n » Their WH ID: `"+webhookID+"`\n » Their WH Token: `"+webhookToken+"`"}]});
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
if(!Number.isInteger(parseInt(config.ownerID))){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+"  config.json » \"ownerID\" = wrong format, it needs to be numbers")
}
if(config.consoleLog==="eventsOnly" || config.consoleLog==="serverOnly" || config.consoleLog==="all"){} else{
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"ownerID\" = needs to be either \"eventsOnly\" or \"serverOnly\" or \"all\"")
}
if(!Number.isInteger(parseInt(config.spoofNinja.id))){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"spoofNinja\" » \"id\" = wrong format, it needs to be numbers")
}
if(!spoofNinja.token){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"spoofNinja\" » \"token\" = needs a token!")
}
if(!config.moderatorBot.token){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"moderatorBot\" » \"token\" = needs a token!")
}
if(!Number.isInteger(parseInt(myServer.id))){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » myServer » \"id\" = wrong format, it needs to be numbers")
}
if(!myServer.cmdChanIDs){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"myServer\" » \"cmdChanIDs\" = needs at least one channel ID")
}
if(!Array.isArray(myServer.cmdChanIDs)){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"myServer\" » \"cmdChanIDs\" = needs to be an array: ie: "+cc.yellow+"[\"####\"]"+cc.reset+" or "+cc.yellow+"[\"####\",\"####\"]"+cc.reset)
}
if(myServer.cmdChanIDs.length<1){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"myServer\" » \"cmdChanIDs\" = needs at least one channel ID")
}
if(!myServer.webhook){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"myServer\" » \"webhook\" = needs webhook URL to keep bot in ninja status!")
}
if(!myServer.adminRoleName){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"myServer\" » \"adminRoleName\" = needs the name of role for Admins!")
}
if(!myServer.modRoleName){
	return console.info(cc.white+cc.bgred+" ERROR "+cc.reset+" config.json » \"myServer\" » \"modRoleName\" = needs the name of role for Moderators!")
}




//
//		BOT SIGNED IN AND IS READY
//
bot.on('ready', () => {
	// SET BOT AS INVISIBLE = NINJA <(^.^<) 
	bot.user.setPresence({"status":"invisible"});
	
	console.info(timeStamp()+" -- DISCORD SpoofNinja, DummyAcc: "+cc.yellow+bot.user.username+cc.reset+", IS "+cc.green+"READY"+cc.reset+" --");
	console.info(timeStamp()+" I have loaded "+cc.cyan+spoofServers.length+cc.reset+" Spoofing Servers");
	
	slackMSG.embeds[0].color=parseInt(parseColor(embedSettings.goodColor));
	slackMSG.embeds[0].description="I am ready to **scan** __this__ server against **"+spoofServers.length+"**-other **spoOfing** servers!"
	
	spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:128\n"+err.message)});
	
	// GET VERSIONS
	request("https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/version.txt",
		function(error,response,body){
			if(error){console.info(error)}
			if(body){
				let gitHubVer=body.slice(0,-1); let timeLog=timeStamp();
				let verChecker=cc.green+"up-to-date"+cc.reset; if(gitHubVer!==config.botVersion){ verChecker=cc.red+"OUTDATED!"+cc.reset }
				console.info(
					timeLog+" GitHub [SpoofNinja]: "+cc.yellow+"v"+gitHubVer+cc.reset+"\n"
					+timeLog+" Local Bot ["+bot.user.username+"]: "+cc.yellow+"v"+config.botVersion+cc.reset+" -> "+verChecker+"\n"
					+timeLog+" Discord API [discord.js]: "+cc.yellow+"v"+Discord.version+cc.reset+"\n"
					+timeLog+" Node API [node.js]: "+cc.yellow+process.version+cc.reset
				)
			}
		}
	)
	
	// CHECK IF BOTSUPPORT IS ENABLED
	if(config.botSupport==="no"){console.info(cc.cyan+".:[ FRIENDLY NOTICE ]:."+cc.reset+"\n"
		+"You should consider "+cc.green+"enabling"+cc.reset+" \""+cc.magenta+"botSupport"+cc.reset+"\" in order to:\n"
		+cc.green+"»"+cc.reset+" Get notifications about updates for either:\n"
		+"-- "+cc.magenta+"SpoofNinja.js"+cc.reset+", "+cc.magenta+"servers.json"+cc.reset+", and/or "+cc.magenta+"config.json"+cc.reset+"\n"
		+cc.green+"»"+cc.reset+" Direct replies in your server when using \""+cc.cyan+"!bug"+cc.reset+"\" reports\n"
		+"-- You'll be sharing your webhook in order for Jenner to reply\n"
		+"----------------------------------------------------------\n"
		+cc.green+"»"+cc.reset+" How to ENABLE it? very easy: \n"
		+"-- Edit "+cc.magenta+"config.json"+cc.reset+" at line 14: \""+cc.magenta+"botSupport"+cc.reset+"\": \""+cc.green+"yes"+cc.reset+"\"\n"
		+"----------------------------------------------------------\n");
	}
});



//
//				FUNCTION: CHECK USER "ONJOIN" USING JSON FILE - VIA VARIABLE/FUNCTION
//
function checkUser(userID){
	memberIsSpoofer="no", serverCount="", noobFound="", serverFound=[];
	
	// CHECK ALL SERVERS FROM SERVERLIST
	for(serverCount="0"; serverCount < spoofServers.length; serverCount++){
		
		// CHECK IF I'M IN EACH SERVER FIRST
		noobFound=bot.guilds.get(spoofServers[serverCount].server);
		
		// I'M IN THE SERVER NOW LOOK FOR THE NOOB
		if(noobFound){
			noobFound=bot.guilds.get(spoofServers[serverCount].server).members.get(userID);
			
			// I FOUND NOOB, NOW I CAN ADD THE SERVER TO THE LIST
			if(noobFound){
				serverFound.push(spoofServers[serverCount].name);
				memberIsSpoofer="yes"
			}
		}
		
		// I'M NOT IN ONE OF THE SERVERS
		else{
			console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" I am not in server: "+cc.cyan+spoofServers[serverCount].name+cc.reset
				+" | Please join using invite code: "+cc.cyan+spoofServers[serverCount].invite+cc.reset+"..."
				+" or remove line from \""+cc.magenta+"servers.json"+cc.reset+"\" and wait for update (if botsupport is enabled)");
		}
	}
	
	// CHECK PERSONAL SERVER IN CASE USER JOINS SPOOF SERVER AFTER JOINING MY SERVER
	noobFound=""; noobFound=bot.guilds.get(myServer.id);
	if(noobFound){
		noobFound=bot.guilds.get(myServer.id).members.get(userID);
		if(noobFound){
			serverFound.push(myServer.name)
		}
	}
	else{
		console.info(".\n"+cc.bgred+cc.white+" ERROR "+cc.reset+" The bot is not in your server yet, SILLY YOU! ["+myServer.name+"]...\nLog into DummyAccount and join YOUR SERVER!\n.");
	}
	
	// SEND DATA BACK TO VARIABLE
	return serverFound;
}



//
//				FUNCTION: JOINED SERVER USING JSON FILES
//
function checkJoined(serverID){
	serverCount="", noobJoined="", serverFound="", memberIsSpoofer="no";
	
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
				memberIsSpoofer="yes"
			}
		}
	}
	
	// SEND DATA BACK TO VARIABLE
	return noobJoined;
}


//
//				FUNCTION: CHECK IF USER IS WHITELISTED OR HAS ROLES
//
function isWhiteListed(userID,serverNames){
	
	// OWNER'S ID AND BOT'S ID
	if(userID===spoofNinja.id || userID===config.ownerID){
		return {"isWhiteListed": "yes", "memberIs": "BotOrOwner"}
	}
	
	// WHITELISTED MEMBER IDs
	if(whiteListedMembersIDs.length>0){
		if(whiteListedMembersIDs.includes(userID)){
			return {"isWhiteListed": "yes", "memberIs": "WhitelistedUser"}
		}
	}
	
	// WHITELISTED ROLES
	if(whiteListedRoles.length>0){
		if(bot.guilds.get(myServer.id).members.get(userID)){
			let mRoleNames=bot.guilds.get(myServer.id).members.get(userID).roles.map(r => r.name);
			if(mRoleNames.length>0){
				for(var urc="0"; urc < mRoleNames.length; urc++){
					if(myServer.whiteListedRoles.includes(mRoleNames[urc])){
						return {"isWhiteListed": "yes", "memberIs": "WhitelistedRoled"}
					}
				}
			}
		}
	}
	return {"isWhiteListed": "no", "memberIs": "NotWhitelisted"}
}



// ##########################################################################
// ############################## MEMBER JOINS ##############################
// ##########################################################################
bot.on("guildMemberAdd", member => {
	
	// EXIT IF BOT 
	if(member.user.bot){ return }
	
	// RESET VARIABLES
	let guild=member.guild; myServerFound="no", memberIsSpoofer="no", daServers="", daServersConsole="";
	slackMSG={"username":spoofNinja.name,"avatarURL":spoofNinja.avatar,"embeds":[{ "thumbnail":{"url":""},"color":"","description":""}]};
	
	// VALIDATE USERNAME AND REPLACE SPACES WITH UNDERSCORE
	let user=member.user; let userNoSpace=user.username; let nuser=userNoSpace.split(/ +/);
		for(var xn="0";xn < nuser.length; xn++){ userNoSpace=userNoSpace.replace(" ","_") }
	
	// CHECK IF USER IS IN A SPOOFING SERVER
	let spoofServersFound=checkUser(member.id); //console.info(cc.red+"spoofServersFound("+spoofServersFound.length+"): "+spoofServersFound+cc.reset);
		
	// CHECK JOINED SERVER
	let serverJoined=checkJoined(guild.id); //console.info(cc.red+"serverJoined: "+serverJoined+cc.reset+"\n.");
	
	// STOP IF BOT DIDNT FIND USER JOINING A SPOOF SERVER OR MY SERVER
	if(!serverJoined){ return }
	
	
	// WA|WA	XEN|XEN		WA|XEN		XEN|WA
	// SINGLE SERVER FOUND
	if(spoofServersFound.length===1){
		// JOINED ONE SERVER, MY SERVER
		if(spoofServersFound[0]===myServer.name && serverJoined===myServer.name){
			spoofServersFound=[];
			if(config.consoleLog==="all"){
				console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | "+cc.cyan+userNoSpace+cc.reset+"("+member.id+") has joined Server: "+cc.cyan+serverJoined+cc.reset)
			}
			else{
				console.info(timeStamp()+" User: "+cc.cyan+userNoSpace+cc.reset+"("+member.id+") has joined Server: "+cc.cyan+serverJoined+cc.reset)
			}
		}
		
		// JOINED ONE SERVER, SPOOFING SERVER
		if(spoofServersFound.length===1 && spoofServersFound[0]===serverJoined){spoofServersFound=[],memberIsSpoofer="yes"}
		
		// JOINED ONE SERVER, MY SERVER BUT IS IN SPOOFING
		if(spoofServersFound.length===1 && serverJoined===myServer.name && spoofServersFound[0]!==myServer.name){memberIsSpoofer="yes",myServerFound="yes"}
		
		// JOINED ONE SERVER, SPOOFING BUT IS IN MYSERVER
		if(spoofServersFound.length===1 && serverJoined===myServer.name && spoofServersFound[0]!==myServer.name){memberIsSpoofer="yes",myServerFound="yes"}
	}
	//
	// JOINED SERVER REMAINS
	
	
	// WA|XEN,WA		WA|XEN,100,WA		XEN|XEN,WA				XEN|XEN,100,WA			XEN|100,XEN			XEN|100,BOT,WA
	// MULTIPLE SERVERS FOUND
	if(spoofServersFound.length>1){
		memberIsSpoofer="yes";
		
		// JOINED SERVER IS MY SERVER - AND USER IS SPOOFER				WA|XEN,WA
		if(serverJoined===myServer.name){myServerFound="yes"}
		
		// CHECK IF MYSERVER IS IN ALL SERVER, REMOVE IT				WA|XEN,WA > WA|XEN		XEN|XEN,WA > XEN|XEN		XEN|100,BOT,WA > XEN|100,BOT
		if(spoofServersFound.includes(myServer.name)){myServerFound="yes",spoofServersFound=spoofServersFound.slice(0,-1)}
		
		// JOINED ONE SERVER WAS IN TWO, BUT MY SERVER WAS REMOVED 		XEN|XEN
		if(spoofServersFound.length===1 && spoofServersFound[0]===serverJoined){spoofServersFound=[]}
		
		
		// JOINED ONE SERVER WAS IN TWO, REMOVE JOINED 		XEN|XEN,100 > 100 (SHIFT)		XEN|100,XEN > XEN|100 (POP)			XEN|100,XEN,BOT > XEN|100,BOT
		if(spoofServersFound.length>1 && spoofServersFound.includes(serverJoined)){
			let n=spoofServersFound.indexOf(serverJoined);
			if(n===0){spoofServersFound.shift()}
			else if(n===spoofServersFound.length-1){spoofServersFound.pop()}
			else{spoofServersFound.splice(n,1)}
		}
	}	
	
	// CONSOLE LOG ALL WITH NO OTHER SPOOFING SERVER
	if(memberIsSpoofer==="yes" && spoofServersFound.length<1 && config.consoleLog==="all" && myServerFound==="no"){
		console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | "+userNoSpace+"("+member.id+") has joined Server: "+cc.cyan+serverJoined+cc.reset)
	}
	
	// CONSOLE LOG ALL WITH OTHER SPOOFING SERVERS
	if(memberIsSpoofer==="yes" && spoofServersFound.length>0){
		daServersConsole=cc.reset+" || other servers: "+cc.cyan+spoofServersFound.join(cc.reset+", "+cc.cyan)+cc.reset;
		daServers="\n**Other Servers**: "+spoofServersFound.join(", ");
		if(config.consoleLog==="all"){
			console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | "+userNoSpace+"("+member.id+") "
				+"has joined Server: "+cc.cyan+serverJoined+daServersConsole+cc.reset);
		}
	}
	
	// MY SERVER WAS FOUND IN ALL SERVERS - WHEN JOINING ANOTHER SERVER
	if(myServerFound==="yes" && memberIsSpoofer==="yes"){
		if(config.consoleLog!=="all"){
			console.info(timeStamp()+" User: "+cc.cyan+userNoSpace+cc.reset+"("+member.id+") "
			+"has joined Server: "+cc.cyan+serverJoined+daServersConsole+cc.reset)
		}
			
		let daMember=isWhiteListed(member.id);
		
		// DO NOT POST FINDING FOR STAFF
		if(daMember.isWhiteListed==="yes"){
			if(daMember.memberIs==="BotOrOwner"){
				return console.info(timeStamp()+" User above is "+cc.magenta+"Owner"+cc.reset+"/"+cc.magenta+"Bot"+cc.reset+".... so "+cc.green+"shhhhhh!"+cc.reset)
			}
			if(daMember.memberIs==="WhitelistedUser"){
				return console.info(timeStamp()+" User above, "+cc.cyan+userNoSpace+cc.reset+"("+member.id+"), has is a "+cc.green+"whiteListedMember"+cc.reset+"!")
			}
			if(daMember.memberIs==="WhitelistedRoled"){
				return console.info(timeStamp()+" User above, "+cc.cyan+userNoSpace+cc.reset+"("+member.id+"), has "+cc.green+"whiteListedRole(s)"+cc.reset+"!")
			}
		}
		
		// MODIFY EMBED
		slackMSG.embeds[0].color=parseInt(parseColor(embedSettings.warningColor));
		slackMSG.embeds[0].thumbnail.url=embedSettings.snipeImg;
		slackMSG.embeds[0].description="⚠ __**WARNING**__ ⚠\n**"
			+userNoSpace+"** has joined: **"+serverJoined+"**\n**Tag/ID**: "+user+daServers+"\n**On**: "+timeStamp(1);
		
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:352\n"+err.message)})
		
		if(spooferFlag==="kick" || spooferFlag==="ban"){
			
			//
			//		TIMER FOR PUNISHMENT
			//
			setTimeout(function(){
				let tempMember=bot.guilds.get(myServer.id).members.get(member.id); tempMember.user.username=userNoSpace;
				if(!tempMember){
					return moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({
						embed:{"color":0x009900,"description":"<@"+member.id+"> has decided to leave our server instead."}
					}).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:360\n"+err.message)});
				}
				else{
					
					// CHECK IF USER IS IN A SPOOFING SERVER
					let spoofServersFoundAgain=checkUser(tempMember.id);
					
					// CHECK IF MYSERVER IS IN ALL SERVERS AND REMOVE IT
					if(spoofServersFoundAgain.includes(myServer.name)){
						spoofServersFoundAgain=spoofServersFoundAgain.slice(0,-1);
					}
					
					let daTempMember=isWhiteListed(tempMember.id);
					
					// DO NOT POST FINDING FOR STAFF
					if(daTempMember.isWhiteListed==="yes"){
						if(daTempMember.memberIs==="WhitelistedUser"){
							console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") was added to "+cc.green+"whiteListedMembersIDs"+cc.reset+", the "+spooferFlag+" was not executed!")
						}
						if(daTempMember.memberIs==="WhitelistedRoled"){
							console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") was added to "+cc.green+"whiteListedRole(s)"+cc.reset+", the "+spooferFlag+" was not executed!")
						}
						spoofServersFoundAgain=[];
					}
					
					if(spoofServersFoundAgain.length>0){
						// MODERATOR BOT POSTS TO COMMAND CHANNEL
						
						if(spooferFlag==="ban"){
							moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({
								embed:{'color':0xFF0000,'description':'<@'+tempMember.id+'> ignored the `warning` so they were **banned** 🔨'}
							}).catch(err=>{console.info(timeStamp()+" "+cc.bgyellow+cc.black+" ERROR "+cc.reset+" L414\n"+err.message)});
							
							embedMSG={'color': 0xFF0000,'title': banMSG.title,'thumbnail': {'url': embedSettings.banImg},'description': banMSG.description}
						}
						else{
							moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({
								embed:{'color':0xFF0000,'description':'<@'+tempMember.id+'> ignored the `warning` so they were **kicked** 😏'}
							}).catch(err=>{console.info(timeStamp()+" [ERROR L]\n"+err.message+" | Member blocked me, so no message was sent")});
							
							embedMSG={'color': 0xFF0000,'title': kickMSG.title,'thumbnail': {'url': embedSettings.kickImg},'description': kickMSG.description}
						}
						
						moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).send({embed: embedMSG}).then(()=>{
							try {
								if(spooferFlag==="kick"){
									console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") ignored warning so they were "+cc.red+"KICKED"+cc.reset+"!")
									moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).kick("AutoKick: Rule violation, user was found in spoofing server(s)")
								}
								if(spooferFlag==="ban"){
									console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") ignored warning so they were "+cc.red+"BANNED"+cc.reset+"!")
									moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s)"})
								}
							}
							catch(err){
								console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:454\n"+err.message+" | No kick/ban PERMISSION")
							}
						}).catch(err=>{
							console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" L:492 | "+err.message+" | "
								+"Member has disable DMs still or still blocked me... so they were "+cc.red+"banned"+cc.reset+" without "+cc.yellow+"notice"+cc.reset+"!");
							moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me, so no message was sent"})
						})
					}
				}
			}, 60000 * minsUntilPunished)
			//
			//	END OF TIMER FOR PUNISHMENT
			//
		}
	}
});



// ##########################################################################
// #############################  MEMBER LEFT  ##############################
// ##########################################################################

bot.on("guildMemberRemove", member => {
	
	// EXIT IF BOT 
	if(member.user.bot){ return }
	
	// RESET VARIABLES
	let guild=member.guild, spoofServer="", daNoob="", mRoleNames;
	
	// VALIDATE USERNAME AND REPLACE SPACES WITH UNDERSCORE
	let user=member.user; let userNoSpace=user.username; let nuser=userNoSpace.split(/ +/);
		for(var xn="0";xn < nuser.length; xn++){ userNoSpace=userNoSpace.replace(" ","_") }
	
	// CHECK ALL SERVERS FROM SERVERLIST
	for(let serverN="0"; serverN < spoofServers.length; serverN++){
		// CHECK IF SERVER LEFT MATCHES ONE OF MY BLACKLISTED SERVER
		if(guild.id===spoofServers[serverN].server){
			spoofServer=spoofServers[serverN].name;
		}
	}
	
	// LOGGING EACH EVENT , TO DISABLE/REMOVE: DELETE EACH LINE, OR ADD COMMENT PARAM: //
	if(!spoofServer && !bot.guilds.get(myServer.id).members.get(user.id)){
		if(config.consoleLog==="all"){
			return console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | User: "+cc.cyan+userNoSpace+cc.reset+"("+member.id+") has left Server: "+cc.cyan+guild.name+cc.reset);
		}
	}
	
	
	// CHECK IF USER IS STILL IN MY SERVER
	if(bot.guilds.get(myServer.id).members.get(user.id)){
		daNoob=bot.guilds.get(myServer.id).members.get(user.id);
		
		let daMember=isWhiteListed(member.id);
		
		// DO NOT POST FINDING FOR STAFF
		if(daMember.isWhiteListed==="yes"){
			if(daMember.memberIs==="BotOrOwner"){
				return console.info(timeStamp()+" Owner/Bot has left: "+cc.cyan+spoofServer+cc.reset)
			}
			if(daMember.memberIs==="WhitelistedUser"){
				return console.info(timeStamp()+" User: "+cc.cyan+userNoSpace+cc.reset+"("+member.id+") has left: "+cc.cyan+spoofServer+cc.reset+". But they are "+cc.green+"whiteListed"+cc.reset+"!")
			}
			if(daMember.memberIs==="WhitelistedRoled"){
				return console.info(timeStamp()+" User: "+cc.cyan+userNoSpace+cc.reset+"("+member.id+") has left: "+cc.cyan+spoofServer+cc.reset+". But they have "+cc.green+"whiteListedRole(s)"+cc.reset+"!")
			}
		}
		
		slackMSG.embeds[0].color=parseInt(parseColor(embedSettings.goodColor));
		slackMSG.embeds[0].thumbnail.url=embedSettings.checkedImg;
		slackMSG.embeds[0].description="✅ __**USER LEFT SERVER**__ ✅\n**"
			+userNoSpace+"** has left: **"+spoofServer+"**\n**UserID**: `"+member.id+"`\n**On**: "+timeStamp(1)
		
		console.info(timeStamp()+" "+userNoSpace+"("+member.id+") has left: "+cc.cyan+spoofServer+cc.reset);
		
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:505]\n"+err.message)})
	}
});




// ##########################################################################
// ############################## TEXT COMMANDS #############################
// ##########################################################################
bot.on('message', message => {
	
	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, msg=message.content;
		
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT THE COMMAND CHANNEL ID AKA MODLOG
	if(channel.id!==myServer.cmdChanIDs[0]){ return }
	
	let command=msg.toLowerCase(), args=msg.toLowerCase().split(/ +/).slice(1); command=command.split(/ +/)[0]; command=command.slice(config.cmdPrefix.length);
		
	// IGNORE REGULAR CHAT
	if(!message.content.startsWith(config.cmdPrefix)){
		if(member){
			if(member.user){
				if(member.user.username){
					if(config.consoleLog==="all"){
						if(message.content){
							console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | "+member.user.username+" has said: "+cc.cyan+message.content+cc.reset)
						}
						/*
						else{
							console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | "+member.user.username+" sent a Slack/Embed MSG")
						}
						*/
					}
				}
			}
		}
		return
	}
	if(config.consoleLog==="all"){
		console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | "+cc.cyan+member.user.username+cc.reset+" typed a COMMAND: "+cc.green+message.content+cc.reset)
	}
	else{
		console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+" typed a COMMAND: "+cc.green+message.content+cc.reset)
	}
	
	// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
	let adminRole=guild.roles.find(role => role.name === myServer.adminRoleName);
		if(!adminRole){
			adminRole={"id":"111111111111111111"};
			console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.magenta+myServer.adminRoleName+cc.reset)
		}
	let modRole=guild.roles.find(role => role.name === myServer.modRoleName);
		if(!modRole){
			modRole={"id":"111111111111111111"};
			console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.magenta+myServer.modRoleName+cc.reset)
		}

//
//
//	
if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID){	// DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//
//

	// COMMAND: !HELP
	if(command=="help" || command=="commands"){
		if(args.length>0){
			slackMSG={"username":spoofNinja.name,"avatarURL":spoofNinja.avatar,"embeds":[{"color":parseInt(parseColor(embedSettings.goodColor)),"title":"","description":""}]};
			slackMSG.embeds[0].title="ℹ Available Syntax and Arguments ℹ";

			if(args[0]==="check"){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'check @mention/user_id` » for checking user, ie:\n'
									+' `'+config.cmdPrefix+'check @JennerPalacios` or\n'
									+' `'+config.cmdPrefix+'check 237597448032354304`\n'
									+' `'+config.cmdPrefix+'check wlmembers` » list of members that the bot ignores\n'
									+' `'+config.cmdPrefix+'check wlroles` » list of roles that the bot ignores\n'
									+' `'+config.cmdPrefix+'check server` » for checking **ALL** members'
			}
			if(args[0].startsWith("addm")){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'addmember`/`'+config.cmdPrefix+'addm` + `@mention/user_id`\n'
									+' » used for adding member to whiteList\n'
									+' » these members are ignored by the bot\n'
									+' IE: `'+config.cmdPrefix+'addmember @JennerPalacios`\n'
									+' OR: `'+config.cmdPrefix+'addmember 237597448032354304`'
			}
			if(args[0].startsWith("delm")){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'delmember`/`'+config.cmdPrefix+'delm` + `@mention/user_id`\n'
									+' » used for deleting member from whiteList\n'
									+' IE: `'+config.cmdPrefix+'delmember @JennerPalacios`\n'
									+' OR: `'+config.cmdPrefix+'delmember 237597448032354304`'
			}
			if(args[0].startsWith("addr")){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'addrole`/`'+config.cmdPrefix+'addr` + `role_name`\n'
									+' » used for adding role to whiteList\n'
									+' » these roles are ignored by the bot\n'
									+' IE: `'+config.cmdPrefix+'addrole Moderator`\n'
									+' OR: `'+config.cmdPrefix+'addmember VIP`'
			}
			if(args[0].startsWith("delr")){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'delrole`/`'+config.cmdPrefix+'delr` + `role_name`\n'
									+' » used for deleting role from whiteList\n'
									+' IE: `'+config.cmdPrefix+'delrole VIP`\n'
			}
			if(args[0]==="feedback"){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'feedback` » for providing feedback or suggestions\n'
									+' provide feedback to JennerPalacios, ie:\n'
									+' `'+config.cmdPrefix+'feedback Love it! great job you noOb!\n`'
									+' `'+config.cmdPrefix+'feedback Add a way to order Pizza!`'
			}
			if(args[0]==="bug"){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'bug` » for reporting a **bug**\n'
									+' please be specific, if possible use twice;\n'
									+' first, report the bug and provide description\n'
									+' then, what you get in the `console.log` or `cli`, ie:\n'
									+' `'+config.cmdPrefix+'bug I get error when checking member`\n'
									+' ```'+config.cmdPrefix+'bug TypeError: Cannot read property "members" of undefined\n'
									+'   at checkUser (/var/www/SpoofNinja/SpoofNinja.js:71:57)```'
			}
			if(args[0]==="onspoofer"){
				slackMSG.embeds[0].description='`'+config.cmdPrefix+'onSpoofer check` » to check current **action**\n'
									+'`'+config.cmdPrefix+'onSpoofer nothing` » to disable/do **nothing**\n'
									+'`'+config.cmdPrefix+'onSpoofer warning` » to send them a warning\n'
									+'`'+config.cmdPrefix+'onSpoofer kick` » to kick after '+minsUntilPunished+'min warning\n'
									+'`'+config.cmdPrefix+'onSpoofer ban` » to ban after '+minsUntilPunished+'min warning\n'
									+'`'+config.cmdPrefix+'onSpoofer instakick` » to kick instantly\n'
									+'`'+config.cmdPrefix+'onSpoofer instaban` » to ban instantly'
			}
		}
		else{
			slackMSG.embeds[0].title='ℹ Available Commands ℹ';
			slackMSG.embeds[0].description='```md\n'+config.cmdPrefix+'check <@mention/user_id>\n'
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
		return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:690]\n"+err.message)})
	}



	// COMMAND: !BUG ||FEEDBACK
	if(command==="bug" || command==="feedback"){
		slackMSG={"username":"[Dev]JennerPalacios","avatarURL":spoofNinja.avatar,"embeds":[{"color":parseInt(parseColor(embedSettings.goodColor)),"description":""}]};
			if(command==="bug"){
				slackMSG.embeds[0].description="Your `BugReport` has been recorded! Stay tuned <(^.^<)";
				botSupportWh.send("⚠ [BUGREPORT] on "+timeStamp(1)+"\n**By: **"+member.user.username+"[`"+member.user.id+"`]\n**From: **"+myServer.name+"[`"+myServer.invite+"`]\n```\n"+message.content.slice(4)+"\n```");
				return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:650]\n"+err.message)})
			}
			slackMSG.embeds[0].description="Thanks for your feedback <(^.^<)";
			botSupportWh.send("✅ [FEEDBACK] on "+timeStamp(1)+"\n**By: **"+member.user.username+" [`"+member.user.id+"`]\n**From: **"+myServer.name+"[`"+myServer.invite+"`]\n```\n"+message.content.slice(9)+"\n```");
			return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:705]\n"+err.message)})
	}
//
//
//
}//		DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//
//


//
//
//
//
if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID){ // DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//
//
//



	// COMMAND: !CHECK
	if(command=="check"){
		let u2c="", u2cn="";
		slackMSG={"username":spoofNinja.name,"avatarURL":spoofNinja.avatar,"embeds":[{"color":parseInt(parseColor(embedSettings.goodColor)),"description":""}]};		
			
		// COMMAND » !CHECK VERSION
		if(args.length>0 && args[0].startsWith("ver")){
			request("https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/version.txt",
				function(error,response,body){
					if(error){console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:739]\n"+error)}
					if(body){
						let gitHubVer=body.slice(0,-1);
						let verChecker="✅"; if(gitHubVer!==config.botVersion){ verChecker="⚠" }
						
						slackMSG.embeds[0].description="GitHub [`SpoofNinja`]: v**"+gitHubVer+"**\n"
									+"Local Bot [`"+spoofNinja.name+"`]: v**"+config.botVersion+"** "+verChecker+"\n"
									+"**Discord** API [`discord.js`]: v**"+Discord.version+"**\n"
									+"**Node** API [`node.js`]: **"+process.version+"**";
						spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:929]\n"+err.message)})
					}
				}
			);
			return
		}
		
		// COMMAND » !CHECK WLR | WLM » EXIT SCRIPT, MODERATOR-BOT WILL REPLY
		if(args.length>0 && args[0].startsWith("wlr") || args[0].startsWith("wlm")){
			return
		}
		
		
		// COMMAND » !CHECK SERVER
		if(args.length>0 && args[0]==="server"){
			
			slackMSG={"username":spoofNinja.name,"avatarURL":spoofNinja.avatar,"embeds":[{ "thumbnail":{"url":""},"color":"","description":""}]};
			
			let allUsersID=[], allUsersNames=[];
			guild.members.map(m=>{
				allUsersID.push(m.id)
				if(validUsername.test(m.user.username)==true){
					allUsersNames.push("noObName")
				}
				else{
					allUsersNames.push(m.user.username)
				}
			});
			
			let milSecs=1000, daServers="", totalSpoofers=0, n=0, nd=1;
			
			// SEND NOTIFICATION
			slackMSG.embeds[0].color=parseInt(parseColor(embedSettings.goodColor));
			slackMSG.embeds[0].thumbnail.url=embedSettings.startImg;
			slackMSG.embeds[0].description="**(>^.^)> NOTICE <(^.^<)**\nI am bout to check **"+allUsersID.length+"** users...\n"
				+"From server: **"+myServer.name+"**\n**On**: "+timeStamp(1)+"\n... please wait ...";
			spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:962]\n"+err.message)});
			console.info(timeStamp()+" About to check "+cc.cyan+allUsersID.length+cc.reset+" users, from server: "+cc.cyan+myServer.name+cc.reset);
			
			if(config.botSupport==="yes"){ globalNinjaWh.send({"embeds": [{"description": timeStamp(2)+"**"+myServer.name+"** has started a `"+config.cmdPrefix+"check server`, with **"+allUsersID.length+"** registered users <(^.^<)"}]}) }
			
			for(var xUser=0; xUser < allUsersID.length; xUser++){
				setTimeout(function(){
					console.info(timeStamp()+" ["+cc.yellow+nd+cc.reset+"/"+cc.green+allUsersID.length+cc.reset+"] Checking userID: "+cc.cyan+allUsersID[n]+cc.reset+" with userName: "+cc.cyan+allUsersNames[n]+cc.reset);
					
					let spoofServersFound=checkUser(allUsersID[n]);
					
					let daMember=isWhiteListed(allUsersID[n]);
					
					// DO NOT POST FINDING FOR STAFF
					if(daMember.isWhiteListed==="yes"){
						spoofServersFound=[];
						if(daMember.memberIs==="BotOrOwner"){
							console.info(timeStamp()+" I have skipped the user above due to: \""+cc.magenta+"config.json"+cc.reset+"\" » \""+cc.magenta+"ownerID"+cc.reset+"\" or \""+cc.magenta+"spoofNinja.id"+cc.reset+"\"!")
						}
						if(daMember.memberIs==="WhitelistedUser"){
							console.info(timeStamp()+" I have skipped the user above due to: \""+cc.magenta+"config.json"+cc.reset+"\" » \""+cc.magenta+"whiteListedMembersIDs"+cc.reset+"\"!")
						}
						if(daMember.memberIs==="WhitelistedRoled"){
							console.info(timeStamp()+" I have skipped the user above due to: \""+cc.magenta+"config.json"+cc.reset+"\" » \""+cc.magenta+"whiteListedRoles"+cc.reset+"\"!")
						}
					}
					
					// DO NOT CHECK OTHER BOTS
					if(daMember.isWhiteListed!=="yes" && bot.guilds.get(myServer.id).members.get(allUsersID[n]).user.bot){
						spoofServersFound=[];
						console.info(timeStamp()+" I have skipped the user above due to user being another \""+cc.magenta+"BOT"+cc.reset+"\"!")
					}
					
					//	CHECK IF MYSERVER IS IN ALL SERVERS AND REMOVE IT
					if(spoofServersFound.includes(myServer.name)){
						myServerFound="yes"; spoofServersFound=spoofServersFound.slice(0,-1);
					}
					
					if(spoofServersFound.length>0){
						//
						//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
						//
						slackMSG={
							'username': spoofNinja.name,
							'avatarURL': spoofNinja.avatar,
							'embeds': [{
								'thumbnail': {'url': embedSettings.snipeImg },
								'color': parseInt(parseColor(embedSettings.warningColor)),
								'description': '⚠ __**WARNING**__ ⚠\n**User**: '+allUsersNames[n]+'\n**Tag/ID**: <@'+allUsersID[n]+'> \nWas **found** in server(s): \n'
									+spoofServersFound.join(", ")+'\n**On**: '+timeStamp(1),
								'footer': {
									'text': 'User #'+nd+' of '+allUsersID.length+'...'
								}
							}]
						};
						// POST NOOB FOUND IN SPOOFER SERVER
						spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" [ERROR L:1033]\n"+err.message)});
						console.log(timeStamp()+" User: "+cc.cyan+allUsersNames[n]+cc.reset+"("+allUsersID[n]+") was "
							+cc.red+"FOUND"+cc.reset+" in Server(s): "+cc.cyan+spoofServersFound.join(cc.reset+", "+cc.cyan)+cc.reset);
						
						// ADD TO TOTALSPOOFERS COUNT
						totalSpoofers++
						
						// RESET DATA FOR NEXT USER IN WAIT-LIST
						spoofServersFound=[];
					}
					

					// END NOTIFICATION
					if(nd===allUsersID.length){
						slackMSG={
							'username': spoofNinja.name,
							'avatarURL': spoofNinja.avatar,
							'embeds': [{
								'thumbnail': {'url': embedSettings.endImg },
								'color': parseInt(parseColor(embedSettings.goodColor)),
								'description': '**(>^.^)> ALL DONE <(^.^<)**\n.\nI __found__ a total of **'+totalSpoofers
									+'** potential spoOfers!\n.\nOut of **'+allUsersID.length+'** registered members\n**On**: '+timeStamp(1)
							}]
						}; 
						console.info(timeStamp()+" "+cc.bggreen+cc.white+" DONE "+cc.reset+" I have checked "+cc.green+allUsersID.length+cc.reset+" and found "+cc.red+totalSpoofers+cc.reset+" potential spoofers!")
						
						if(config.botSupport==="yes"){ globalNinjaWh.send(timeStamp(2)+"**"+myServer.name+"** has found `"
							+totalSpoofers+"` spoofers, out of `"+allUsersID.length+"` users on their server <(^.^<)"); }
						
						spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:596\n"+err.message)})
					}
					
					// ADD +1 TO COUNT TO CHECK NEXT USER
					n++, nd++;
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
			
			// DO NOT CHECK OTHER BOTS
			if(bot.guilds.get(myServer.id).members.get(u2c)){
				if(bot.guilds.get(myServer.id).members.get(u2c).user.bot){
					console.info(timeStamp()+" I have skipped the user above due to user being another \""+cc.magenta+"BOT"+cc.reset+"\"!");
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'thumbnail': {'url': embedSettings.honorImg },
							'color': parseInt(parseColor(embedSettings.goodColor)),
							'description': '✅ "**'+u2cn+'**" appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍'
						}]
					};
					return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1110\n"+err.message)})
				}
			}
		
			let daMember=isWhiteListed(u2c);
			
			// DO NOT POST FINDING FOR WHITELISTED
			if(daMember.isWhiteListed==="yes"){
				if(daMember.memberIs==="BotOrOwner"){
					console.info(timeStamp()+" I have skipped the user above due to: \""+cc.magenta+"config.json"+cc.reset+"\" » \""+cc.magenta+"ownerID"+cc.reset+"\" or \""+cc.magenta+"spoofNinja.id"+cc.reset+"\"!")
				}
				if(daMember.memberIs==="WhitelistedUser"){
					console.info(timeStamp()+" I have skipped the user above due to: \""+cc.magenta+"config.json"+cc.reset+"\" » \""+cc.magenta+"whiteListedMembersIDs"+cc.reset+"\"!")
				}
				if(daMember.memberIs==="WhitelistedRoled"){
					console.info(timeStamp()+" I have skipped the user above due to: \""+cc.magenta+"config.json"+cc.reset+"\" » \""+cc.magenta+"whiteListedRoles"+cc.reset+"\"!")
				}
				slackMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'thumbnail': {'url': embedSettings.honorImg },
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '✅ "**'+u2cn+'**" appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍'
					}]
				}
				return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1110\n"+err.message)})
			}
			
			// CHECK FOR THE PERSON USING SPOOFING SERVERS LIST
			let spoofServersFound=checkUser(u2c);
			
			//	CHECK IF MYSERVER IS IN ALL SERVERS AND REMOVE IT
			if(spoofServersFound.includes(myServer.name)){
				myServerFound="yes"; spoofServersFound=spoofServersFound.slice(0,-1);
			}
			
			// USER WAS NOT FOUND IN ANY SPOOFING SERVER - FOR TEST CHANNEL
			if(spoofServersFound.length<1){
				//
				//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
				//
				slackMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'thumbnail': {'url': embedSettings.honorImg },
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': '✅ "**'+u2cn+'**" appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍'
					}]
				};
				
				if(config.consoleLog==="all"){
					console.info(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | User: "+cc.cyan+u2c+cc.reset+" appears to be a "+cc.green+"LEGIT"+cc.reset+" Trainer")
				}
				else{
					console.info(timeStamp()+" User: "+cc.cyan+u2c+cc.reset+" appears to be a "+cc.green+"LEGIT"+cc.reset+" Trainer")
				}
			}
			
			// USER WAS FOUND IN A SPOOFING SERVER
			else{
				//
				//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
				//
				slackMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'thumbnail': {'url': embedSettings.snipeImg },
						'color': parseInt(parseColor(embedSettings.warningColor)),
						'description': '⚠ __**WARNING**__ ⚠\n**User**: '+u2cn+'\n**Tag/ID**: <@'+u2c+'>\nWas **found** in __servers__:\n'+spoofServersFound.join(", ")+'\n**On**: '+timeStamp(1)
					}]
				};
				
				if(config.consoleLog==="all"){
					console.log(timeStamp()+" "+cc.magenta+"consoleLog="+config.consoleLog+cc.reset+" | User: "+cc.cyan+u2cn+cc.reset+"("+cc.cyan+u2c+cc.reset
						+") was "+cc.red+"FOUND"+cc.reset+" in servers: "+cc.cyan+spoofServersFound.join(cc.reset+", "+cc.cyan)+cc.reset)
				}
				else{
					console.log(timeStamp()+" User: "+cc.cyan+u2cn+cc.reset+"("+cc.cyan+u2c+cc.reset+") was "+cc.red+"FOUND"+cc.reset
						+" in servers: "+cc.cyan+spoofServersFound.join(cc.reset+", "+cc.cyan)+cc.reset)
				}
			}
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1195\n"+err.message)})
		}
		// MENTIONED IS INCORRECT FORMAT - NO A VALID @MENTION OR USER_ID
		else{
			if(args[0]!=="server"){
				slackMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseInt(parseColor(embedSettings.goodColor)),
						'description': 'Please `@mention` a person you want me to `'+config.cmdPrefix+'check`, you can use `@user_tag` or `user_id_number`'
					}]
				};
				
				// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
				return spoofNinjaWh.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1210\n"+err.message)})
			}
		}
	}
//
//
//
//
}	//		DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
//
//
//
//

	// RESTART THIS MODULE
	if(command==="restart" && member.id===config.ownerID && args[0]==="spoofninja"){
		slackMSG={
			'username': spoofNinja.name,
			'avatarURL': spoofNinja.avatar,
			'embeds': [{
				'color': parseInt(parseColor(embedSettings.goodColor)),
				'description': '♻ Restarting **spoOfNinja**\n » please wait `3` to `5` seconds...'
				}]
			};
		spoofNinjaWh.send(slackMSG).then(()=>{ process.exit(1) }).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1233\n"+err.message)})
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
	console.info(timeStamp()+" -- DISCORD SpoofNinja, ModeratorBot: "+cc.yellow+moderatorBot.user.username+cc.reset+", IS "+cc.green+"READY"+cc.reset+" --");
});



moderatorBot.on('message', message => {
	//STOP SCRIPT IF DM OR ANOTHER GUILD
	if(message.channel.type==="dm"){ return }  if(message.guild.id!==myServer.id){ return }
	
	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, msg=message.content;
		
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT THE COMMAND CHANNEL ID AKA MODLOG
	if(!myServer.cmdChanIDs.includes(channel.id)){ return }
	
	// GRAB COMMAND AND ARGUMENTS
	let command=msg.toLowerCase(), args=msg.toLowerCase().split(/ +/).slice(1); args2=msg.split(/ +/).slice(1); command=command.split(/ +/)[0]; command=command.slice(config.cmdPrefix.length);
	
	// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
	let adminRole=guild.roles.find(role => role.name === myServer.adminRoleName); if(!adminRole){ adminRole={"id":"111111111111111111"}; console.info("["+cc.red+"ERROR"+cc.reset+"] [CONFIG] I could not find role: "+myServer.adminRoleName); }
	let modRole=guild.roles.find(role => role.name === myServer.modRoleName); if(!modRole){ modRole={"id":"111111111111111111"}; console.info("["+cc.red+"ERROR"+cc.reset+"] [CONFIG] I could not find role: "+myServer.modRoleName); }
	
	if(myServer.cmdChanIDs.includes(channel.id)){
		if(msg){
			if(msg.startsWith(config.cmdPrefix)){
				
				//
				//
				//
				//
				if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===config.ownerID){ // DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
				//
				//
				//
				//
					
					// PUNISHMENT ACTION
					if(command==="onspoofer"){
						embedMSG={
							"color": 0x00FF00,
							"title": "ℹ Available Syntax and Arguments ℹ",
							"description": "`"+config.cmdPrefix+"onSpoofer check` » to check current **action**\n"
								+"`"+config.cmdPrefix+"onSpoofer nothing` » to disable/do **nothing**\n"
								+"`"+config.cmdPrefix+"onSpoofer warning` » to send them a warning\n"
								+"`"+config.cmdPrefix+"onSpoofer kick` » to kick after "+minsUntilPunished+"min warning\n"
								+"`"+config.cmdPrefix+"onSpoofer ban` » to ban after "+minsUntilPunished+"min warning\n"
								+"`"+config.cmdPrefix+"onSpoofer instakick` » to kick instantly\n"
								+"`"+config.cmdPrefix+"onSpoofer instaban` » to ban instantly"
						};
						if(args.length>0){
						
							// CONFIGURATION FILE
							let configFile=JSON.parse(fs.readFileSync("./files/config.json", "utf8"));
							if(args[0]==="nothing"){
								spooferFlag="nothing";
								configFile.myServer.onSpooferFound="nothing";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return channel.send({embed:{"color":0x00FF00,"description":"🚫 If `SpoofNinja` finds a possible spoofer, I will do **nothing** 👎"}})
							}
							if(args[0].startsWith("warn")){
								spooferFlag="warning";
								configFile.myServer.onSpooferFound="warning";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return channel.send({embed:{"color":0x00FF00,"description":"⚠ If `SpoofNinja` finds a possible spoofer, I will send them a **warning** 😏"}})
							}
							if(args[0]==="kick"){
								spooferFlag="kick";
								configFile.myServer.onSpooferFound="kick";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return channel.send({embed:{"color":0x00FF00,"description":"👞 If `SpoofNinja` finds a possible spoofer, I will send them a **warning**. After `"+minsUntilPunished+" minute(s)`, "
									+"if they're still in a spoofing server, I will **kick** their butts"}})
							}
							if(args[0]==="ban"){
								spooferFlag="ban";
								configFile.myServer.onSpooferFound="ban";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return channel.send({embed:{"color":0x00FF00,"description":"⛔ If `SpoofNinja` finds a possible spoofer, I will send them a **warning**. After `"+minsUntilPunished+" minute(s)`, "
									+"if they're still in a spoofing server, I will **ban** their butts"}})
							}
							if(args[0]==="instakick"){
								spooferFlag="instakick";
								configFile.myServer.onSpooferFound="instakick";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return channel.send({embed:{"color":0x00FF00,"description":"✅ If `SpoofNinja` finds a possible spoofer, I will 👞**kick**💪 their butts `instantly`!"}})
							}
							if(args[0]==="instaban"){
								spooferFlag="instaban";
								configFile.myServer.onSpooferFound="instaban";
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								return channel.send({embed:{"color":0x00FF00,"description":"✅ If `SpoofNinja` finds a possible spoofer, I will ⛔**ban**🔨 their asses `instantly`!"}})
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
					
					// CHECK WHITELIST
					if(command==="check"){
						let whiteListedMembersIDs=[], whiteListedRoles=[];
							if(myServer.whiteListedMembersIDs.length>0){ whiteListedMembersIDs=myServer.whiteListedMembersIDs }
							if(myServer.whiteListedRoles.length>0){ whiteListedRoles=myServer.whiteListedRoles }
						// COMMAND » !CHECK ROLES
						if(args.length>0 && args[0].startsWith("wlr")){
							if(whiteListedRoles.length<1){
								embedMSG={
									'color': parseInt(parseColor(embedSettings.warningColor)),
									'description': '⚠ There aren\'t any `whiteListedRoles`'
								}
							}
							embedMSG={
								'color': parseInt(parseColor(embedSettings.goodColor)),
								'description': '✅ I have **'+whiteListedRoles.length+'** `whiteListedRoles`:\n'+whiteListedRoles.join(", ")
							};
							return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:870\n"+err.message)});
						}
						
						// COMMAND » !CHECK MEMBER IDs
						if(args.length>0 && args[0].startsWith("wlm")){
							if(whiteListedMembersIDs.length<1){
								embedMSG={
									'color': parseInt(parseColor(embedSettings.warningColor)),
									'description': '⚠ There aren\'t any `whiteListedMembersIDs`'
								}
							}
							if(whiteListedMembersIDs.length>0 && whiteListedMembersIDs.length<89){
								embedMSG={
									'color': parseInt(parseColor(embedSettings.goodColor)),
									'description': '✅ I have **'+whiteListedMembersIDs.length+'** `whiteListedMembersIDs`:\n<@'+whiteListedMembersIDs.join(">, <@")+'>'
								}
							}
							else{
								embedMSG={
									'color': parseInt(parseColor(embedSettings.warningColor)),
									'description': '⚠ There are too many members in `whiteListedMembersIDs`, max **88**, currently: `'+whiteListedMembersIDs.length+'`. '
										+'You should consider creating a `whiteListedRole` and assigning users to it.'
								}				
							}
							return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:906\n"+err.message)});
						}
					}
					
					// MODIFY WHITELIST: ADD || DEL - ROLES || MEMBERS
					if(command.startsWith("addr")||command.startsWith("delr")||command.startsWith("addm")||command.startsWith("delm")){
						
						// CONFIGURATION FILE
						let configFile=JSON.parse(fs.readFileSync("./files/config.json", "utf8"));
						
						// ADD ROLE TO WHITELIST
						if(command.startsWith("addr") && member.id===config.ownerID){
							if(!args2[0]){
								embedMSG={
									'color': parseInt(parseColor(embedSettings.goodColor)),
									'title': 'ℹ Available Syntax and Arguments ℹ',
									'description': '`'+config.cmdPrefix+'addrole <roleName>` or `'+config.cmdPrefix+'addr <roleName>`\n» for adding a role to `whiteListedRoles`\n'
										+'» IE: `'+config.cmdPrefix+'addrole VIP`\n» case sensitive, role must exist!'
								}
							}
							else{
								configFile.myServer.whiteListedRoles.push(args2[0]);
								myServer.whiteListedRoles.push(args2[0]);
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								embedMSG={
									'color': parseInt(parseColor(embedSettings.goodColor)),
									'description': '✅ The role: `'+args2[0]+'` was **successfully** added to `whiteListedRole`'
								}
							}
							return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" ERROR L:699\n"+err.message)})
						}
						
						// DELETE ROLE FROM WHITELIST
						if(command.startsWith("delr") && member.id===config.ownerID){
							if(!args2[0]){
								embedMSG={
									'color': parseInt(parseColor(embedSettings.warningColor)),
									'title': 'ℹ Available Syntax and Arguments ℹ',
									'description': '`'+config.cmdPrefix+'delrole <roleName>` or `'+config.cmdPrefix+'delr <roleName>`\n» for removing a role from `whiteListedRoles`\n'
										+'» IE: `'+config.cmdPrefix+'addrole VIP`\n» case sensitive, role must exist!'
								}
							}
							else{
								let n=myServer.whiteListedRoles.indexOf(args2[0]);
								if(n===-1){
									embedMSG={
										'color': parseInt(parseColor(embedSettings.dangerColor)),
										'description': '⛔ The role: `'+args2[0]+'` was not found in `whiteListedRole`'
									}
								}
								else{
									configFile.myServer.whiteListedRoles.splice(n,1);
									myServer.whiteListedRoles.splice(n,1);
									fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
									embedMSG={
										'color': parseInt(parseColor(embedSettings.goodColor)),
										'description': '✅ The role: `'+args2[0]+'` was **successfully** removed to `whiteListedRole`'
									}
								}
							}
							return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" ERROR L:740\n"+err.message)})
						}
						
						// ADD USER TO WHITELIST
						if(command.startsWith("addm") && member.id===config.ownerID){
							if(!args2[0]){
								embedMSG={
									'color': parseInt(parseColor(embedSettings.warningColor)),
									'title': 'ℹ Available Syntax and Arguments ℹ',
									'description': '`'+config.cmdPrefix+'addmember @mention` or `'+config.cmdPrefix+'addm @mention`\n» for adding a member to `whiteListedMembersIDs`\n'
										+'» IE: `'+config.cmdPrefix+'addmember @JennerPalacios`\n» member must be in server\n'
										+'» OR: `'+config.cmdPrefix+'addmember 237597448032354304`\n» member is **NOT** in server'
								}
							}
							else{
								// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
								let mentioned; if(message.mentions.users.first()){ mentioned=message.mentions.users.first() }
								
								// IF USER ID WAS PROVIDED INSTEAD OF @MENTIONED
								if(args2.length>0 && Number.isInteger(parseInt(args2[0]))){ mentioned={ id: args2[0] } }
								
								configFile.myServer.whiteListedMembersIDs.push(mentioned.id);
								myServer.whiteListedMembersIDs.push(mentioned.id);
								fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
								embedMSG={
									'color': parseInt(parseColor(embedSettings.goodColor)),
									'description': '✅ The member: <@'+mentioned.id+'> was **successfully** added to `whiteListedMembersIDs`'
								}
							}
							return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:779\n"+err.message)})
						}
						
						// DELETE MEMBER FROM WHITELIST
						if(command.startsWith("delm") && member.id===config.ownerID){
							if(!args2[0]){
								embedMSG={
									'color': parseInt(parseColor(embedSettings.warningColor)),
									'title': 'ℹ Available Syntax and Arguments ℹ',
									'description': '`'+config.cmdPrefix+'delrole <roleName>` or `'+config.cmdPrefix+'delr <roleName>`\n» for removing a role from `whiteListedMembersIDs`\n'
										+'» IE: `'+config.cmdPrefix+'addrole VIP`\n» case sensitive, role must exist!'
								}
							}
							else{
								// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
								let mentioned; if(message.mentions.users.first()){ mentioned=message.mentions.users.first() }
								
								// IF USER ID WAS PROVIDED INSTEAD OF @MENTIONED
								if(args2.length>0 && Number.isInteger(parseInt(args2[0]))){ mentioned={ id: args2[0] } }
								
								let n=configFile.myServer.whiteListedMembersIDs.indexOf(mentioned.id);
								if(n===-1){
									embedMSG={
										'color': parseInt(parseColor(embedSettings.dangerColor)),
										'description': '⛔ The member: <@'+mentioned.id+'> was not found in `whiteListedMembersIDs`'
									}
								}
								else{
									configFile.myServer.whiteListedMembersIDs.splice(n,1);
									myServer.whiteListedMembersIDs.splice(n,1);
									fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
									embedMSG={
										'color': parseInt(parseColor(embedSettings.goodColor)),
										'description': '✅ The member: `'+mentioned.id+'` was **successfully** removed to `whiteListedMembersIDs`'
									}
								}
							}
							return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:826\n"+err.message)})
						}
					
					}
				//
				//
				//
				//
				} //	DISABLE FOR GLOBAL USE - ANY USER - AT DEVELOPER'S SERVER
				//
				//
				//
				//
			}
		}
		if(myServer.cmdChanIDs[0]===channel.id){
			if(message.embeds.length!==0){
				if(message.embeds[0]){
					if(message.embeds[0].message.webhookID===webhookID){
						let spoofNinja=message.embeds[0].description;
						if(spoofNinja){
							if(spoofNinja.split("\n")){
								spoofNinja=spoofNinja.split("\n")
								if(spoofNinja.length>2){
									
									// SEARCH FOR "JOINED" WORD IN JOIN-EVENTS
									let joinEvent=spoofNinja.some(txt=>txt.includes("joined")), foundEvent=false;
									if(joinEvent===false){ joinEvent=spoofNinja.some(txt=>txt.includes("joined:")) }
									
									if(joinEvent===true){
										let catchID=spoofNinja[2].split(/ +/);
										catchID=catchID[1].slice(2,-1);
										
										if(!guild.members.get(catchID)){ return }
										
										let tempMember=guild.members.get(catchID);
										
										if(spooferFlag==="nothing"){
											return
										}
										
										if(spooferFlag==="warning" || spooferFlag==="kick" || spooferFlag==="ban"){
											embedMSG={
												'color': 0xFF0000,
												'title': warningMSG.title,
												'thumbnail': {'url': embedSettings.warningImg},
												'description': warningMSG.description
											};
											if(spooferFlag==="warning"){
												channel.send({
													embed:{'color':0xFF9900,'description':'A **warning** has been sent to: <@'+catchID+'>'}
												}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1362\n"+err.message)})
											}
											if(spooferFlag==="kick"){
												channel.send({
													embed:{'color':0xFF9900,'description':'A **warning** has been sent to: <@'+catchID+'>. They will be '
													+'**kicked** in `'+minsUntilPunished+' minute(s)` if they haven\'t left the spoofing server(s).'}
												}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1368\n"+err.message)})
											}
											if(spooferFlag==="ban"){
												channel.send({
													embed:{'color':0xFF9900,'description':'A **warning** has been sent to: <@'+catchID+'>. They will be '
													+'**banned** in `'+minsUntilPunished+' minute(s)` if they haven\'t left the spoofing server(s).'}
												}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1374\n"+err.message)})
											}
											guild.members.get(catchID).send({embed: embedMSG}).catch(err=>{
												console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" L:1377 | "+err.message+" | "
													+"Member has disabled DMs or has blocked me... No "+cc.yellow+"warning"+cc.reset+" was sent, I will try to "
													+cc.red+"ban"+cc.reset+" in "+cc.green+minsUntilPunished+" minute(s)"+cc.reset+" instead!")
											})
										}
										
										if(spooferFlag==="instakick"){
											embedMSG={
												'color': 0xFF0000,
												'title': kickMSG.title,
												'thumbnail': {'url': embedSettings.kickImg},
												'description': kickMSG.description
											};
											channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> has been **KICKED**! 💪'}});
											guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
												try {
													console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") ignored warning so they were "+cc.red+"KICKED"+cc.reset+"!")
													guild.members.get(catchID).kick("AutoKick: Rule violation, user was found in spoofing server(s)")
												}
												catch(err){
													console.info(timeStamp()+" ["+cc.red+"ERROR"+cc.reset+"] L:1396\n"+err.message);
												}
											}).catch(err=>{
												console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" L:1400 | "+err.message+" | "
													+"Member has disabled DMs or has blocked me... so they were "+cc.red+"instantly banned"+cc.reset+" instead!");
												guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
											})
										}
										
										if(spooferFlag==="instaban"){
											embedMSG={
												'color': 0xFF0000,
												'title': banMSG.title,
												'thumbnail': {'url': embedSettings.banImg},
												'description': banMSG.description
											};
											channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> has been **BANNED**! ⛔'}});
											guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
												try {
													console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") ignored warning so they were "+cc.red+"BANNED"+cc.reset+"!")
													guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s)"})
												}
												catch(err){
													channel.send(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L1419\n"+err.message);
												}
											}).catch(err=>{
												console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" L:1424 | "+err.message+" | "
													+"Member has disabled DMs or has blocked me... so they were "+cc.red+"instantly banned"+cc.reset+" instead!");
												guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
											})
										}
										return
									}
									
									
									// SEARCH FOR "**found**" WORD IN !CHECK <@MENTION/USER_ID> OR IN !CHECK SERVER			// WIP
									if(joinEvent===false){foundEvent=spoofNinja.some(txt=>txt.includes("**found**"))}
									if(foundEvent===true){
										let catchID=spoofNinja[2].split(/ +/);
										catchID=catchID[1].slice(2,-1);
										if(!guild.members.get(catchID)){ return }
										
										if(spooferFlag==="nothing"){
											return
										}
										
										if(spooferFlag==="warning" || spooferFlag==="kick" || spooferFlag==="ban"){
											embedMSG={
												'color': 0xFF0000,
												'title': warningMSG.title,
												'thumbnail': {'url': embedSettings.warningImg},
												'description': warningMSG.description
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
											
											guild.members.get(catchID).send({embed: embedMSG}).catch(err=>{
												console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" L:1467 | "+err.message+" | "
													+"Member has disabled DMs or has blocked me...")
											})
											
											if(spooferFlag==="kick" || spooferFlag==="ban"){
												//
												// TIMER FOR PUNISHMENT
												//
												setTimeout(function(){
													let tempMember=bot.guilds.get(myServer.id).members.get(catchID);
													if(!tempMember){
														return moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({embed:{'color':0x009900,'description':'<@'+catchID+'> has decided to leave our server instead.'}}).catch(err=>{console.info(timeStamp()+" [ERROR L:360]\n"+err.message)});
													}
													else{
														// CHECK IF USER IS IN A SPOOFING SERVER
														let spoofServersFoundAgain=checkUser(tempMember.id);
														
														// CHECK IF MYSERVER IS IN ALL SERVERS AND REMOVE IT
														if(spoofServersFoundAgain.includes(myServer.name)){
															spoofServersFoundAgain=spoofServersFoundAgain.slice(0,-1);
														}
					
														let daTempMember=isWhiteListed(tempMember.id);
														
														// DO NOT POST FINDING FOR STAFF
														if(daTempMember.isWhiteListed==="yes"){
															if(daTempMember.memberIs==="WhitelistedUser"){
																console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") was added to "+cc.green+"whiteListedMembersIDs"+cc.reset+", the "+spooferFlag+" was not executed!")
															}
															if(daTempMember.memberIs==="WhitelistedRoled"){
																console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") was added to "+cc.green+"whiteListedRole(s)"+cc.reset+", the "+spooferFlag+" was not executed!")
															}
															spoofServersFoundAgain=[];
														}
														
														if(spoofServersFoundAgain.length>0){
															// MODERATOR BOT POSTS TO COMMAND CHANNEL
															
															if(spooferFlag==="ban"){
																moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({
																	embed:{'color':0xFF0000,'description':'<@'+tempMember.id+'> ignored the `warning` so they were **banned** 🔨'}
																}).catch(err=>{console.info(timeStamp()+" [ERROR L]\n"+err.message)});
																
																embedMSG={
																	'color': 0xFF0000,
																	'title': banMSG.title,
																	'thumbnail': {'url': embedSettings.banImg},
																	'description': banMSG.description
																}
															}
															else{
																moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({
																	embed:{'color':0xFF0000,'description':'<@'+tempMember.id+'> ignored the `warning` so they were **kicked** 😏'}
																}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:1509\n"+err.message)});
																
																embedMSG={
																	'color': 0xFF0000,
																	'title': kickMSG.title,
																	'thumbnail': {'url': embedSettings.kickImg},
																	'description': kickMSG.description
																}
															}
															
															moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).send({embed: embedMSG}).then(()=>{
																try {
																	if(spooferFlag==="kick"){
																		console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") ignored warning so they were "+cc.red+"KICKED"+cc.reset+"!")
																		moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).kick("AutoKick: Rule violation, user was found in spoofing server(s)")
																	}
																	if(spooferFlag==="ban"){
																		console.info(timeStamp()+" User: "+cc.cyan+tempMember.user.username+cc.reset+"("+tempMember.id+") ignored warning so they were "+cc.red+"BANNED"+cc.reset+"!")
																		moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s)"})
																	}
																}
																catch(err){
																	console.info(timeStamp()+" ["+cc.red+"ERROR"+cc.reset+"]\n"+err.message)
																}
															}).catch(err=>{
																console.info(timeStamp()+" ["+cc.red+"ERROR"+cc.reset+"]\n"+err.message+" | Member blocked me, so no message was sent and they were "+cc.red+"instantly banned"+cc.reset);
																moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
															})
														}
													}
												}, 60000 * minsUntilPunished)
												//
												//	END OF TIMER FOR PUNISHMENT
												//
											}
										}
										
										if(spooferFlag==="instakick"){
											embedMSG={
												'color': 0xFF0000,
												'title': kickMSG.title,
												'thumbnail': {'url': embedSettings.kickImg},
												'description': kickMSG.description
											};
											channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> has been **KICKED**! 💪'}});
											guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
												try {
													guild.members.get(catchID).kick("AutoKick: Rule violation, user was found in spoofing server(s)")
												}
												catch(err){
													channel.send(" catch(err) ERROR:\n"+err.message);
												}
											}).catch(err=>{
												console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" L:1616 | "+err.message+" | "
													+"Member has disabled DMs or has blocked me... so no "+cc.red+"KICK"+cc.reset+"-message was sent; I will "+cc.red+"BAN"+cc.reset+" them instead!");
												guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
											})
										}
										
										if(spooferFlag==="instaban"){
											embedMSG={
												'color': 0xFF0000,
												'title': banMSG.title,
												'thumbnail': {'url': embedSettings.banImg},
												'description': banMSG.description
											};
											channel.send({embed:{'color':0xFF0000,'description':'<@'+catchID+'> has been **BANNED**! ⛔'}});
											guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
												try {
													guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s)"})
												}
												catch(err){
													console.info(timeStamp()+" catch(err) ["+cc.red+"ERROR"+cc.reset+"]\n"+err.message);
												}
											}).catch(err=>{
												console.info(timeStamp()+" "+cc.bgyellow+cc.black+" WARNING "+cc.reset+" L:1638 | "+err.message+" | "
													+"Member has disabled DMs or has blocked me... so no "+cc.red+"BAN"+cc.reset+"-message was sent!");
												guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
											})
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
});

moderatorBot.login(config.moderatorBot.token);

moderatorBot.on('disconnect', function (){
	console.info(timeStamp()+ ' -- MODERATOR BOT FOR SPOOFNINJA HAS DISCONNECTED --')
});
