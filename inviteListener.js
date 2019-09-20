//
//		CHECK THE LINE BELOW...DO THESE MAKE NO SENSE? ARE THEY RANDOM CHARACTERS?
//
// 		🔴 📵 🗨 📗 🗒 📜 📋 📝 📆 📲 👤 👥 🤖 📥 📤 ✅ ⚠ ⛔ 🚫 ❌ 🔨 🙂 😮 😁 😄 😆 😂 😅 😛 😍 😉 🤔 👍 👎 ❤
//
//		THEN YOU NEED TO ADJUST YOUR SETTINGS!!! "Encoding" » "Encode in UTF-8"
//		... BECAUSE THESE ARE ACTUAL IN-TEXT EMOJIS (WHICH DISCORD ALSO USES)
//
const Discord=require('discord.js');
const bot=new Discord.Client();
const moderatorBot=new Discord.Client();
const config=require('./files/config.json');
const servers=require('./files/servers.json'); 

const sqlite=require("sqlite");sqlite.open("./files/invites.sqlite");

// GRAB THE SPOOFING SERVERS FROM JSON AND REFORMAT IT
const spoofServers=servers.servers, myServer=config.myServer, spoofNinja=config.spoofNinja, embedSettings=config.embedSettings;



//
//				DEFINE GLOBAL AND COMMON VARIABLES
//
var serverCount, serverName, slackMSG,
	cc={"reset":"\x1b[0m","ul":"\x1b[4m","lred":"\x1b[91m","red":"\x1b[31m","lgreen":"\x1b[92m","green":"\x1b[32m","lyellow":"\x1b[93m","yellow":"\x1b[33m",
		"lblue":"\x1b[94m","blue":"\x1b[34m","lcyan":"\x1b[96m","cyan":"\x1b[36m","pink":"\x1b[95m","purple":"\x1b[35m","bgwhite":"\x1b[107m","bggray":"\x1b[100m",
		"bgred":"\x1b[41m","bggreen":"\x1b[42m","bglgreen":"\x1b[102m","bgyellow":"\x1b[43m","bgblue":"\x1b[44m","bglblue":"\x1b[104m","bgcyan":"\x1b[106m",
		"bgpink":"\x1b[105m","bgpurple":"\x1b[45m","hlwhite":"\x1b[7m","hlred":"\x1b[41m\x1b[30m","hlgreen":"\x1b[42m\x1b[30m","hlblue":"\x1b[44m\x1b[37m",
		"hlcyan":"\x1b[104m\x1b[30m","hlyellow":"\x1b[43m\x1b[30m","hlpink":"\x1b[105m\x1b[30m","hlpurple":"\x1b[45m\x1b[37m"};


//
//				FUNCTION: GET SERVER NAME TO KNOW WHERE IT WAS SHARED
//
function getServName(serverID){
	serverCount="";
	for(serverCount="0"; serverCount < spoofServers.length; serverCount++){
		if(spoofServers[serverCount].server===serverID){
			return spoofServers[serverCount].name
		}
	}
}



//
//		PARSE COLORS FUNCTION
//
function parseColor(color){
	let tempColor=color; tempColor=tempColor.slice(1); tempColor="0x"+tempColor; return parseInt(tempColor);
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
		return cc.blue+yr+"/"+mo+"/"+da+" "+hr+":"+min+":"+sec+cc.reset+" |"
	}
	if(type===1) {
		// `MM/DD/YYYY` **@** `HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+"` **@** `"+hr+":"+min+":"+sec+"`"
	}
	if(type===2) {
		// `MM/DD/YYYY @ HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+" @ "+hr+":"+min+":"+sec+"`"
	}
	if(type===4) {
		// YYYY/MM/DD @ HH:MM:SS
		return yr+"/"+mo+"/"+da;
	}
}



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
  


