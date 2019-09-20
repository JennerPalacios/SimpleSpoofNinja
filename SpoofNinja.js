//
//		CHECK THE LINE BELOW...DO THESE MAKE NO SENSE? ARE THEY RANDOM CHARACTERS?
//
// 		🔴 📵 🗨 📗 🗒 📜 📋 📝 📆 📲 👤 👥 🤖 📥 📤 ✅ ⚠ ⛔ 🚫 ❌ 🔨 🙂 😮 😁 😄 😆 😂 😅 😛 😍 😉 🤔 👍 👎 ❤
//
//		THEN YOU NEED TO ADJUST YOUR SETTINGS!!! "Encoding" ► "Encode in UTF-8"
//		... BECAUSE THESE ARE ACTUAL IN-TEXT EMOJIS (WHICH DISCORD ALSO USES)
//
const Discord=require("discord.js");
const fs=require("fs");
const request = require("request");
const serversFile=require("./files/servers.json");
const spoofServers=serversFile.servers;
const moderatorBot=new Discord.Client();
//
//		PICK ONE BELOW, ONLY ONE CAN BE ENABLED, THE OTHER ONE MUST BE COMMENTED-OUT BY ADDING "//" AT THE BEGINNING
//		"SLOW LOAD" IS RECOMMENDED WHEN LAUNCHING THE BOT FOR THE FIRST TIME, IT GRABS ALL MEMBERS FROM ALL SERVERS
//
const bot=new Discord.Client({fetchAllMembers: true}); //		SLOW LOAD - GET OVER 1B MEMBERS (FROM ALL SERVERS)
//const bot=new Discord.Client(); //							FAST LOAD - GET ACTIVE MEMBERS ONLY
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
		return cc.blue+yr+"/"+mo+"/"+da+" "+hr+":"+min+":"+sec+cc.reset+" |"
	}
	if(type===1){
		// `MM/DD/YYYY` **@** `HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+"` **@** `"+hr+":"+min+":"+sec+"`"
	}
	if(type===2){
		// `MM/DD/YYYY @ HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+" @ "+hr+":"+min+":"+sec+"`"
	}
}



//
//		DEFINE GLOBAL AND COMMON VARIABLES
//
var config=require("./files/config.json");		// CONFIG FILE
	config.botVersion="4.7";					// LOCAL VERSION
//
//
//

// serverCount="", botIsInServer="no", memberIsSpoofer="no", noobFound="", serversFound=[];

var botIsInServer, noobFound, memberIsSpoofer, serversFound, noobJoined, slackMSG, embedMSG, myServerFound,
	myServer=config.myServer, spoofNinja=config.spoofNinja, embedSettings=config.embedSettings,
	minsUntilPunished=parseInt(config.myServer.minsUntilPunished), spooferFlag=config.myServer.onSpooferFound, daServers, whiteListedMembersIDs=[], whiteListedRoles=[],
	cc={"reset":"\x1b[0m","ul":"\x1b[4m","lred":"\x1b[91m","red":"\x1b[31m","lgreen":"\x1b[92m","green":"\x1b[32m","lyellow":"\x1b[93m","yellow":"\x1b[33m",
		"lblue":"\x1b[94m","blue":"\x1b[34m","lcyan":"\x1b[96m","cyan":"\x1b[36m","pink":"\x1b[95m","purple":"\x1b[35m","bgwhite":"\x1b[107m","bggray":"\x1b[100m",
		"bgred":"\x1b[41m","bggreen":"\x1b[42m","bglgreen":"\x1b[102m","bgyellow":"\x1b[43m","bgblue":"\x1b[44m","bglblue":"\x1b[104m","bgcyan":"\x1b[106m",
		"bgpink":"\x1b[105m","bgpurple":"\x1b[45m","hlwhite":"\x1b[7m","hlred":"\x1b[41m\x1b[30m","hlgreen":"\x1b[42m\x1b[30m","hlblue":"\x1b[44m\x1b[37m",
		"hlcyan":"\x1b[104m\x1b[30m","hlyellow":"\x1b[43m\x1b[30m","hlpink":"\x1b[105m\x1b[30m","hlpurple":"\x1b[45m\x1b[37m"};

	// LOAD WHITELISTED MEMBERS
	if(myServer.whiteListedMembersIDs.length>0){ whiteListedMembersIDs=myServer.whiteListedMembersIDs }

	// LOAD WHITELISTED ROLES
	if(myServer.adminRoleName){ whiteListedRoles.push(myServer.adminRoleName) }
	if(myServer.modRoleName){ whiteListedRoles.push(myServer.modRoleName) }
	if(myServer.whiteListedRoles.length>0){ whiteListedRoles.concat(myServer.whiteListedRoles) }

	// SPOOFNINJA EMBED MESSAGE SETTINGS - DO NOT MODIFY - DO IT FROM CONFIG
	slackMSG={"username": spoofNinja.name,"avatarURL": spoofNinja.avatar};

	// MODERATOR EMBED MESSAGE SETTINGS - DO NOT MODIFY


	// WARNING MESSAGE SENT TO MEMBER (try to include "From: myServer.name" minimum)
	warningMSG={
		"title": "⚠ THIS IS A WARNING ⚠",
		"description": "**From Server**: "+myServer.name+"\n**Message**: You are violating one of our rules; "
			+"**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **anyone** "
			+"with connection to discord spoofing servers...\nPlease leave `ALL` **spoofing** servers or suffer the "
			+"consequences!💪\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: "+timeStamp(2)
	};

	// MESSAGE SENT TO MEMBER ONCE KICKED (try to include "From: myServer.name" minimum)
	kickMSG={
		"title": "⚠ ⛔ YOU HAVE BEEN KICKED ⛔ ⚠",
		"description": "**From Server**: "+myServer.name+"\n"
			+"**Reason**: Rule violation; **you** were found in **spoofing** server(s). "
			+"We have zero tolerance for **spoofers**, and **any** connection to "
			+"discord spoofing servers...\n.\n**By**: AntiSpoofing[`BOT`]\n**On**: "+timeStamp(2)
	};

	// MESSAGE SENT TO MEMBER ONCE BANNED (try to include "From: myServer.name" minimum)
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




// DIRECT CALL TO THE WEBHOOK
const globalNinjaWh=new Discord.WebhookClient("365806668119932928","xe5pRZUvE8ADXDBpNESBsfK7RXT9UmQVOzxaJTjwkj3nmo2IBJEbPlCCl0LJ3Ope77Fo");
const botSupportWh=new Discord.WebhookClient("365826527822348290","Z0HAX79QHpNDkyK1hF_FVM5o0LcZ1-tFhoK1o2-HlWA6Ogk9P3MyA2vuGMm_Umyso-oA");
globalNinjaWh.send({"embeds": [{"description": timeStamp(2)+" Gratz! **"+myServer.name+"** started using **SpoofNinja**[`ver "+config.botVersion+"`]"}]}).catch(err=>{console.info(timeStamp()+" [ERROR L:53] "+err.message)});



//
//				CLASS: SPOOFNINJA.SEND WEBHOOK CATCHER/CREATOR
//
var SpoofNinja="";
class SpoofNinjaWhCatcher{
	send(channel,slackMSG,msgContent){
		moderatorBot.guilds.get(myServer.id).channels.get(channel.id).fetchWebhooks()
		.then(wh=>{
			if(wh.size<1){
				moderatorBot.guilds.get(myServer.id).channels.get(channel.id).createWebhook("SpoofNinja["+Math.floor(Math.random()*9999)+"]",spoofNinja.avatar,"Bot created")
				.then(whData=>{
					let spoofNinjaWh=new Discord.WebhookClient(whData.id,whData.token);
					if(msgContent){
						return spoofNinjaWh.send(msgContent,slackMSG)
							.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
					}
					return spoofNinjaWh.send(slackMSG)
						.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
				})
				.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				let spoofNinjaWh=new Discord.WebhookClient(wh.first().id,wh.first().token);
				if(msgContent){
					return spoofNinjaWh.send(msgContent,slackMSG)
						.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
				}
				return spoofNinjaWh.send(slackMSG)
					.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
			}
		})
	}
}



function flareHome(){
	moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]).fetchWebhooks()
	.then(wh=>{
		if(wh.size<1){
			moderatorBot.guilds.get(myServer.id).channels.get(channel.id).createWebhook("SpoofNinja["+Math.floor(Math.random()*9999)+"]",spoofNinja.avatar,"Bot created")
			.then(whData=>{
				let spoofNinjaWh=new Discord.WebhookClient(whData.id,whData.token)
				if(!myServer.invite){myServer.invite="no invite"}
				globalNinjaWh.send({"embeds": [{"description": timeStamp(2)+" Yay! **"+myServer.name+"** have **SHARED** their info, and wants to recieve *major* update-**notifications**", "color": parseColor("#005500")}]})
				return botSupportWh.send({"embeds": [{"description": timeStamp(2)+" **"+myServer.name+"** would like to get **UPDATES**!\n"
				+" ► Their Owner: <@"+config.ownerID+">\n ► Their Invite: ` "+myServer.invite+" `\n ► Their WH ID: `"+whData.id+"`\n ► Their WH Token: `"+whData.token+"`"}]})
			})
		}
		else{
			wh.map(whData=>{
				let spoofNinjaWh=new Discord.WebhookClient(whData.id,whData.token)
				if(!myServer.invite){myServer.invite="no invite"}
				globalNinjaWh.send({"embeds": [{"description": timeStamp(2)+" Yay! **"+myServer.name+"** have **SHARED** their info, and wants to recieve *major* update-**notifications**", "color": parseColor("#005500")}]})
				return botSupportWh.send({"embeds": [{"description": timeStamp(2)+" **"+myServer.name+"** would like to get **UPDATES**!\n"
				+" ► Their Owner: <@"+config.ownerID+">\n ► Their Invite: ` "+myServer.invite+" `\n ► Their WH ID: `"+whData.id+"`\n ► Their WH Token: `"+whData.token+"`"}]})
			})
		}
	})
}




//
//		PARSE COLORS FUNCTION
//
function parseColor(color){
	let tempColor=color; tempColor=tempColor.slice(1); tempColor="0x"+tempColor; return parseInt(tempColor);
}



//
//		CHECK CONFIG FOR RIGHT INFO INPUT BY MEMBER
//
if(!Number.isInteger(parseInt(config.ownerID))){
	return console.info(cc.hlred+" ERROR "+cc.reset+"  config.json ► \"ownerID\" = wrong format, it needs to be numbers")
}
if(config.consoleLog==="eventsOnly" || config.consoleLog==="serverOnly" || config.consoleLog==="all"){ /* VALID OPTIONS */ } else{
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"ownerID\" = needs to be either \"eventsOnly\" or \"serverOnly\" or \"all\"")
}
if(!Number.isInteger(parseInt(config.spoofNinja.id))){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"spoofNinja\" ► \"id\" = wrong format, it needs to be numbers")
}
if(!spoofNinja.token){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"spoofNinja\" ► \"token\" = needs a token!")
}
if(!config.moderatorBot.token){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"moderatorBot\" ► \"token\" = needs a token!")
}
if(!Number.isInteger(parseInt(myServer.id))){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► myServer ► \"id\" = wrong format, it needs to be numbers")
}
if(!myServer.cmdChanIDs){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"myServer\" ► \"cmdChanIDs\" = needs at least one channel ID")
}
if(!Array.isArray(myServer.cmdChanIDs)){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"myServer\" ► \"cmdChanIDs\" = needs to be an array: ie: "+cc.yellow+"[\"####\"]"+cc.reset+" or "+cc.yellow+"[\"####\",\"####\"]"+cc.reset)
}
if(myServer.cmdChanIDs.length<1){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"myServer\" ► \"cmdChanIDs\" = needs at least one channel ID")
}
if(!myServer.adminRoleName){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"myServer\" ► \"adminRoleName\" = needs the name of role for Admins!")
}
if(!myServer.modRoleName){
	return console.info(cc.hlred+" ERROR "+cc.reset+" config.json ► \"myServer\" ► \"modRoleName\" = needs the name of role for Moderators!")
}




//
//		BOT SIGNED IN AND IS READY
//
bot.on("ready",()=>{
	// SET BOT AS INVISIBLE = NINJA <(^.^<)
	bot.user.setPresence({"status":"invisible"});
	
	// SENDING ONLINE MESSAGE TO CHAT
	setTimeout(function(){
		SpoofNinja=new SpoofNinjaWhCatcher();
		slackMSG.embeds=[{
			"color": parseColor(embedSettings.goodColor),
			"description": "I am ready to **scan** __this__ server against **"+spoofServers.length+"**-other **spoOfing** servers!"
		}];
		SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG);
	}, 5000);
	
	// CONSOLE SPOOF NINJA HAS STARTED
	console.info(timeStamp()+" -- DISCORD SpoofNinja, DummyAccount: "+cc.yellow+bot.user.username+cc.reset+", IS "+cc.green+"READY"+cc.reset+" --");
	console.info(timeStamp()+" I have loaded "+cc.cyan+spoofServers.length+cc.reset+" Spoofing Servers");

	// GET VERSIONS
	request("https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/version.txt",
		function(error,response,body){
			if(error){console.info(error)}
			if(body){
				let gitHubVer=body.slice(0,-1); let timeLog=timeStamp();
				let verChecker=cc.green+"up-to-date"+cc.reset; if(gitHubVer!==config.botVersion){ verChecker=cc.hlred+" OUTDATED! "+cc.reset }
				console.info(
					timeLog+" GitHub [SpoofNinja]: "+cc.yellow+"v"+gitHubVer+cc.reset+"\n"
					+timeLog+" Local Bot ["+bot.user.username+"]: "+cc.yellow+"v"+config.botVersion+cc.reset+" -> "+verChecker+"\n"
					+timeLog+" Discord API [discord.js]: "+cc.yellow+"v"+Discord.version+cc.reset+"\n"
					+timeLog+" Node API [node.js]: "+cc.yellow+process.version+cc.reset
				)
			}
		}
	);

	// CHECK IF BOTSUPPORT IS ENABLED
	if(config.botSupport==="no"){console.info(cc.cyan+".:[ FRIENDLY NOTICE ]:."+cc.reset+"\n"
		+"You should consider "+cc.green+"enabling"+cc.reset+" \""+cc.purple+"botSupport"+cc.reset+"\" in order to:\n"
		+cc.green+"►"+cc.reset+" Get notifications about updates for either:\n"
		+"-- "+cc.purple+"SpoofNinja.js"+cc.reset+", "+cc.purple+"servers.json"+cc.reset+", and/or "+cc.purple+"config.json"+cc.reset+"\n"
		+cc.green+"►"+cc.reset+" Direct replies in your server when using \""+cc.cyan+"!bug"+cc.reset+"\" reports\n"
		+"-- You'll be sharing your webhook in order for Jenner to reply\n"
		+"----------------------------------------------------------\n"
		+cc.green+"►"+cc.reset+" How to ENABLE it? very easy: \n"
		+"-- Edit "+cc.purple+"config.json"+cc.reset+" at line 14: \""+cc.purple+"botSupport"+cc.reset+"\": \""+cc.green+"yes"+cc.reset+"\"\n"
		+"----------------------------------------------------------\n");
	}
	
	// INJECT MY SERVER COLLECTION INTO DUMMY ACCOUNT'S GUILD COLLECTION
	// bot.guilds.set(myServer.id, moderatorBot.guilds.get(myServer.id));
});



//
//				FUNCTION: CHECK MEMBER ON ALL SERVERS
//
async function checkMember(memberID){
	memberIsSpoofer="no", serversFound=[];
	
	// CHECK ALL SERVERS FROM SERVERLIST
	await spoofServers.forEach(async server=>{
		
		// CHECK IF DUMMY ACCOUNT IS IN EACH SERVER
		botIsInServer=await bot.guilds.get(server.id) || "no";
		if(botIsInServer==="no"){
			console.info(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" I am not in server: "+cc.cyan+server.name+cc.reset
				+" | Please join using invite code: "+cc.cyan+server.invite+cc.reset+"..."
				+" or remove line from \""+cc.purple+"servers.json"+cc.reset+"\" and wait for update (if botsupport is enabled)");
		}
		else{
			
			// CHECK IF MEMBER IS IN EACH SERVER
			noobFound=await bot.guilds.get(server.id).members.get(memberID) || "no";
			if(noobFound==="no"){
				/* NOOB WASNT FOUND IN THIS SERVER */
			}
			else{
				await serversFound.push(server.name);
				memberIsSpoofer=await "yes";
			}
		}
	});
	
	// CHECK PERSONAL SERVER IN CASE MEMBER JOINS SPOOF SERVER AFTER JOINING MY SERVER
	noobFound=await moderatorBot.guilds.get(myServer.id).members.get(memberID) || "no";
	if(noobFound==="no"){
		/* MEMBER IS NOT IN MY SERVER */
	}
	else{
		serversFound.push(myServer.name)
	}
	
	// SEND DATA BACK TO VARIABLE
	//console.info("serversFound from "+cc.purple+"checkMember()"+cc.reset+":");console.info(serversFound);//
	return await serversFound;
}



//
//				FUNCTION: JOINED SERVER USING JSON FILES
//
async function checkJoinedServer(serverID){
	noobJoined="unknownServer", memberIsSpoofer="no";
	
	// CHECK IF SERVER JOINED IS MY SERVER
	if(serverID===myServer.id){
		noobJoined=myServer.name;
	}

	// IF NOT MY SERVER CHECK JSON FILE
	else{
		await spoofServers.forEach(async server=>{
			if(serverID===server.id){
				noobJoined=await server.name;
				memberIsSpoofer=await "yes";
			}
		});
	}
	
	// SEND DATA BACK TO VARIABLE
	return noobJoined;
}


//
//				FUNCTION: CHECK IF MEMBER IS WHITELISTED OR HAS WHITELISTED ROLES
//
async function isWhiteListed(memberID){
	
	// MEMBER IS BOT
	if(memberID==spoofNinja.id){
		return {"isWhiteListed": "yes", "memberIs": "Bot"};
	}
	
	// MEMBER IS BOT OWNER
	if(memberID===config.ownerID){
		return {"isWhiteListed": "yes", "memberIs": "Bot Owner"};
	}
	
	// MEMBER IS WHITELISTED
	if(whiteListedMembersIDs.length>0){
		if(whiteListedMembersIDs.includes(memberID)){
			return {"isWhiteListed": "yes", "memberIs": "WhitelistedUser"};
		}
	}
	
	// MEMBER HAS WHITELISTED ROLES
	if(whiteListedRoles.length>0){
		noobFound=await moderatorBot.guilds.get(myServer.id).members.get(memberID) || "no";
		if(noobFound==="no"){
			/* MEMBER IS NOT IN MY SERVER */
		}
		else{
			let memberRoleNames=await noobFound.roles.map(role=>role.name);
			if(memberRoleNames.length>0){
				for(let n="0"; n < memberRoleNames.length; n++){
					if(myServer.whiteListedRoles.includes(memberRoleNames[n])){
						return {"isWhiteListed": "yes", "memberIs": "WhitelistedRoled"};
					}
				}
			}
		}
	}
	return {"isWhiteListed": "no", "memberIs": "NotWhitelisted"};
}