// START SCRIPT
bot.on('ready', () => {
	// SET BOT AS INVISIBLE = NINJA <(^.^<)
	bot.user.setPresence({"status":"invisible"});
	
	setTimeout(function(){
		SpoofNinja=new SpoofNinjaWhCatcher();
		SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG);
	}, 5000);
	
	console.info(timeStamp()+" -- DISCORD SpoofNinja, "+cc.purple+"inviteListener"+cc.reset+" module, IS "+cc.green+"READY"+cc.reset+" --");
	console.info(timeStamp()+" I am scanning "+cc.cyan+spoofServers.length+cc.reset+" Spoofing Servers for "+cc.green+"NEW"+cc.reset+" invitecodes being shared");
	
	slackMSG={
		'username': spoofNinja.name,
		'avatarURL': spoofNinja.avatar,
		'embeds': [{
			'color': parseColor(embedSettings.goodColor),
			'description': 'I am scanning for **NEW** inviteCodes being shared in **spoOfing** servers'
		}]
	};
	
	sqlite.run("CREATE TABLE IF NOT EXISTS inviteCodes ("
		+"id INTEGER PRIMARY KEY AUTOINCREMENT, "
		+"serverName TEXT, "
		+"serverID TEXT, "
		+"inviteCode TEXT, "
		+"publishDate TEXT, "
		+"forServer TEXT, "
		+"isSpoofing TEXT, "
		+"checked TEXT)")
	.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:26 | "+err.message)});
	
	sqlite.run("CREATE TABLE IF NOT EXISTS spoofingCodes ("
		+"id INTEGER PRIMARY KEY AUTOINCREMENT, "
		+"serverName TEXT, "
		+"inviteCode TEXT, "
		+"publishDate TEXT)")
	.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:26 | "+err.message)});
});



// ##########################################################################
// ############################## TEXT COMMANDS #############################
// ##########################################################################
bot.on('message', message => {
	
	// IGNORE REGULAR MESSAGES, MESSAGES WITHOUT CONTENT, OR OTHER BOTS
	if(!message.member){ return }
	if(!message.member.user){ return }
	if(message.member.user.bot){ return }
	if(!message.member.user.username){ return }
	if(!message.content){ return }
	
	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, msg=message.content;
	
	//
	// ############################## INVITE LISTENER ##############################
	//
	let invLinks=message.content.match(/discord.gg/g);
	if(invLinks){
		if(message.channel.id!==config.myServer.cmdChanID){
			let servName="";
			if(!message.guild){ return }
			servName=getServName(message.guild.id) || message.guild.name;
			invPos=message.content.indexOf("discord.gg");invStart=invPos+11; invEnd=invPos+18;
			let invCode=message.content.slice(invStart,invEnd);
			
			sqlite.get(`SELECT * FROM inviteCodes WHERE inviteCode="${invCode}"`).then(row => {
				if (!row) {
					sqlite.run("INSERT INTO inviteCodes (serverName, serverID, inviteCode, publishDate) VALUES (?, ?, ?, ?)",
						[servName, message.guild.id, invCode, timeStamp(4)]);
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.goodColor),
							'description': '✅ A **new** inviteCode was saved to **DB** 👍'
						}]
					};
					return SpoofNinja.send(moderatorBot.guilds.get(myServer.id).channels.get(myServer.cmdChanIDs[0]),slackMSG)
				}
			}).catch(console.error);
		}
	}
});