//
//				FUNCTION: PARSE JOIN RESULTS
//
async function parseJoinResults(member,servers,serverJoined){
	//console.info("myServerFound from "+cc.purple+"parseJoinResults"+cc.reset+": "+myServerFound+"\n.");//
	
	// serverCount="", botIsInServer="no", memberIsSpoofer="no", noobFound="", serversFound=[];
	member.username=member.user.username;
	
	// DIFFERENT CASES:
	// WA|WA	XEN|XEN		WA|XEN		XEN|WA
	
	// SINGLE SERVER FOUND
	if(servers.length===1){
		// JOINED ONE SERVER, MY SERVER
		if(servers[0]===myServer.name && serverJoined===myServer.name){
			servers=[];
			if(config.consoleLog==="all"){
				console.info(timeStamp()+" "+cc.cyan+member.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has "+cc.red+"joined"+cc.reset+" server: "+cc.cyan+serverJoined+cc.reset);
			}
		}
		
		// JOINED ONE SERVER, SPOOFING SERVER
		if(servers.length===1 && servers[0]===serverJoined){servers=[],memberIsSpoofer="yes"}
		
		// JOINED ONE SERVER, MY SERVER BUT IS IN SPOOFING ...OR... SPOOFING BUT IS IN MY SERVER
		if(servers.length===1 && serverJoined===myServer.name && servers[0]!==myServer.name){memberIsSpoofer="yes",myServerFound="yes"}
	}
	
	// WA|XEN,WA		WA|XEN,100,WA		XEN|XEN,WA				XEN|XEN,100,WA			XEN|100,XEN			XEN|100,BOT,WA
	// MULTIPLE SERVERS FOUND
	if(servers.length>1){
		memberIsSpoofer="yes";

		// JOINED SERVER IS MY SERVER - AND MEMBER IS SPOOFER				WA|XEN,WA
		if(serverJoined===myServer.name){myServerFound="yes"}

		// CHECK IF MY SERVER IS IN ALL SERVER, REMOVE IT				WA|XEN,WA > WA|XEN		XEN|XEN,WA > XEN|XEN		XEN|100,BOT,WA > XEN|100,BOT
		if(servers.includes(myServer.name)){myServerFound="yes";servers.pop()}

		// JOINED ONE SERVER WAS IN TWO, BUT MY SERVER WAS REMOVED, JOINED SERVER IS SAME AS SERVER THEY'RE IN 		XEN|XEN
		if(servers.length===1 && servers[0]===serverJoined){servers=[]}
		
		// JOINED ONE SERVER WAS IN TWO, REMOVE JOINED 		XEN|XEN,100 > 100 (SHIFT)		XEN|100,XEN > XEN|100 (POP)			XEN|100,XEN,BOT > XEN|100,BOT
		if(servers.length>1 && servers.includes(serverJoined)){
			let pos=servers.indexOf(serverJoined);
			if(pos===0){servers.shift()}
			else if(pos===servers.length-1){servers.pop()}
			else{servers.splice(pos,1)}
		}
	}
	
	// FOUND MORE THAN ONE SERVER, PARSE CONSOLE AND DISCORD OUTPUT
	if(servers.length>0){
		daServersConsole=cc.reset+" || other servers: "+cc.cyan+servers.join(cc.reset+", "+cc.cyan)+cc.reset;daServers="\n**Other Servers**: "+servers.join(", ");
	}
	
	// CONSOLE IF NO OTHER SPOOFING SERVER AND MY SERVER IS NOT IN IT ► LOG ALL
	if(memberIsSpoofer==="yes" && servers.length<1 && config.consoleLog==="all" && myServerFound==="no"){
		if(config.consoleLog==="all"){
			return console.info(timeStamp()+" "+cc.cyan+member.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has "+cc.red+"joined"+cc.reset+" server: "+cc.cyan+serverJoined+cc.reset);
		}
	}
	
	// CONSOLE IF MORE THAN 1 SPOOFING SERVERS AND MY SERVER IS NOT IN IT ► LOG ALL
	if(memberIsSpoofer==="yes" && servers.length>0 && config.consoleLog==="all" && myServerFound==="no"){
		if(config.consoleLog==="all"){
			return console.info(timeStamp()+" "+cc.cyan+member.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has "+cc.red+"joined"+cc.reset+" server: "+cc.cyan+serverJoined+daServersConsole+cc.reset);
		}
	}
	
	// MY SERVER WAS FOUND AND MEMBER IS SPOOFER
	if(myServerFound==="yes" && memberIsSpoofer==="yes"){
		console.info(timeStamp()+" "+cc.cyan+member.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has "+cc.red+"joined"+cc.reset+" server: "+cc.cyan+serverJoined+daServersConsole+cc.reset);
		
		// CHECK WHITELISTED MEMBERS AND WHITELISTED ROLES
		let daMember=await isWhiteListed(member.id);
		
		// DO NOT POST FINDING FOR WHITELISTED
		if(daMember.isWhiteListed==="yes"){
			if(daMember.memberIs==="Bot"){
				return console.info(timeStamp()+" Member above is "+cc.purple+"Bot"+cc.reset+".... so "+cc.green+"shhhhhh!"+cc.reset)
			}
			if(daMember.memberIs==="Bot Owner"){
				return console.info(timeStamp()+" Member above is "+cc.purple+"Bot Owner"+cc.reset+".... so "+cc.green+"shhhhhh!"+cc.reset)
			}
			if(daMember.memberIs==="WhitelistedUser"){
				return console.info(timeStamp()+" Member above is a "+cc.green+"whiteListedMember"+cc.reset+"!")
			}
			if(daMember.memberIs==="WhitelistedRoled"){
				return console.info(timeStamp()+" Member above has "+cc.green+"whiteListedRole(s)"+cc.reset+"!")
			}
		}
		
		// MODIFY EMBED FOR DISCORD OUTPUT
		slackMSG.embeds=[{
			"color": parseColor(embedSettings.warningColor),
			"thumbnail": {"url": embedSettings.snipeImg},
			"description": "⚠ __**WARNING**__ ⚠\n**"
				+member.username+"** has joined: **"+serverJoined+"**\n**Tag/ID**: "+member.user+daServers+"\n**On**: "+timeStamp(1)
		}];
		
		// SEND DATA TO CHANNEL
		SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG);
	}
}


// ##########################################################################
// #																		#
// #								MEMBER JOINS							#
// #																		#
// ##########################################################################
bot.on("guildMemberAdd",async member=>{
	//console.info(member.user.username+" joined: "+member.guild.name+"|"+member.guild.id);//
	
	memberIsSpoofer="no",myServerFound="no";
	
	// STOP ► IF MEMBER IS BOT
	if(member.user.bot){ return }
	
	// CHECK IF MEMBER IS IN A SPOOFING SERVER
	let spoofServersFound=await checkMember(member.id);
	//console.info(cc.red+"spoofServersFound("+spoofServersFound.length+"): "+spoofServersFound+cc.reset);//
	
	// CHECK THE SERVER THEY JOINED
	let serverJoined=await checkJoinedServer(member.guild.id);
	//console.info(cc.red+"serverJoined: "+serverJoined+cc.reset);//
	
	// STOP ► IF BOT DIDNT FIND MEMBER JOINING A KNOWN SPOOF SERVER OR MY SERVER
	if(serverJoined==="unknownServer"){ return }
	
	// PARSE JOINING RESULTS ► POST RESULTS OR IGNORE
	parseJoinResults(member,spoofServersFound,serverJoined);
});
moderatorBot.on("guildMemberAdd",async member=>{
	memberIsSpoofer="no",myServerFound="yes";
	
	// STOP ► IF MEMBER IS BOT
	if(member.user.bot){ return }
	
	// CHECK IF MEMBER IS IN A SPOOFING SERVER
	let spoofServersFound=await checkMember(member.id);
	
	// CHECK THE SERVER THEY JOINED
	let serverJoined=await checkJoinedServer(member.guild.id);
	
	// STOP ► IF BOT DIDNT FIND MEMBER JOINING A KNOWN SPOOF SERVER OR MY SERVER
	if(serverJoined==="unknownServer"){ return }
	
	// PARSE JOINING RESULTS ► POST RESULTS OR IGNORE
	parseJoinResults(member,spoofServersFound,serverJoined);
});



// ##########################################################################
// #																		#
// #								MEMBER LEFT								#
// #																		#
// ##########################################################################

bot.on("guildMemberRemove",async member => {
	//console.info(member.user.username+" left: "+member.guild.name+"|"+member.guild.id);//
	
	// EXIT IF BOT
	if(member.user.bot){ return }
	
	// RESET VARIABLES
	let spoofServer="";
	
	// CHECK ALL SERVERS FROM SERVERLIST
	for(let serverN="0"; serverN < spoofServers.length; serverN++){
		if(member.guild.id===spoofServers[serverN].server){
			spoofServer=spoofServers[serverN].name;
		}
	}
	
	// LOGGING EACH EVENT , TO DISABLE/REMOVE: DELETE EACH LINE, OR ADD COMMENT PARAM: //
	if(!spoofServer && !moderatorBot.guilds.get(myServer.id).members.get(member.id)){
		if(config.consoleLog==="all"){
			return console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has "+cc.green+"left"+cc.reset+" server: "+cc.cyan+member.guild.name+cc.reset);
		}
	}
	
	// SERVER IS NOT ON THE LIST BUT I'M ON THE SERVER, MAYBE FORGOT TO ADD IT? GRAB THE NAME FROM THE SERVER
	if(!spoofServer){
		spoofServer=member.guild.name
	}
	
	// CHECK IF MEMBER IS STILL IN MY SERVER
	noobFound=await moderatorBot.guilds.get(myServer.id).members.get(member.id) || "no";
	if(noobFound==="no"){
		/* MEMBER IS NO LONGER IN MY SERVER */
	}
	else{
		// CHECK IF MEMBER IS WHITELISTED OR HAS WHITELISTED ROLES
		let daMember=isWhiteListed(member.id);
		
		// DO NOT POST FINDING FOR STAFF
		if(daMember.isWhiteListed==="yes"){
			if(daMember.memberIs==="Bot"){
				return console.info(timeStamp()+" Bot has left: "+cc.cyan+spoofServer+cc.reset)
			}
			if(daMember.memberIs==="Bot Owner"){
				return console.info(timeStamp()+" Bot Owner has left: "+cc.cyan+spoofServer+cc.reset)
			}
			if(daMember.memberIs==="WhitelistedUser"){
				return console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has left: "+cc.cyan+spoofServer+cc.reset+". But they are "+cc.green+"whiteListed"+cc.reset+"!")
			}
			if(daMember.memberIs==="WhitelistedRoled"){
				return console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc,reset+") has left: "+cc.cyan+spoofServer+cc.reset+". But they have "+cc.green+"whiteListedRole(s)"+cc.reset+"!")
			}
		}
		
		// MODIFY EMBED
		slackMSG.embeds=[{
			"color": parseColor(embedSettings.goodColor),
			"thumbnail": {"url": embedSettings.checkedImg},
			"description": "✅ __**MEMBER LEFT SERVER**__ ✅\n**"
				+member.user.username+"** has left: **"+spoofServer+"**\n**UserID**: `"+member.id+"`\n**On**: "+timeStamp(1)
		}];

		console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has left: "+cc.cyan+spoofServer+cc.reset);

		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		return SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)
	}
});




// ##########################################################################
// #																		#
// #								TEXT COMMANDS							#
// #																		#
// ##########################################################################
bot.on("message", message=>{
	//STOP SCRIPT IF DM
	if(message.channel.type==="dm"){ return }
	
	// STOP IF SERVER NOT MY SERVER
	if(message.guild.id!==myServer.id){ return }
	
	// STOP IF NOT THE RIGHT CHANNEL ► COMMAND CHANNELS
	if(!myServer.cmdChanIDs.includes(message.channel.id)){ return }
	
	// STOP IF NO MESSAGE CONTENT
	if(!message.content){ return }
	
	// STOP IF NOT A COMMAND
	if(!message.content.startsWith(config.cmdPrefix)){ return }

	// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
	let adminRole=guild.roles.find(role => role.name === myServer.adminRoleName);
		if(!adminRole){
			adminRole={"id":"101010"};
			console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.purple+myServer.adminRoleName+cc.reset)
		}
	let modRole=guild.roles.find(role => role.name === myServer.modRoleName);
		if(!modRole){
			modRole={"id":"101010"};
			console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.purple+myServer.modRoleName+cc.reset)
		}
	if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID){ 
		// RESTART THIS MODULE
		if(command==="restart" && member.id===config.ownerID && args[0]==="spoofninja"){
			slackMSG.embeds=[{
				"color": parseColor(embedSettings.goodColor),
				"description": "♻ Restarting **spoOfNinja**\n ► please wait `5` to `15` seconds..."
				}];
			SpoofNinja.send(channel,slackMSG);
			setTimeout(function(){
				process.exit(1)
			},2000);
		}
	}
});