//
// MODERATOR BOT
//
moderatorBot.on('message', message => {
	
	// IGNORE REGULAR MESSAGES, MESSAGES WITHOUT CONTENT, OR OTHER BOTS
	if(!message.member){ return }
	if(!message.member.user){ return }
	if(message.member.user.bot){ return }
	if(!message.member.user.username){ return }
	if(!message.content){ return }
	
	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, msg=message.content;
	
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT CMDCHANIDS
	if(!myServer.cmdChanIDs.includes(channel.id)){ return }
	
	// IGNORE REGULAR CHAT
	if(!message.content.startsWith(config.cmdPrefix)){ return }
	
	// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
	let adminRole=guild.roles.find(role => role.name === myServer.adminRoleName);
		if(!adminRole){adminRole={"id":"111111111111111111"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.purple+myServer.adminRoleName+cc.reset)}
	let modRole=guild.roles.find(role => role.name === myServer.modRoleName);
		if(!modRole){modRole={"id":"111111111111111111"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.purple+myServer.modRoleName+cc.reset)}
	
	// GRAB COMMANDS AND ARGUMENTS
	let command=msg.toLowerCase(), args=msg.toLowerCase().split(/ +/).slice(1), ARGS=msg.split(/ +/).slice(1); command=command.split(/ +/)[0]; command=command.slice(config.cmdPrefix.length);
	
	if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID || member.user.id==="264304137863299072"){
		if(command==="il"){
			let validArgs="no";
			if(args.length>0){
				if(args[0]==="count"){validArgs="yes"}
				if(args[0]==="store"){validArgs="yes"}
				if(args[0].startsWith("f")){validArgs="yes"}
				if(args[0]==="check"){
					if(args.length>1){
						if(args[1]==="last"){validArgs="yes"}
						if(Number.isInteger(parseInt(args[1]))){validArgs="yes"}
					}
				}
				if(args[0].startsWith("l")){
					if(args.length>1){
						if(args[1].startsWith("c")){validArgs="yes"}
						if(args[1].startsWith("s")){validArgs="yes"}
						if(args[1].startsWith("f")){validArgs="yes"}
						if(args[1].startsWith("d")){if(Number.isInteger(parseInt(args[2]))){validArgs="yes"}}
						if(args[1].startsWith("p")){if(Number.isInteger(parseInt(args[2]))){validArgs="yes"}}
					}
					else{
						validArgs="yes"
					}
				}
				if(args[0]==="checked"){
					if(Number.isInteger(parseInt(args[1]))){if(args[2]==="yes" || args[2]==="no"){if(args[3]){validArgs="yes"}}}
				}
				if(args[0]==="del"){
					if(args[1] && Number.isInteger(parseInt(args[1]))){validArgs="yes"}
				}
			}
			
			// INVALID ARGS
			if(validArgs==="no"){
				slackMSG={
					'username': spoofNinja.name,
					'avatarURL': spoofNinja.avatar,
					'embeds': [{
						'color': parseColor(embedSettings.goodColor),
						'title': 'ℹ Available Syntax and Arguments ℹ',
						'description': '```md\n'
							+config.cmdPrefix+'il list\n'
							+config.cmdPrefix+'il list count\n'
							+config.cmdPrefix+'il list spoofing\n'
							+config.cmdPrefix+'il list page <number>\n'
							+config.cmdPrefix+'il list del <id>\n'
							+config.cmdPrefix+'il list find <serverName>\n'
							+config.cmdPrefix+'il check <id>\n'
							+config.cmdPrefix+'il checked <id> <yes/no> <name>\n'
							+config.cmdPrefix+'il store <inviteCode> <serverName>\n'
							+config.cmdPrefix+'il find <serverName>\n'
							+config.cmdPrefix+'il count\n'
							+config.cmdPrefix+'il del <id>```'
					}]
				};
				return SpoofNinja.send(channel,slackMSG)
			}
			
			// LIST
			if(args[0].startsWith("l")){
				
				// ENTIRE GLOBAL LIST
				if(args.length<2){
					const commander=member;
					const reactionFilter=(reaction,user)=>{return ["⬅","➡"].includes(reaction.emoji.name) && user.id===commander.id};
					
					sqlite.all(`SELECT * FROM inviteCodes`)
					.then(async rows=>{
						if(rows.length<1){
							slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
								'embeds': [{'color': parseColor(embedSettings.dangerColor),'description': '⛔ I don\'t have any invites...'
							}]};
							return SpoofNinja.send(channel,slackMSG)
						}
						else{
							let dbStart=0,dbEnd=0,dbAmount=10,dbOutput="",dbPage=1,dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);
							if(rows.length>dbAmount){dbEnd=dbAmount}else{dbEnd=rows.length}
							
							for(dbStart;dbStart<dbEnd;dbStart++){
								if(!rows[dbStart].isSpoofing){rows[dbStart].isSpoofing="unk"}if(!rows[dbStart].checked){rows[dbStart].checked="nop"}
								dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].isSpoofing+"` ✅`"+rows[dbStart].checked+"` 🌐`"+rows[dbStart].inviteCode+"`.\n"
							}
							
							let embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
							moderatorBot.channels.get(channel.id).send(embedMSG)
							.then(async sqliteEntries=>{
								sqliteEntries.react("⬅").then(()=>{sqliteEntries.react("➡").catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))}).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								let reactionCollector=sqliteEntries.createReactionCollector(reactionFilter,{time:60000});
								reactionCollector.on("collect",async (reaction,reactionsCollector)=>{
									await sqliteEntries.reactions.get(reaction.emoji.name).remove(commander.user);
									if(reaction.emoji.name==="⬅"){
										dbOutput="";dbPage--;if(dbPage<1){dbPage=1}dbStart=dbStart-dbAmount-dbAmount;if(dbStart<0){dbStart=0}dbEnd=dbStart+dbAmount;if(dbEnd>rows.length){dbEnd=rows.length}
										for(dbStart;dbStart<dbEnd;dbStart++){
											if(!rows[dbStart].isSpoofing){rows[dbStart].isSpoofing="unk"}if(!rows[dbStart].checked){rows[dbStart].checked="nop"}
											dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].isSpoofing+"` ✅`"+rows[dbStart].checked+"` 🌐`"+rows[dbStart].inviteCode+"`.\n"
										}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
										await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
									}
									else{
										dbOutput="";dbPage++;if(dbPage>=dbPages){dbPage=dbPages;}
										if(dbStart<rows.length){
											dbEnd=dbStart+dbAmount;
											if(dbEnd>rows.length){
												dbEnd=rows.length;
											}
											for(dbStart;dbStart<dbEnd;dbStart++){
												if(!rows[dbStart].isSpoofing){rows[dbStart].isSpoofing="unk"}if(!rows[dbStart].checked){rows[dbStart].checked="nop"}
												dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].isSpoofing+"` ✅`"+rows[dbStart].checked+"` 🌐`"+rows[dbStart].inviteCode+"`.\n"
											}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
											await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
										}
									}
								});
								reactionCollector.on("end",collected=>{
									console.info(timeStamp()+" "+cc.hlblue+" EXPIRED "+cc.reset+" Paging through DB timedOut, Message was deleted for protection/antiSpam");
									sqliteEntries.edit("Scrolling through Database has expired; the message removed for protection, "+commander,{embed:""})
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
									sqliteEntries.clearReactions().catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not clear reactions from message | "+err.message));
								});
							})
							.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
					})
					.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:266 | "+err.message)});
				}
				else{
			
					// COUNT
					if(args[1].startsWith("c")){
						sqlite.all(`SELECT * FROM inviteCodes`)
						.then(rows=>{
							if(rows.length<1){
								slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
									'embeds': [{'color': parseColor(embedSettings.dangerColor),'description': '⛔ I don\'t have any invites...'
								}]};
								return SpoofNinja.send(channel,slackMSG)
							}
							else{
								let dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);
								slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
								'embeds': [{'color': parseColor(embedSettings.goodColor),
									'description': '✅ There are **'+rows.length+'** inviteCodes = **'+dbPages+'** pages!'
								}]};
								return SpoofNinja.send(channel,slackMSG)
							}
						})
						.catch(err=>{
							console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:266 | "+err.message)
						})
					}
					
					// SPOOFING LIST
					if(args[1].startsWith("s")){
						const commander=member;
						const reactionFilter=(reaction,user)=>{return ["⬅","➡"].includes(reaction.emoji.name) && user.id===commander.id};
						
						sqlite.all(`SELECT * FROM spoofingCodes`)
						.then(async rows=>{
							if(rows.length<1){
								slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
									'embeds': [{'color': parseColor(embedSettings.dangerColor),'description': '⛔ I don\'t have any invites...'
								}]};
								return SpoofNinja.send(channel,slackMSG)
							}
							else{
								let dbStart=0,dbEnd=0,dbAmount=10,dbOutput="",dbPage=1,dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);
								if(rows.length>dbAmount){dbEnd=dbAmount}else{dbEnd=rows.length}
								
								for(dbStart;dbStart<dbEnd;dbStart++){
									dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].serverName+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
								}
								
								let embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
								moderatorBot.channels.get(channel.id).send(embedMSG)
								.then(async sqliteEntries=>{
									sqliteEntries.react("⬅").then(()=>{sqliteEntries.react("➡").catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))}).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									let reactionCollector=sqliteEntries.createReactionCollector(reactionFilter,{time:60000});
									reactionCollector.on("collect",async (reaction,reactionsCollector)=>{
										await sqliteEntries.reactions.get(reaction.emoji.name).remove(commander.user);
										if(reaction.emoji.name==="⬅"){
											dbOutput="";dbPage--;if(dbPage<1){dbPage=1}dbStart=dbStart-dbAmount-dbAmount;if(dbStart<0){dbStart=0}dbEnd=dbStart+dbAmount;if(dbEnd>rows.length){dbEnd=rows.length}
											for(dbStart;dbStart<dbEnd;dbStart++){
												dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].serverName+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
											}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
											await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
										}
										else{
											dbOutput="";dbPage++;if(dbPage>=dbPages){dbPage=dbPages;}
											if(dbStart<rows.length){
												dbEnd=dbStart+dbAmount;
												if(dbEnd>rows.length){
													dbEnd=rows.length;
												}
												for(dbStart;dbStart<dbEnd;dbStart++){
													dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].serverName+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
												}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
												await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
											}
										}
									});
									reactionCollector.on("end",collected=>{
										console.info(timeStamp()+" "+cc.hlblue+" EXPIRED "+cc.reset+" Paging through DB timedOut, Message was deleted for protection/antiSpam");
										sqliteEntries.edit("Scrolling through Database has expired; the message removed for protection, "+commander,{embed:""})
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
										sqliteEntries.clearReactions().catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not clear reactions from message | "+err.message));
									});
								})
								.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							}
						})
						.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:266 | "+err.message)})
					}
					
					// FIND LIST
					if(args[1].startsWith("f")){
						const commander=member;
						const reactionFilter=(reaction,user)=>{return ["⬅","➡"].includes(reaction.emoji.name) && user.id===commander.id};
						
						sqlite.all(`SELECT * FROM inviteCodes WHERE forServer LIKE "%${ARGS[2]}%"`)
						.then(async rows=>{
							if(rows.length<1){
								slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
									'embeds': [{'color': parseColor(embedSettings.dangerColor),'description': '⛔ I couldn\'t find any invites with that server name...'
								}]};
								return SpoofNinja.send(channel,slackMSG)
							}
							else{
								let dbStart=0,dbEnd=0,dbAmount=10,dbOutput="",dbPage=1,dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);
								if(rows.length>dbAmount){dbEnd=dbAmount}else{dbEnd=rows.length}
								
								for(dbStart;dbStart<dbEnd;dbStart++){
									dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].forServer+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
								}
								
								let embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
								moderatorBot.channels.get(channel.id).send(embedMSG)
								.then(async sqliteEntries=>{
									sqliteEntries.react("⬅").then(()=>{sqliteEntries.react("➡").catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))}).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									let reactionCollector=sqliteEntries.createReactionCollector(reactionFilter,{time:60000});
									reactionCollector.on("collect",async (reaction,reactionsCollector)=>{
										await sqliteEntries.reactions.get(reaction.emoji.name).remove(commander.user);
										if(reaction.emoji.name==="⬅"){
											dbOutput="";dbPage--;if(dbPage<1){dbPage=1}dbStart=dbStart-dbAmount-dbAmount;if(dbStart<0){dbStart=0}dbEnd=dbStart+dbAmount;if(dbEnd>rows.length){dbEnd=rows.length}
											for(dbStart;dbStart<dbEnd;dbStart++){
												dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].forServer+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
											}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
											await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
										}
										else{
											dbOutput="";dbPage++;if(dbPage>=dbPages){dbPage=dbPages;}
											if(dbStart<rows.length){
												dbEnd=dbStart+dbAmount;
												if(dbEnd>rows.length){
													dbEnd=rows.length;
												}
												for(dbStart;dbStart<dbEnd;dbStart++){
													dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].forServer+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
												}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
												await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
											}
										}
									});
									reactionCollector.on("end",collected=>{
										console.info(timeStamp()+" "+cc.hlblue+" EXPIRED "+cc.reset+" Paging through DB timedOut, Message was deleted for protection/antiSpam");
										sqliteEntries.edit("Scrolling through Database has expired; the message removed for protection, "+commander,{embed:""})
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
										sqliteEntries.clearReactions().catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not clear reactions from message | "+err.message));
									});
								})
								.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							}
						})
						.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:266 | "+err.message)})
					}
					
					// CERTAIN PAGE
					if(args[1].startsWith("p")){
						const commander=member;
						const reactionFilter=(reaction,user)=>{return ["⬅","➡"].includes(reaction.emoji.name) && user.id===commander.id};
						
						sqlite.all(`SELECT * FROM inviteCodes`)
						.then(async rows=>{
							if(rows.length<1){
								slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
									'embeds': [{'color': parseColor(embedSettings.dangerColor),'description': '⛔ I don\'t have any invites...'
								}]};
								return SpoofNinja.send(channel,slackMSG)
							}
							else{
								let dbAmount=10,dbStart=args[2] * 10,dbEnd=(dbStart*1)+dbAmount,dbOutput="",dbPage=args[2],dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);
								if(dbEnd>rows.length){dbEnd=rows.length}
								
								for(dbStart;dbStart<dbEnd;dbStart++){
									if(!rows[dbStart].isSpoofing){rows[dbStart].isSpoofing="unk"}if(!rows[dbStart].checked){rows[dbStart].checked="nop"}
									dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].isSpoofing+"` ✅`"+rows[dbStart].checked+"` 🌐`"+rows[dbStart].inviteCode+"`.\n"
								}
								
								let embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
								await moderatorBot.channels.get(channel.id).send(embedMSG)
								.then(async sqliteEntries=>{
									sqliteEntries.react("⬅").then(()=>{sqliteEntries.react("➡").catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))}).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									let reactionCollector=sqliteEntries.createReactionCollector(reactionFilter,{time:60000});
									reactionCollector.on("collect",async (reaction,reactionsCollector)=>{
										await sqliteEntries.reactions.get(reaction.emoji.name).remove(commander.user);
										if(reaction.emoji.name==="⬅"){
											dbOutput="";dbPage--;if(dbPage<1){dbPage=1}dbStart=dbStart-dbAmount-dbAmount;if(dbStart<0){dbStart=0}dbEnd=dbStart+dbAmount;if(dbEnd>rows.length){dbEnd=rows.length}
											for(dbStart;dbStart<dbEnd;dbStart++){
												if(!rows[dbStart].isSpoofing){rows[dbStart].isSpoofing="unk"}if(!rows[dbStart].checked){rows[dbStart].checked="nop"}
												dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].isSpoofing+"` ✅`"+rows[dbStart].checked+"` 🌐`"+rows[dbStart].inviteCode+"`.\n"
											}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
											await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
										}
										else{
											dbOutput="";dbPage++;if(dbPage>=dbPages){dbPage=dbPages;}
											if(dbStart<rows.length){
												dbEnd=dbStart+dbAmount;
												if(dbEnd>rows.length){
													dbEnd=rows.length;
												}
												for(dbStart;dbStart<dbEnd;dbStart++){
													if(!rows[dbStart].isSpoofing){rows[dbStart].isSpoofing="unk"}if(!rows[dbStart].checked){rows[dbStart].checked="nop"}
													dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].isSpoofing+"` ✅`"+rows[dbStart].checked+"` 🌐`"+rows[dbStart].inviteCode+"`.\n"
												}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
												await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
											}
										}
									});
									reactionCollector.on("end",collected=>{
										console.info(timeStamp()+" "+cc.hlblue+" EXPIRED "+cc.reset+" Paging through DB timedOut, Message was deleted for protection/antiSpam");
										sqliteEntries.edit("Scrolling through Database has expired; the message removed for protection, "+commander,{embed:""})
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
										sqliteEntries.clearReactions().catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not clear reactions from message | "+err.message));
									});
								})
								.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							}
						})
						.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:266 | "+err.message)})
					}
					
					// DELETE
					if(args[1].startsWith("d")){
						if(Number.isInteger(parseInt(args[2]))){
							sqlite.get(`SELECT * FROM inviteCodes WHERE id="${args[2]}"`)
							.then(rows=>{
								if(!rows){
									slackMSG={
										'username': spoofNinja.name,
										'avatarURL': spoofNinja.avatar,
										'embeds': [{
											'color': parseColor(embedSettings.dangerColor),
											'description': '🚫 InviteCode ID: `'+args[2]+'` was **not found**!'
											}]
										};
									return SpoofNinja.send(channel,slackMSG)
								}
								else {
									let invCode=rows.inviteCode;
									sqlite.run(`DELETE FROM inviteCodes WHERE id="${args[2]}"`)
									.then(rows=>{
										slackMSG={
											'username': spoofNinja.name,
											'avatarURL': spoofNinja.avatar,
											'embeds': [{
												'color': parseColor(embedSettings.goodColor),
												'description': '👍 InviteCode **#'+args[2]+'**[`'+invCode+'`] has been **deleted** from DataBase!'
												}]
											};
										return SpoofNinja.send(channel,slackMSG)
									})
									.catch(err=>{
										console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:265 | "+err.message)
									})
								}
							})
						}
					}
				}
			}
			
			// CHECK
			if(args[0]==="check"){
				// CHECK ID
				if(Number.isInteger(parseInt(args[1]))){
					sqlite.get(`SELECT * FROM inviteCodes WHERE id="${args[1]}"`).then(row => {
						if(!row){
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar,
								'embeds': [{
									'color': parseColor(embedSettings.dangerColor),
									'description': '⚠ Couldn\'t find entry with that **ID** in my DataBase...'
								}]
							};
							return SpoofNinja.send(channel,slackMSG)
						}
						else{
							if(row.forServer){row.forServer=" 🌐`"+row.forServer+"`."}else{row.forServer=""}
							if(row.isSpoofing){
								row.isSpoofing=" 🤖:`"+row.isSpoofing+"`.";
							}else{row.isSpoofing=" 🤖:`?`."}
							if(row.checked){
								row.checked=" ✅:`"+row.checked+"`.";
							}else{row.checked=" ✅:`no`."}
							
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar
							};
							let msgContent="🆔`"+row.id+"` 📆`"+row.publishDate+"`"+row.isSpoofing+row.checked+row.forServer+"```md\nhttps://discord.gg/"+row.inviteCode+"```";
							return SpoofNinja.send(channel,slackMSG,msgContent)
						}
					}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:207 | "+err.message)})
				}
				
				// LAST NO ARG = DEFAULT TO 1
				if(args[1]==="last" && !args[2]){
					sqlite.get(`SELECT * FROM inviteCodes ORDER BY id DESC LIMIT 1`).then(row => {
						if(!row){
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar,
								'embeds': [{
									'color': parseColor(embedSettings.warningColor),
									'description': '⚠ Couldn\'t find anything...'
								}]
							};
							return SpoofNinja.send(channel,slackMSG)
						}
						else{
							if(row.forServer){row.forServer=" 🌐`"+row.forServer+"`."}else{row.forServer=""}
							if(row.isSpoofing){
								row.isSpoofing=" Spoofing:`"+row.isSpoofing+"`.";
							}else{row.isSpoofing=" Spoofing:`?`"}
							if(row.checked){
								row.checked=" Checked:`"+row.checked+"`.";
							}else{row.checked=" Checked:`no`."}
							
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar
							};
							let msgContent="🆔`"+row.id+"` 📆`"+row.publishDate+"`"+row.forServer+row.isSpoofing+row.checked+"```md\nhttps://discord.gg/"+row.inviteCode+"```";
							
							return SpoofNinja.send(channel,slackMSG,msgContent)
						}
					}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:207 | "+err.message)})
				}
			}
			
			// CHECKED
			if(args[0]==="checked"){
				if(Number.isInteger(parseInt(args[1]))){
					if(args[2]==="yes" || args[2]==="no"){
						if(args[2]==="no"){args[2]="nop"}
						if(args[3]){
							sqlite.get(`SELECT * FROM inviteCodes WHERE id="${args[1]}"`).then(row => {
								if(!row){
									slackMSG={
										'username': spoofNinja.name,
										'avatarURL': spoofNinja.avatar,
										'embeds': [{
											'color': parseColor(embedSettings.dangerColor),
											'description': '⚠ Couldn\'t find entry with that **ID**...'
										}]
									};
									return SpoofNinja.send(channel,slackMSG)
								}
								else{
									let dbServerName=ARGS.slice(3);dbServerName=dbServerName.join(" ");
									sqlite.run("UPDATE inviteCodes SET checked=?, isSpoofing=?, forServer=? WHERE id="+args[1],["yes", args[2], dbServerName])
									.then(()=>{
										slackMSG={
											'username': spoofNinja.name,
											'avatarURL': spoofNinja.avatar
										};
										let msgContent="✅ Updated ID: `"+args[1]+"` Spoofing:`"+args[2]+"` Server: `"+dbServerName+"`";
										return SpoofNinja.send(channel,slackMSG,msgContent)
									})
									.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" SELECT * FROM inviteCodes | "+err.message)});
								}
							}).catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" SELECT * FROM inviteCodes | "+err.message)});
						}
					}
				}
			}
			
			// COUNT
			if(args[0]==="count"){
				sqlite.all(`SELECT * FROM spoofingCodes`)
				.then(rows=>{
					if(rows.length<1){
						slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
							'embeds': [{'color': parseColor(embedSettings.dangerColor),'description': '⛔ I don\'t have any invites...'
						}]};
						return SpoofNinja.send(channel,slackMSG)
					}
					else{
						let dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);
						slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
						'embeds': [{'color': parseColor(embedSettings.goodColor),
							'description': '✅ There are **'+rows.length+'** spoofingCodes = **'+dbPages+'** pages!'
						}]};
						return SpoofNinja.send(channel,slackMSG)
					}
				})
				.catch(err=>{
					console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:266 | "+err.message)
				})
			}
			
			// STORE
			if(args[0]==="store"){
				if(args.length<2 || args.length<3){
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.dangerColor),
							'description': '```md\n'
								+config.cmdPrefix+'il store <inviteCode> <serverName>```'
						}]
					};
					return SpoofNinja.send(channel,slackMSG);
				}
				else{
					let dbServerName=ARGS.slice(2);dbServerName=dbServerName.join(" ");
					sqlite.run(`INSERT INTO spoofingCodes (serverName, inviteCode, publishDate) VALUES (?, ?, ?)`,[dbServerName, ARGS[1], timeStamp(4)])
					.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" INSERT INTO spoofingCodes table | "+err.message)});
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.goodColor),
							'description': '✅ InviteCode **successfully** stored in `spoofingCodes` **DB** 👍'
						}]
					};
					return SpoofNinja.send(channel,slackMSG);
				}
			}
			
			// FIND LIST
			if(args[0].startsWith("f")){
				const commander=member;
				const reactionFilter=(reaction,user)=>{return ["⬅","➡"].includes(reaction.emoji.name) && user.id===commander.id};
				
				sqlite.all(`SELECT * FROM spoofingCodes WHERE serverName LIKE "%${ARGS[1]}%"`)
				.then(async rows=>{
					if(rows.length<1){
						slackMSG={'username': spoofNinja.name,'avatarURL': spoofNinja.avatar,
							'embeds': [{'color': parseColor(embedSettings.dangerColor),'description': '⛔ I couldn\'t find any invites with that server name...'
						}]};
						return SpoofNinja.send(channel,slackMSG)
					}
					else{
						let dbStart=0,dbEnd=0,dbAmount=10,dbOutput="",dbPage=1,dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);
						if(rows.length>dbAmount){dbEnd=dbAmount}else{dbEnd=rows.length}
						
						for(dbStart;dbStart<dbEnd;dbStart++){
							dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].serverName+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
						}
						
						let embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
						moderatorBot.channels.get(channel.id).send(embedMSG)
						.then(async sqliteEntries=>{
							sqliteEntries.react("⬅").then(()=>{sqliteEntries.react("➡").catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))}).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							let reactionCollector=sqliteEntries.createReactionCollector(reactionFilter,{time:60000});
							reactionCollector.on("collect",async (reaction,reactionsCollector)=>{
								await sqliteEntries.reactions.get(reaction.emoji.name).remove(commander.user);
								if(reaction.emoji.name==="⬅"){
									dbOutput="";dbPage--;if(dbPage<1){dbPage=1}dbStart=dbStart-dbAmount-dbAmount;if(dbStart<0){dbStart=0}dbEnd=dbStart+dbAmount;if(dbEnd>rows.length){dbEnd=rows.length}
									for(dbStart;dbStart<dbEnd;dbStart++){
										dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].serverName+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
									}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
									await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
								}
								else{
									dbOutput="";dbPage++;if(dbPage>=dbPages){dbPage=dbPages;}
									if(dbStart<rows.length){
										dbEnd=dbStart+dbAmount;
										if(dbEnd>rows.length){
											dbEnd=rows.length;
										}
										for(dbStart;dbStart<dbEnd;dbStart++){
											dbOutput=await dbOutput+"🆔`"+rows[dbStart].id+"` 🤖`"+rows[dbStart].serverName+"` 🌐`"+rows[dbStart].inviteCode+"` 📆`"+rows[dbStart].publishDate+"`\n"
										}embedMSG=await {'embed':{'color': parseColor(embedSettings.goodColor),'title': 'ℹ [PG:'+dbPage+'/'+dbPages+'] InviteCodes DataBase ℹ','description': dbOutput.slice(0,-1)}};
										await sqliteEntries.edit(embedMSG).catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
									}
								}
							});
							reactionCollector.on("end",collected=>{
								console.info(timeStamp()+" "+cc.hlblue+" EXPIRED "+cc.reset+" Paging through DB timedOut, Message was deleted for protection/antiSpam");
								sqliteEntries.edit("Scrolling through Database has expired; the message removed for protection, "+commander,{embed:""})
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not edit message | "+err.message));
								sqliteEntries.clearReactions().catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not clear reactions from message | "+err.message));
							});
						})
						.catch(err=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
					}
				})
				.catch(err=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:266 | "+err.message)})
			}
			
			// DELETE
			if(args[0].startsWith("del")){
				if(Number.isInteger(parseInt(args[1]))){
					sqlite.get(`SELECT * FROM spoofingCodes WHERE id="${args[1]}"`)
					.then(rows=>{
						if(!rows){
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar,
								'embeds': [{
									'color': parseColor(embedSettings.dangerColor),
									'description': '🚫 InviteCode ID: `'+args[1]+'` was **not found**!'
									}]
								};
							return SpoofNinja.send(channel,slackMSG)
						}
						else {
							let invCode=rows.inviteCode;
							sqlite.run(`DELETE FROM spoofingCodes WHERE id="${args[1]}"`)
							.then(rows=>{
								slackMSG={
									'username': spoofNinja.name,
									'avatarURL': spoofNinja.avatar,
									'embeds': [{
										'color': parseColor(embedSettings.goodColor),
										'description': '👍 InviteCode **#'+args[1]+'**[`'+invCode+'`] has been **deleted** from DataBase!'
										}]
									};
								return SpoofNinja.send(channel,slackMSG)
							})
							.catch(err=>{
								console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" L:265 | "+err.message)
							})
						}
					})
				}
			}
		}
	}
});

// BOT LOGIN TO DISCORD
bot.login(spoofNinja.token);
moderatorBot.login(config.moderatorBot.token);

// BOT DISCONNECTED
bot.on('disconnected', function (){
	console.info(timeStamp()+' -- SPOOFNINJA HAS DISCONNECTED --')
});