// BOT LOGIN TO DISCORD
bot.login(spoofNinja.token);
moderatorBot.login(config.moderatorBot.token);

// BOT DISCONNECTED
bot.on("disconnect", function (){
	console.info(timeStamp()+cc.bgred+" -- SPOOFNINJA HAS DISCONNECTED --"+cc.reset)
});




/*





    // ######################################################## //
	//															//
	//		MODERATOR BOT - FOR FLAGS: WARN, KICK, BAN			//
	//															//
	// ######################################################## //





*/



moderatorBot.on("ready", () => {
	console.info(timeStamp()+" -- DISCORD SpoofNinja, ModeratorBot: "+cc.yellow+moderatorBot.user.username+cc.reset+", IS "+cc.green+"READY"+cc.reset+" --");
	if(config.botSupport==="yes"){flareHome()}
});



moderatorBot.on("message",async message => {
	
	//STOP SCRIPT IF DM
	if(message.channel.type==="dm"){ return }
	
	// STOP IF SERVER NOT MY SERVER
	if(message.guild.id!==myServer.id){ return }
	
	// STOP IF NOT THE RIGHT CHANNEL ► COMMAND CHANNELS
	if(!myServer.cmdChanIDs.includes(message.channel.id)){ return }

	// SIMPLIFY PROPERTIES
	let guild=message.guild, channel=message.channel, member={}; if(message.member){member=message.member; member.username=message.member.user.username}

	// GRAB COMMAND AND ARGUMENTS
	let command=message.content.toLowerCase(); command=command.split(/ +/)[0]; command=command.slice(config.cmdPrefix.length);
	let args=message.content.toLowerCase().split(/ +/).slice(1); ARGS=message.content.split(/ +/).slice(1);

	// LOAD ADMIN AND MOD ROLES
	let adminRole=await guild.roles.find(role=>role.name===myServer.adminRoleName);
	if(!adminRole){adminRole={"id":"101010"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.purple+myServer.adminRoleName+cc.reset)}
	let modRole=await guild.roles.find(role=>role.name===myServer.modRoleName);
	if(!modRole){modRole={"id":"101010"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.purple+myServer.modRoleName+cc.reset)}

	
	if(message.content && message.content.startsWith(config.cmdPrefix)){
		//
		//
		//
		//
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===config.ownerID){ // DISABLE FOR GLOBAL USE - ANY MEMBER - AT DEVELOPER'S SERVER
		//
		//
		//
		//
		
		
		if(config.consoleLog==="all" || config.consoleLog==="serverOnly"){
			console.info(timeStamp()+" "+cc.purple+"#"+channel.name+cc.reset+" | "+cc.lblue+member.username+cc.reset+" > "+cc.green+"command"+cc.reset+": "+cc.cyan+message.content+cc.reset)
		}
		// COMMAND: !HELP
		if(command==="help" || command==="commands"){
			slackMSG.embeds=[{
				"color": parseColor(embedSettings.goodColor),
				"title": "ℹ Available Syntax and Arguments ℹ"
			}];
			if(args.length>0){
				if(args[0]==="check"){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"check @mention/user_id` ► for checking user, ie:\n"
						+" `"+config.cmdPrefix+"check @JennerPalacios` or\n"
						+" `"+config.cmdPrefix+"check 237597448032354304`\n"
						+"`"+config.cmdPrefix+"check wlmembers` ► list of members that the bot ignores\n"
						+"`"+config.cmdPrefix+"check wlroles` ► list of roles that the bot ignores\n"
						+"`"+config.cmdPrefix+"check server` ► for checking **ALL** members\n"
						+"`"+config.cmdPrefix+"check version` ► for checking version...";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0].startsWith("addm")){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"addmember`/`"+config.cmdPrefix+"addm` + `@mention/user_id`\n"
						+" ► used for adding member to whiteList\n"
						+" ► these members are ignored by the bot\n"
						+" IE: `"+config.cmdPrefix+"addmember @JennerPalacios`\n"
						+" OR: `"+config.cmdPrefix+"addmember 237597448032354304`";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0].startsWith("delm")){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"delmember`/`"+config.cmdPrefix+"delm` + `@mention/user_id`\n"
						+" ► used for deleting member from whiteList\n"
						+" IE: `"+config.cmdPrefix+"delmember @JennerPalacios`\n"
						+" OR: `"+config.cmdPrefix+"delmember 237597448032354304`";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0].startsWith("addr")){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"addrole`/`"+config.cmdPrefix+"addr` + `role_name`\n"
						+" ► used for adding role to whiteList\n"
						+" ► these roles are ignored by the bot\n"
						+" IE: `"+config.cmdPrefix+"addrole Moderator`\n"
						+" OR: `"+config.cmdPrefix+"addmember VIP`";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0].startsWith("delr")){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"delrole`/`"+config.cmdPrefix+"delr` + `role_name`\n"
						+" ► used for deleting role from whiteList\n"
						+" IE: `"+config.cmdPrefix+"delrole VIP`\n";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0]==="feedback"){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"feedback` ► for providing feedback or suggestions\n"
						+" provide feedback to JennerPalacios, ie:\n"
						+" `"+config.cmdPrefix+"feedback Love it! great job you noOb!\n`"
						+" `"+config.cmdPrefix+"feedback Add a way to order Pizza!`";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0]==="bug"){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"bug` ► for reporting a **bug**\n"
						+" please be specific, if possible use twice;\n"
						+" first, report the bug and provide description\n"
						+" then, what you get in the `console.log` or `cli`, ie:\n"
						+" `"+config.cmdPrefix+"bug I get error when checking member`\n"
						+" ```"+config.cmdPrefix+"bug TypeError: Cannot read property \"members\" of undefined\n"
						+"   at checkMember (/var/www/SpoofNinja/SpoofNinja.js:71:57)```";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0]==="onspoofer"){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"onSpoofer check` ► to check current **action**\n"
						+"`"+config.cmdPrefix+"onSpoofer nothing` ► to disable/do **nothing**\n"
						+"`"+config.cmdPrefix+"onSpoofer warning` ► to send them a warning\n"
						+"`"+config.cmdPrefix+"onSpoofer kick` ► to kick after "+minsUntilPunished+"min warning\n"
						+"`"+config.cmdPrefix+"onSpoofer ban` ► to ban after "+minsUntilPunished+"min warning\n"
						+"`"+config.cmdPrefix+"onSpoofer instakick` ► to kick instantly\n"
						+"`"+config.cmdPrefix+"onSpoofer instaban` ► to ban instantly";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0]==="minstilpunish"){
					slackMSG.embeds[0].description="`"+config.cmdPrefix+"minsTilPunish check` ► to check current setting\n"
										+"`"+config.cmdPrefix+"minsTilPunish <mins>` ► to adjust minutes";
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0]==="1"){
					slackMSG.embeds[0].title="ℹ Available Commands and Arguments ℹ";
					slackMSG.embeds[0].description="```md\n"
						+config.cmdPrefix+"check <@mention/user_id>\n"
						+config.cmdPrefix+"check server\n"
						+config.cmdPrefix+"onSpoofer <action>\n"
						+config.cmdPrefix+"minsTilPunish <mins>```"
						+"more commands on pg2: `"+config.cmdPrefix+command+" 2`";
					slackMSG.embeds[0].footer={ "text": "type | "+config.cmdPrefix+command+" <command> | for more info" }
					return SpoofNinja.send(channel,slackMSG);
				}
				if(args[0]==="2"){
					slackMSG.embeds[0].title="ℹ Available Commands and Arguments ℹ";
					slackMSG.embeds[0].description="```md\n"
						+config.cmdPrefix+"check wlMembers\n"
						+config.cmdPrefix+"check wlRoles\n"
						+config.cmdPrefix+"check version\n"
						+config.cmdPrefix+"addMember <@mention/user_id>\n"
						+config.cmdPrefix+"delMember <@mention/user_id>\n"
						+config.cmdPrefix+"addRole <role_name>\n"
						+config.cmdPrefix+"delRole <role_name>```"
						+"more commands on pg1: `"+config.cmdPrefix+command+" 1`";
					slackMSG.embeds[0].footer={ "text": "type | "+config.cmdPrefix+command+" <command> | for more info" }
					return SpoofNinja.send(channel,slackMSG);
				}
			}
			else{
				slackMSG.embeds[0].title="ℹ Available Commands and Arguments ℹ";
				slackMSG.embeds[0].description="```md\n"
					+config.cmdPrefix+"check <@mention/user_id>\n"
					+config.cmdPrefix+"check server\n"
					+config.cmdPrefix+"onSpoofer <action>\n"
					+config.cmdPrefix+"minsTilPunish <mins>```"
					+"more commands on pg2: `"+config.cmdPrefix+command+" 2`";
				slackMSG.embeds[0].footer={ "text": "type | "+config.cmdPrefix+command+" <command> | for more info" };
				return SpoofNinja.send(channel,slackMSG);
			}
		}
		
		// COMMAND: !BUG ||FEEDBACK
		if(command==="bug" || command==="feedback"){
			slackMSG={"username":"[Dev]JennerPalacios","avatarURL":spoofNinja.avatar,"embeds":[{"color":parseColor(embedSettings.goodColor)}]};
			if(command==="bug"){
				slackMSG.embeds[0].description="Your `BugReport` has been recorded! Stay tuned <(^.^<)";
				botSupportWh.send("⚠ [BUGREPORT] on "+timeStamp(1)+"\n**By: **"+member.username+"[`"+member.user.id+"`]\n**From: **"+myServer.name+"[`"+myServer.invite+"`]\n```\n"+message.content.slice(4)+"\n```");
				return SpoofNinja.send(channel,slackMSG);
			}
			slackMSG.embeds[0].description="Thanks for your feedback <(^.^<)";
			botSupportWh.send("✅ [FEEDBACK] on "+timeStamp(1)+"\n**By: **"+member.username+" [`"+member.user.id+"`]\n**From: **"+myServer.name+"[`"+myServer.invite+"`]\n```\n"+message.content.slice(9)+"\n```");
			return SpoofNinja.send(channel,slackMSG);
		}
		
		// PUNISHMENT ACTION
		if(command==="onspoofer"){
			if(args.length<1){
				embedMSG={
					"color": 0x00FF00,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`"+config.cmdPrefix+"onSpoofer check` ► to check current **action**\n"
						+"`"+config.cmdPrefix+"onSpoofer nothing` ► to disable/do **nothing**\n"
						+"`"+config.cmdPrefix+"onSpoofer warning` ► to send them a warning\n"
						+"`"+config.cmdPrefix+"onSpoofer kick` ► to kick after "+minsUntilPunished+"min warning\n"
						+"`"+config.cmdPrefix+"onSpoofer ban` ► to ban after "+minsUntilPunished+"min warning\n"
						+"`"+config.cmdPrefix+"onSpoofer instakick` ► to kick instantly\n"
						+"`"+config.cmdPrefix+"onSpoofer instaban` ► to ban instantly"
				};
				return channel.send({embed: embedMSG});
			}
			else{
				// CONFIGURATION FILE
				let configFile=JSON.parse(fs.readFileSync("./files/config.json", "utf8"));
				
				if(args[0]==="nothing"){
					spooferFlag="nothing"; configFile.myServer.onSpooferFound="nothing";
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					return channel.send({embed:{"color":0x00FF00,"description":"🚫 If `SpoofNinja` finds a possible spoofer, I will do **nothing** 👎"}})
				}
				if(args[0].startsWith("warn")){
					spooferFlag="warning"; configFile.myServer.onSpooferFound="warning";
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					return channel.send({embed:{"color":0x00FF00,"description":"⚠ If `SpoofNinja` finds a possible spoofer, I will send them a **warning** 😏"}})
				}
				if(args[0]==="kick"){
					spooferFlag="kick"; configFile.myServer.onSpooferFound="kick";
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					return channel.send({embed:{"color":0x00FF00,"description":"👞 If `SpoofNinja` finds a possible spoofer, I will send them a **warning**. After `"+minsUntilPunished+" minute(s)`, "
						+"if they're still in a spoofing server, I will **kick** their butts"}})
				}
				if(args[0]==="ban"){
					spooferFlag="ban"; configFile.myServer.onSpooferFound="ban";
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					return channel.send({embed:{"color":0x00FF00,"description":"⛔ If `SpoofNinja` finds a possible spoofer, I will send them a **warning**. After `"+minsUntilPunished+" minute(s)`, "
						+"if they're still in a spoofing server, I will **ban** their butts"}})
				}
				if(args[0]==="instakick"){
					spooferFlag="instakick"; configFile.myServer.onSpooferFound="instakick";
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					return channel.send({embed:{"color":0x00FF00,"description":"✅ If `SpoofNinja` finds a possible spoofer, I will 👞**kick**💪 their butts `instantly`!"}})
				}
				if(args[0]==="instaban"){
					spooferFlag="instaban"; configFile.myServer.onSpooferFound="instaban";
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					return channel.send({embed:{"color":0x00FF00,"description":"✅ If `SpoofNinja` finds a possible spoofer, I will ⛔**ban**🔨 their asses `instantly`!"}})
				}
				if(args[0]==="check"){
					let txtStart="✅ If `SpoofNinja` finds a possible spoofer, I will ";
					if(spooferFlag==="nothing"){ return channel.send({embed:{"color":0x00FF00,"description":txtStart+"do **nothing** 👎"}}) }
					if(spooferFlag==="warning"){ return channel.send({embed:{"color":0x00FF00,"description":txtStart+"send them a **warning**"}}) }
					if(spooferFlag==="kick"){ return channel.send({embed:{"color":0x00FF00,"description":txtStart+"**kick** them after `"+minsUntilPunished+" minute(s)`"}}) }
					if(spooferFlag==="ban"){ return channel.send({embed:{"color":0x00FF00,"description":txtStart+"**ban** them after `"+minsUntilPunished+" minute(s)`"}}) }
					if(spooferFlag==="instakick"){ return channel.send({embed:{"color":0x00FF00,"description":txtStart+"**kick** them `instantly`!"}}) }
					if(spooferFlag==="instaban"){ return channel.send({embed:{"color":0x00FF00,"description":txtStart+"**ban** them `instantly`!"}}) }return channel.send({embed: embedMSG});
				}
			}
		}
		
		// MINUTES UNTIL PUNISH ADJUSTMENT
		if(command==="minstilpunish"){
			if(args.length<1){
				embedMSG={
					"color": 0x00FF00,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`"+config.cmdPrefix+"minsTilPunish check` ► to check current setting\n"
						+"`"+config.cmdPrefix+"minsTilPunish <mins>` ► to adjust minutes"
				};
				return channel.send({embed: embedMSG});
			}
			else{
				// CONFIGURATION FILE
				let configFile=JSON.parse(fs.readFileSync("./files/config.json", "utf8"));
				
				if(args[0]==="check"){
					return channel.send({embed:{"color":0x00FF00,"description": "✅ MinutesUntilPunished is set to: **"+minsUntilPunished+"** minutes(s)"}})
				}
				if(Number.isInteger(parseInt(args[0]))){
					minsUntilPunished=parseInt(args[0]); configFile.myServer.minsUntilPunished=parseInt(args[0]);
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					return channel.send({embed:{"color":0x00FF00,"description":"✅ I have adjusted `MinutesUntilPunished` to: **"+parseInt(args[0])+" minute(s)**"}})
				}
			}
		}
		
		// CHECK WHITELIST
		if(command==="check"){
			if(args.length<1){
				slackMSG.embeds=[{
					"color": parseColor(embedSettings.goodColor),
					"description": "```md\n"
						+config.cmdPrefix+"check server\n"
						+config.cmdPrefix+"check <@mention/user_id>```"
						
				}];
				SpoofNinja.send(channel,slackMSG)
			}
			else{
				
				// COMMAND ► !CHECK VERSION
				if(args[0].startsWith("ver")){
					request("https://raw.githubusercontent.com/JennerPalacios/SimpleSpoofNinja/master/version.txt",
						function(error,response,body){
							if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:739]\n"+error)}
							if(body){
								let gitHubVer=body.slice(0,-1);
								let verChecker="✅"; if(gitHubVer!==config.botVersion){ verChecker="⚠" }

								slackMSG.embeds=[{
									"color": parseColor(embedSettings.goodColor),
									"description": "GitHub [`SpoofNinja`]: **v"+gitHubVer+"**\n"
										+"Local Bot [`"+spoofNinja.name+"`]: **v"+config.botVersion+"** "+verChecker+"\n"
										+"**Discord** API [`discord.js`]: **v"+Discord.version+"**\n"
										+"**Node** API [`node.js`]: **"+process.version+"**"
								}];
								SpoofNinja.send(channel,slackMSG)
							}
						}
					);
					return
				}
				
				// COMMAND ► !CHECK ROLES
				if(args[0].startsWith("wlr")){
					let whiteListedRoles=[];
					if(myServer.whiteListedRoles.length>0){ whiteListedRoles=myServer.whiteListedRoles }
					
					if(whiteListedRoles.length<1){
						embedMSG={
							"color": parseColor(embedSettings.warningColor),
							"description": "⚠ There aren\"t any `whiteListedRoles`"
						}
					}
					embedMSG={
						"color": parseColor(embedSettings.goodColor),
						"description": "✅ I have **"+whiteListedRoles.length+"** `whiteListedRoles`:\n"+whiteListedRoles.join(", ")
					};
					return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:870\n"+err.message)});
				}
				
				// COMMAND ► !CHECK MEMBER IDs
				if(args[0].startsWith("wlm")){
					let whiteListedMembersIDs=[];
					if(myServer.whiteListedMembersIDs.length>0){ whiteListedMembersIDs=myServer.whiteListedMembersIDs }
					
					if(whiteListedMembersIDs.length<1){
						embedMSG={
							"color": parseColor(embedSettings.warningColor),
							"description": "⚠ There aren\"t any `whiteListedMembersIDs`"
						}
					}
					if(whiteListedMembersIDs.length>0 && whiteListedMembersIDs.length<89){
						embedMSG={
							"color": parseColor(embedSettings.goodColor),
							"description": "✅ I have **"+whiteListedMembersIDs.length+"** `whiteListedMembersIDs`:\n<@"+whiteListedMembersIDs.join(">, <@")+">"
						}
					}
					else{
						embedMSG={
							"color": parseColor(embedSettings.warningColor),
							"description": "⚠ There are too many members in `whiteListedMembersIDs`, max **88**, currently: `"+whiteListedMembersIDs.length+"`. "
								+"You should consider creating a `whiteListedRole` and assigning users to it."
						}
					}
					return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:906\n"+err.message)});
				}
				
				// COMMAND ► !CHECK SERVER
				if(args[0]==="server"){
					let guildMembers=await guild.members.map(m=>m);
					let milSecs=1000, daServers="", totalSpoofers=0, n=0, nd=1;
					
					// SEND NOTIFICATION
					slackMSG.embeds=[{
						"color": parseColor(embedSettings.goodColor),
						"thumbnail": {"url": embedSettings.startImg},
						"description": "**(>^.^)> NOTICE <(^.^<)**\nI am bout to check **"+guildMembers.length+"** members...\n"
							+"From server: **"+myServer.name+"**\n**On**: "+timeStamp(1)+"\n... please wait ..."
					}];
					
					SpoofNinja.send(channel,slackMSG);
					if(channel.id!==myServer.cmdChanIDs[0]){SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)}
					console.info(timeStamp()+" About to check "+cc.cyan+guildMembers.length+cc.reset+" users, from server: "+cc.cyan+myServer.name+cc.reset);
					
					if(config.botSupport==="yes"){
						globalNinjaWh.send({"embeds": [{"description": timeStamp(2)+"**"+myServer.name+"** has started a `"+config.cmdPrefix+"check server`, with **"
							+guildMembers.length+"** registered users <(^.^<)"}]});
					}
					
					for(var xUser=0; xUser < guildMembers.length; xUser++){
						setTimeout(async function(){
							console.info(timeStamp()+" ["+cc.yellow+nd+cc.reset+"/"+cc.green+guildMembers.length+cc.reset+"] Checking memberID: "+cc.cyan+guildMembers[n].id+cc.reset+" with userName: "+cc.cyan+guildMembers[n].user.username+cc.reset);
							
							let memberStillHere=await moderatorBot.guilds.get(myServer.id).members.get(guildMembers[n].id) || "nope";
							if(memberStillHere==="nope"){
								console.info(timeStamp()+" Member above has left the server during check.");
							}
							else{
								let spoofServersFound=await checkMember(guildMembers[n].id);
								let daMember=await isWhiteListed(guildMembers[n].id);

								// DO NOT POST FINDING FOR STAFF
								if(daMember.isWhiteListed==="yes"){
									spoofServersFound=[];
									if(daMember.memberIs==="Bot"){
										console.info(timeStamp()+" Member above is "+cc.purple+"Bot"+cc.reset+".... so "+cc.green+"shhhhhh!"+cc.reset)
									}
									if(daMember.memberIs==="Bot Owner"){
										console.info(timeStamp()+" Member above is "+cc.purple+"Bot Owner"+cc.reset+".... so "+cc.green+"shhhhhh!"+cc.reset)
									}
									if(daMember.memberIs==="WhitelistedUser"){
										console.info(timeStamp()+" Member above is a "+cc.green+"whiteListedMember"+cc.reset+"!")
									}
									if(daMember.memberIs==="WhitelistedRoled"){
										console.info(timeStamp()+" Member above has "+cc.green+"whiteListedRole(s)"+cc.reset+"!")
									}
								}

								// DO NOT CHECK OTHER BOTS
								if(guildMembers[n].user.bot){
									spoofServersFound=[];
									console.info(timeStamp()+" I have skipped the user above due to user being another \""+cc.purple+"BOT"+cc.reset+"\"!")
								}

								//	CHECK IF MY SERVER IS IN ALL SERVERS AND REMOVE IT
								if(spoofServersFound.includes(myServer.name)){
									myServerFound="yes"; spoofServersFound=spoofServersFound.slice(0,-1);
								}

								if(spoofServersFound.length>0){
									//
									//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
									//
									slackMSG.embeds=[{
										"thumbnail": {"url": embedSettings.snipeImg },
										"color": parseColor(embedSettings.warningColor),
										"description": "⚠ __**WARNING**__ ⚠\n**User**: "+guildMembers[n].user.username+"\n**Tag/ID**: <@"+guildMembers[n].id+"> \nWas **found** in server(s): \n"
											+spoofServersFound.join(", ")+"\n**On**: "+timeStamp(1),
										"footer": {
											"text": "User #"+nd+" of "+guildMembers.length+"..."
										}
									}];
									// POST NOOB FOUND IN SPOOFER SERVER
									SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG);

									console.log(timeStamp()+" "+cc.cyan+guildMembers[n].user.username+cc.reset+"("+cc.lblue+guildMembers[n].id+cc.reset+") was "
										+cc.red+"FOUND"+cc.reset+" in Server(s): "+cc.cyan+spoofServersFound.join(cc.reset+", "+cc.cyan)+cc.reset);

									// ADD TO TOTALSPOOFERS COUNT
									totalSpoofers++

									// RESET DATA FOR NEXT MEMBER IN WAIT-LIST
									spoofServersFound=[];
								}


								// END NOTIFICATION
								if(nd===guildMembers.length){
									slackMSG.embeds=[{
										"thumbnail": {"url": embedSettings.endImg },
										"color": parseColor(embedSettings.goodColor),
										"description": "**(>^.^)> ALL DONE <(^.^<)**\n.\nI __found__ a total of **"+totalSpoofers
											+"** potential spoOfers!\n.\nOut of **"+guildMembers.length+"** registered members\n**On**: "+timeStamp(1)
									}];
									console.info(timeStamp()+" "+cc.hlgreen+" DONE "+cc.reset+" I have checked "+cc.green+guildMembers.length+cc.reset+" and found "+cc.red+totalSpoofers+cc.reset+" potential spoofers!")

									if(config.botSupport==="yes"){ globalNinjaWh.send(timeStamp(2)+"**"+myServer.name+"** has found `"
										+totalSpoofers+"` spoofers, out of `"+guildMembers.length+"` users on their server <(^.^<)"); }

									SpoofNinja.send(channel,slackMSG);
									if(channel.id!==myServer.cmdChanIDs[0]){
										SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)
									}
								}
							}
							
							// ADD +1 TO COUNT TO CHECK NEXT MEMBER
							n++, nd++;
						}, milSecs);

						// ADD 1 SECOND TO NEXT MEMBER CHECK FROM SERVER
						milSecs=milSecs+1500;
					}
					return
				}

				// CHECK IF SOMEONE WAS MENTIONED AND THAT MEMBER EXIST WITHIN MY OWN SERVER
				let mentionMember=""; if(message.mentions.users.first()){mentionMember=await guild.members.get(message.mentions.users.first().id)}

				// IF MEMBER ID WAS PROVIDED INSTEAD OF @MENTIONED
				if(Number.isInteger(parseInt(args[0]))){
					mentionMember=await guild.members.get(args[0]) || {id: args[0], user: { username: "<@"+args[0]+">" } };
				}

				if(mentionMember.id){

					// DO NOT CHECK OTHER BOTS
					if(mentionMember.user.bot){
						console.info(timeStamp()+" I have skipped the user above due to user being another \""+cc.purple+"BOT"+cc.reset+"\"!");
						slackMSG.embeds=[{
							"thumbnail": {"url": embedSettings.honorImg },
							"color": parseColor(embedSettings.goodColor),
							"description": "✅ **"+mentionMember.user.username+"** appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍"
						}];
						if(channel.id!==myServer.cmdChanIDs[0]){
							SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)
						}
						return SpoofNinja.send(channel,slackMSG)
					}
					
					let daMember=isWhiteListed(mentionMember.id);
					
					// DO NOT POST FINDING FOR WHITELISTED
					if(daMember.isWhiteListed==="yes"){
						if(daMember.memberIs==="Bot"){
							console.info(timeStamp()+" Member above is "+cc.purple+"Bot"+cc.reset+".... so "+cc.green+"shhhhhh!"+cc.reset)
						}
						if(daMember.memberIs==="Bot Owner"){
							console.info(timeStamp()+" Member above is "+cc.purple+"Bot Owner"+cc.reset+".... so "+cc.green+"shhhhhh!"+cc.reset)
						}
						if(daMember.memberIs==="WhitelistedUser"){
							console.info(timeStamp()+" Member above is a "+cc.green+"whiteListedMember"+cc.reset+"!")
						}
						if(daMember.memberIs==="WhitelistedRoled"){
							console.info(timeStamp()+" Member above has "+cc.green+"whiteListedRole(s)"+cc.reset+"!")
						}
						slackMSG.embeds=[{
							"thumbnail": {"url": embedSettings.honorImg },
							"color": parseColor(embedSettings.goodColor),
							"description": "✅ **"+mentionMember.user.username+"** appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍"
						}];
						if(channel.id!==myServer.cmdChanIDs[0]){
							SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)
						}
						return SpoofNinja.send(channel,slackMSG)
					}

					// CHECK FOR THE PERSON USING SPOOFING SERVERS LIST
					let spoofServersFound=await checkMember(mentionMember.id);
					//console.info("spoofServersFound "+cc.green+"returned"+cc.reset+" results:");console.info(spoofServersFound);//

					//	CHECK IF MY SERVER IS IN ALL SERVERS AND REMOVE IT
					if(spoofServersFound.includes(myServer.name)){
						myServerFound="yes"; spoofServersFound=spoofServersFound.slice(0,-1);
					}

					// MEMBER WAS NOT FOUND IN ANY SPOOFING SERVER - FOR TEST CHANNEL
					if(spoofServersFound.length<1){
						//
						//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
						//
						slackMSG.embeds=[{
							"thumbnail": {"url": embedSettings.honorImg },
							"color": parseColor(embedSettings.goodColor),
							"description": "✅ **"+mentionMember.user.username+"** appears to be an __honorably__-awesome\n **Pokemon Go Trainer** 👍 😍"
						}];

						if(config.consoleLog==="all"){
							console.info(timeStamp()+" "+cc.cyan+mentionMember.id+cc.reset+" appears to be a "+cc.green+"LEGIT"+cc.reset+" Trainer")
						}
						else{
							console.info(timeStamp()+" "+cc.cyan+mentionMember.id+cc.reset+" appears to be a "+cc.green+"LEGIT"+cc.reset+" Trainer")
						}
					}

					// MEMBER WAS FOUND IN A SPOOFING SERVER
					else{
						//
						//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
						//
						slackMSG.embeds=[{
							"thumbnail": {"url": embedSettings.snipeImg },
							"color": parseColor(embedSettings.warningColor),
							"description": "⚠ __**WARNING**__ ⚠\n**User**: "+mentionMember.user.username+"\n**Tag/ID**: <@"+mentionMember.id+">\nWas **found** in __servers__:\n"+spoofServersFound.join(", ")+"\n**On**: "+timeStamp(1)
						}];

						if(config.consoleLog==="all"){
							console.log(timeStamp()+" "+cc.cyan+mentionMember.user.username+cc.reset+"("+cc.lblue+mentionMember.id+cc.reset
								+") was "+cc.red+"FOUND"+cc.reset+" in servers: "+cc.cyan+spoofServersFound.join(cc.reset+", "+cc.cyan)+cc.reset)
						}
						else{
							console.log(timeStamp()+" "+cc.cyan+mentionMember.user.username+cc.reset+"("+cc.lblue+mentionMember.id+cc.reset+") was "+cc.red+"FOUND"+cc.reset
								+" in servers: "+cc.cyan+spoofServersFound.join(cc.reset+", "+cc.cyan)+cc.reset)
						}
					}
					// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
					if(channel.id!==myServer.cmdChanIDs[0]){
						SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)
					}
					return SpoofNinja.send(channel,slackMSG)
				}
				else{
					slackMSG.embeds=[{
						"color": parseColor(embedSettings.goodColor),
						"description": "Please `@mention` a person you want me to `"+config.cmdPrefix+"check`, you can use `@user_tag` or `user_id_number`"
					}];

					// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
					if(channel.id!==myServer.cmdChanIDs[0]){
						SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)
					}
					return SpoofNinja.send(channel,slackMSG)
				}
			}
		}
		
		// MODIFY WHITELIST: ADD || DEL - ROLES || MEMBERS
		if(command.startsWith("addr")||command.startsWith("delr")||command.startsWith("addm")||command.startsWith("delm")){
			
			// CONFIGURATION FILE
			let configFile=JSON.parse(fs.readFileSync("./files/config.json", "utf8"));
			
			// ADD ROLE TO WHITELIST
			if(command.startsWith("addr") && member.id===config.ownerID){
				if(!ARGS[0]){
					embedMSG={
						"color": parseColor(embedSettings.goodColor),
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`"+config.cmdPrefix+"addrole <roleName>` or `"+config.cmdPrefix+"addr <roleName>`\n► for adding a role to `whiteListedRoles`\n"
							+"► IE: `"+config.cmdPrefix+"addrole VIP`\n► case sensitive, role must exist!"
					}
				}
				else{
					configFile.myServer.whiteListedRoles.push(ARGS[0]);
					myServer.whiteListedRoles.push(ARGS[0]);
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					embedMSG={
						"color": parseColor(embedSettings.goodColor),
						"description": "✅ The role: `"+ARGS[0]+"` was **successfully** added to `whiteListedRoles`"
					}
				}
				return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" ERROR L:699\n"+err.message)})
			}
			
			// DELETE ROLE FROM WHITELIST
			if(command.startsWith("delr") && member.id===config.ownerID){
				if(!ARGS[0]){
					embedMSG={
						"color": parseColor(embedSettings.warningColor),
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`"+config.cmdPrefix+"delrole <roleName>` or `"+config.cmdPrefix+"delr <roleName>`\n► for removing a role from `whiteListedRoles`\n"
							+"► IE: `"+config.cmdPrefix+"addrole VIP`\n► case sensitive, role must exist!"
					}
				}
				else{
					let n=myServer.whiteListedRoles.indexOf(ARGS[0]);
					if(n===-1){
						embedMSG={
							"color": parseColor(embedSettings.dangerColor),
							"description": "⛔ The role: `"+ARGS[0]+"` was not found in `whiteListedRole`"
						}
					}
					else{
						configFile.myServer.whiteListedRoles.splice(n,1);
						myServer.whiteListedRoles.splice(n,1);
						fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
						embedMSG={
							"color": parseColor(embedSettings.goodColor),
							"description": "✅ The role: `"+ARGS[0]+"` was **successfully** removed from `whiteListedRoles`"
						}
					}
				}
				return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" ERROR L:740\n"+err.message)})
			}
			
			// ADD MEMBER TO WHITELIST
			if(command.startsWith("addm") && member.id===config.ownerID){
				if(!ARGS[0]){
					embedMSG={
						"color": parseColor(embedSettings.warningColor),
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`"+config.cmdPrefix+"addmember @mention` or `"+config.cmdPrefix+"addm @mention`\n► for adding a member to `whiteListedMembersIDs`\n"
							+"► IE: `"+config.cmdPrefix+"addmember @JennerPalacios`\n► member must be in server\n"
							+"► OR: `"+config.cmdPrefix+"addmember 237597448032354304`\n► member is **NOT** in server"
					}
				}
				else{
					// CHECK IF SOMEONE WAS MENTIONED AND THAT MEMBER EXIST WITHIN MY OWN SERVER
					let mentionMember; if(message.mentions.users.first()){ mentionMember=message.mentions.users.first() }
					
					// IF MEMBER ID WAS PROVIDED INSTEAD OF @MENTIONED
					if(ARGS.length>0 && Number.isInteger(parseInt(ARGS[0]))){ mentionMember={ id: ARGS[0] } }
					
					configFile.myServer.whiteListedMembersIDs.push(mentionMember.id);
					myServer.whiteListedMembersIDs.push(mentionMember.id);
					fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					embedMSG={
						"color": parseColor(embedSettings.goodColor),
						"description": "✅ The member: <@"+mentionMember.id+"> was **successfully** added to `whiteListedMembersIDs`"
					}
				}
				return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:779\n"+err.message)})
			}
			
			// DELETE MEMBER FROM WHITELIST
			if(command.startsWith("delm") && member.id===config.ownerID){
				if(!ARGS[0]){
					embedMSG={
						"color": parseColor(embedSettings.warningColor),
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`"+config.cmdPrefix+"delrole <roleName>` or `"+config.cmdPrefix+"delr <roleName>`\n► for removing a role from `whiteListedMembersIDs`\n"
							+"► IE: `"+config.cmdPrefix+"addrole VIP`\n► case sensitive, role must exist!"
					}
				}
				else{
					// CHECK IF SOMEONE WAS MENTIONED AND THAT MEMBER EXIST WITHIN MY OWN SERVER
					let mentionMember; if(message.mentions.users.first()){ mentionMember=message.mentions.users.first() }
					
					// IF MEMBER ID WAS PROVIDED INSTEAD OF @MENTIONED
					if(ARGS.length>0 && Number.isInteger(parseInt(ARGS[0]))){ mentionMember={ id: ARGS[0] } }
					
					let n=configFile.myServer.whiteListedMembersIDs.indexOf(mentionMember.id);
					if(n===-1){
						embedMSG={
							"color": parseColor(embedSettings.dangerColor),
							"description": "⛔ The member: <@"+mentionMember.id+"> was not found in `whiteListedMembersIDs`"
						}
					}
					else{
						configFile.myServer.whiteListedMembersIDs.splice(n,1);
						myServer.whiteListedMembersIDs.splice(n,1);
						fs.writeFile("./files/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
						embedMSG={
							"color": parseColor(embedSettings.goodColor),
							"description": "✅ The member: `"+mentionMember.id+"` was **successfully** removed from `whiteListedMembersIDs`"
						}
					}
				}
				return channel.send({embed: embedMSG}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:826\n"+err.message)})
			}
		}
		
		//
		//
		//
		//
		} //	DISABLE FOR GLOBAL USE - ANY MEMBER - AT DEVELOPER'S SERVER
		//
		//
		//
		//
		
	}
		
		
		if(myServer.cmdChanIDs[0]===channel.id){
			if(message.embeds.length!==0){
				if(message.embeds[0]){
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
											"color": 0xFF0000,
											"title": warningMSG.title,
											"thumbnail": {"url": embedSettings.warningImg},
											"description": warningMSG.description
										};
										if(spooferFlag==="warning"){
											channel.send({
												embed:{"color":0xFF9900,"description":"A **warning** has been sent to: <@"+catchID+">"}
											}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:1362\n"+err.message)})
										}
										if(spooferFlag==="kick"){
											channel.send({
												embed:{"color":0xFF9900,"description":"A **warning** has been sent to: <@"+catchID+">. They will be "
												+"**kicked** in `"+minsUntilPunished+" minute(s)` if they haven\"t left the spoofing server(s)."}
											}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:1368\n"+err.message)})
										}
										if(spooferFlag==="ban"){
											channel.send({
												embed:{"color":0xFF9900,"description":"A **warning** has been sent to: <@"+catchID+">. They will be "
												+"**banned** in `"+minsUntilPunished+" minute(s)` if they haven\"t left the spoofing server(s)."}
											}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:1374\n"+err.message)})
										}
										guild.members.get(catchID).send({embed: embedMSG}).catch(err=>{
											console.info(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" L:1377 | "+err.message+" | "
												+"Member has disabled DMs or has blocked me... No "+cc.yellow+"warning"+cc.reset+" was sent, I will try to "
												+cc.red+"ban"+cc.reset+" in "+cc.green+minsUntilPunished+" minute(s)"+cc.reset+" instead!")
										})
									}

									if(spooferFlag==="instakick"){
										embedMSG={
											"color": 0xFF0000,
											"title": kickMSG.title,
											"thumbnail": {"url": embedSettings.kickImg},
											"description": kickMSG.description
										};
										channel.send({embed:{"color":0xFF0000,"description":"<@"+catchID+"> has been **KICKED**! 💪"}});
										guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												console.info(timeStamp()+" "+cc.cyan+tempMember.user.username+cc.reset+"("+cc.lblue+tempMember.id+cc.reset+") ignored warning so they were "+cc.red+"KICKED"+cc.reset+"!")
												guild.members.get(catchID).kick("AutoKick: Rule violation, user was found in spoofing server(s)")
											}
											catch(err){
												console.info(timeStamp()+" ["+cc.red+"ERROR"+cc.reset+"] L:1396\n"+err.message);
											}
										}).catch(err=>{
											console.info(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" L:1400 | "+err.message+" | "
												+"Member has disabled DMs or has blocked me... so they were "+cc.red+"instantly banned"+cc.reset+" instead!");
											guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
										})
									}

									if(spooferFlag==="instaban"){
										embedMSG={
											"color": 0xFF0000,
											"title": banMSG.title,
											"thumbnail": {"url": embedSettings.banImg},
											"description": banMSG.description
										};
										channel.send({embed:{"color":0xFF0000,"description":"<@"+catchID+"> has been **BANNED**! ⛔"}});
										guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												console.info(timeStamp()+" "+cc.cyan+tempMember.user.username+cc.reset+"("+cc.lblue+tempMember.id+cc.reset+") ignored warning so they were "+cc.red+"BANNED"+cc.reset+"!")
												guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s)"})
											}
											catch(err){
												channel.send(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L1419\n"+err.message);
											}
										}).catch(err=>{
											console.info(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" L:1424 | "+err.message+" | "
												+"Member has disabled DMs or has blocked me... so they were "+cc.red+"instantly banned"+cc.reset+" instead!");
											guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
										})
									}
									return
								}


								// SEARCH FOR "**found**" WORD IN !CHECK <@MENTION/MEMBER_ID> OR IN !CHECK SERVER			// WIP
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
											"color": 0xFF0000,
											"title": warningMSG.title,
											"thumbnail": {"url": embedSettings.warningImg},
											"description": warningMSG.description
										};
										if(spooferFlag==="warning"){
											channel.send({embed:{"color":0xFF9900,"description":"A **warning** has been sent to: <@"+catchID+">"}});
										}
										if(spooferFlag==="kick"){
											channel.send({embed:{"color":0xFF9900,"description":"A **warning** has been sent to: <@"+catchID+">. They will be "
												+"**kicked** in `"+minsUntilPunished+" minute(s)` if they haven\"t left the spoofing server(s)."}});
										}
										if(spooferFlag==="ban"){
											channel.send({embed:{"color":0xFF9900,"description":"A **warning** has been sent to: <@"+catchID+">. They will be "
												+"**banned** in `"+minsUntilPunished+" minute(s)` if they haven\"t left the spoofing server(s)."}});
										}

										guild.members.get(catchID).send({embed: embedMSG}).catch(err=>{
											console.info(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" L:1467 | "+err.message+" | "
												+"Member has disabled DMs or has blocked me...")
										})

										if(spooferFlag==="kick" || spooferFlag==="ban"){
											//
											// TIMER FOR PUNISHMENT
											//
											setTimeout(async function(){
												let tempMember=bot.guilds.get(myServer.id).members.get(catchID);
												if(!tempMember){
													return moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({embed:{"color":0x009900,"description":"<@"+catchID+"> has decided to leave our server instead."}}).catch(err=>{console.info(timeStamp()+" [ERROR L:360]\n"+err.message)});
												}
												else{
													// CHECK IF MEMBER IS IN A SPOOFING SERVER
													let spoofServersFoundAgain=checkMember(tempMember.id);

													// CHECK IF MY SERVER IS IN ALL SERVERS AND REMOVE IT
													if(spoofServersFoundAgain.includes(myServer.name)){
														spoofServersFoundAgain=spoofServersFoundAgain.slice(0,-1);
													}
													let daTempMember=isWhiteListed(tempMember.id);
													
													// DO NOT POST FINDING FOR STAFF
													if(daTempMember.isWhiteListed==="yes"){
														if(daTempMember.memberIs==="WhitelistedUser"){
															console.info(timeStamp()+" "+cc.cyan+tempMember.user.username+cc.reset+"("+cc.lblue+tempMember.id+cc.reset+") was added to "+cc.green+"whiteListedMembersIDs"+cc.reset+", the "+spooferFlag+" was not executed!")
														}
														if(daTempMember.memberIs==="WhitelistedRoled"){
															console.info(timeStamp()+" "+cc.cyan+tempMember.user.username+cc.reset+"("+cc.lblue+tempMember.id+cc.reset+") was added to "+cc.green+"whiteListedRole(s)"+cc.reset+", the "+spooferFlag+" was not executed!")
														}
														spoofServersFoundAgain=[];
													}

													if(spoofServersFoundAgain.length>0){
														// MODERATOR BOT POSTS TO COMMAND CHANNEL

														if(spooferFlag==="ban"){
															moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({
																embed:{"color":0xFF0000,"description":"<@"+tempMember.id+"> ignored the `warning` so they were **banned** 🔨"}
															}).catch(err=>{console.info(timeStamp()+" [ERROR L]\n"+err.message)});

															embedMSG={
																"color": 0xFF0000,
																"title": banMSG.title,
																"thumbnail": {"url": embedSettings.banImg},
																"description": banMSG.description
															}
														}
														else{
															moderatorBot.channels.get(myServer.cmdChanIDs[0]).send({
																embed:{"color":0xFF0000,"description":"<@"+tempMember.id+"> ignored the `warning` so they were **kicked** 😏"}
															}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:1509\n"+err.message)});

															embedMSG={
																"color": 0xFF0000,
																"title": kickMSG.title,
																"thumbnail": {"url": embedSettings.kickImg},
																"description": kickMSG.description
															}
														}

														moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).send({embed: embedMSG}).then(()=>{
															try {
																if(spooferFlag==="kick"){
																	console.info(timeStamp()+" "+cc.cyan+tempMember.user.username+cc.reset+"("+cc.lblue+tempMember.id+cc.reset+") ignored warning so they were "+cc.red+"KICKED"+cc.reset+"!")
																	moderatorBot.guilds.get(myServer.id).members.get(tempMember.id).kick("AutoKick: Rule violation, user was found in spoofing server(s)")
																}
																if(spooferFlag==="ban"){
																	console.info(timeStamp()+" "+cc.cyan+tempMember.user.username+cc.reset+"("+cc.lblue+tempMember.id+cc.reset+") ignored warning so they were "+cc.red+"BANNED"+cc.reset+"!")
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
											"color": 0xFF0000,
											"title": kickMSG.title,
											"thumbnail": {"url": embedSettings.kickImg},
											"description": kickMSG.description
										};
										channel.send({embed:{"color":0xFF0000,"description":"<@"+catchID+"> has been **KICKED**! 💪"}});
										guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												guild.members.get(catchID).kick("AutoKick: Rule violation, user was found in spoofing server(s)")
											}
											catch(err){
												channel.send(" catch(err) ERROR:\n"+err.message);
											}
										}).catch(err=>{
											console.info(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" L:1616 | "+err.message+" | "
												+"Member has disabled DMs or has blocked me... so no "+cc.red+"KICK"+cc.reset+"-message was sent; I will "+cc.red+"BAN"+cc.reset+" them instead!");
											guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s) | Member blocked me so no message was sent"})
										})
									}

									if(spooferFlag==="instaban"){
										embedMSG={
											"color": 0xFF0000,
											"title": banMSG.title,
											"thumbnail": {"url": embedSettings.banImg},
											"description": banMSG.description
										};
										channel.send({embed:{"color":0xFF0000,"description":"<@"+catchID+"> has been **BANNED**! ⛔"}});
										guild.members.get(catchID).send({embed: embedMSG}).then(()=>{
											try {
												guild.members.get(catchID).ban({days: 7, reason: "AutoBan: Rule violation, user was found in spoofing server(s)"})
											}
											catch(err){
												console.info(timeStamp()+" catch(err) ["+cc.red+"ERROR"+cc.reset+"]\n"+err.message);
											}
										}).catch(err=>{
											console.info(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" L:1638 | "+err.message+" | "
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
});

moderatorBot.on("disconnect", function (){
	console.info(timeStamp()+cc.bgred+" -- MODERATOR BOT FOR SPOOFNINJA HAS DISCONNECTED --"+cc.reset)
});
