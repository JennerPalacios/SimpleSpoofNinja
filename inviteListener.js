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
const config=require('./files/config.json');
const servers=require('./files/servers.json'); 

const sql = require("sqlite");
sql.open("./files/invites.sqlite");

// GRAB THE SPOOFING SERVERS FROM JSON AND REFORMAT IT
const spoofServers=servers.servers, myServer=config.myServer, spoofNinja=config.spoofNinja, embedSettings=config.embedSettings;

// GRAB WEBHOOK FROM CONFIG.JSON AND REFORMAT IT
let webhook=myServer.webhook; webhook=webhook.split("webhooks"); webhook=webhook[1]; webhook=webhook.split("/");
	webhookID=webhook[1]; webhookToken=webhook[2]; 
// DIRECT CALL TO THE WEBHOOK
const WHchan=new Discord.WebhookClient(webhookID,webhookToken);



//
//				DEFINE GLOBAL AND COMMON VARIABLES
//
var serverCount, serverName, slackMSG, cc={"reset": "\x1b[0m","black": "\x1b[30m","red": "\x1b[31m","green": "\x1b[32m","yellow": "\x1b[33m","blue": "\x1b[34m",
	"magenta": "\x1b[35m","cyan": "\x1b[36m","white": "\x1b[37m","bgblack": "\x1b[40m","bgred": "\x1b[41m","bggreen": "\x1b[42m",
	"bgyellow": "\x1b[43m","bgblue": "\x1b[44m","bgmagenta": "\x1b[45m","bgcyan": "\x1b[46m","bgwhite": "\x1b[47m"};


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
	if(type===4) {
		// YYYY/MM/DD @ HH:MM:SS
		return yr+"/"+mo+"/"+da;
	}
}


// START SCRIPT
bot.on('ready', () => {
	// SET BOT AS INVISIBLE = NINJA <(^.^<)
	bot.user.setPresence({"status":"invisible"});
	
	console.info(timeStamp()+" -- DISCORD SpoofNinja, "+cc.magenta+"inviteListener"+cc.reset+" module, IS "+cc.green+"READY"+cc.reset+" --");
	console.info(timeStamp()+" I am scanning "+cc.cyan+spoofServers.length+cc.reset+" Spoofing Servers for "+cc.green+"NEW"+cc.reset+" invitecodes being shared");
	
	slackMSG={
		'username': spoofNinja.name,
		'avatarURL': spoofNinja.avatar,
		'embeds': [{
			'color': parseColor(embedSettings.goodColor),
			'description': 'I am scanning for **NEW** inviteCodes being shared in **spoOfing** servers'
		}]
	};
	WHchan.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:110 | "+err.message)});
	
	sql.run("CREATE TABLE IF NOT EXISTS inviteCodes ("
		+"id INTEGER PRIMARY KEY AUTOINCREMENT, "
		+"serverName TEXT, "
		+"serverID TEXT, "
		+"inviteCode TEXT, "
		+"publishDate TEXT, "
		+"forServer TEXT, "
		+"isSpoofing TEXT, "
		+"checked TEXT"
		+")").catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:26 | "+err.message)});
});



// ##########################################################################
// ############################## TEXT COMMANDS #############################
// ##########################################################################
bot.on('message', message => {
	
	if(!message.member){ return }
	if(!message.member.user){ return }
	if(message.member.user.bot){ return }
	if(!message.member.user.username){ return }
	if(!message.content){ return }
	
	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, msg=message.content;
	
// ############################## INVITE LISTENER ##############################
	let invLinks=message.content.match(/discord.gg/g);
	if(invLinks){
		if(message.channel.id!==config.myServer.cmdChanID){
			let servName="";
			if(!message.guild){ return }
			servName=getServName(message.guild.id);if(!servName){servName=config.myServer.name}
			invPos=message.content.indexOf("discord.gg");invStart=invPos+11; invEnd=invPos+18;
			let invCode=message.content.slice(invStart,invEnd);
			
			//\n**In Server**: '+servName+'\n**Invite Code**: '+invCode+'\n`https://discord.gg/'+invCode+'`
			// sql.run("CREATE TABLE IF NOT EXISTS inviteCodes (serverName TEXT, serverID TEXT, inviteCode TEXT, publishDate TEXT)").catch(console.error);
			
			sql.get(`SELECT * FROM inviteCodes WHERE inviteCode="${invCode}"`).then(row => {
				if (!row) {
					sql.run("INSERT INTO inviteCodes (serverName, serverID, inviteCode, publishDate) VALUES (?, ?, ?, ?)",
						[servName, message.guild.id, invCode, timeStamp(4)]);
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.goodColor),
							'description': '✅ A **new** inviteCode was stored in my **DB** 👍'
						}]
					};
					return WHchan.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:154 | "+err.message)});
				}
			}).catch(console.error);
		}
	}
	
	
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT CMDCHANIDS
	if(!myServer.cmdChanIDs.includes(channel.id)){ return }
	
	// IGNORE REGULAR CHAT
	if(!message.content.startsWith(config.cmdPrefix)){ return }
	
	// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
	let adminRole=guild.roles.find(role => role.name === myServer.adminRoleName);
		if(!adminRole){adminRole={"id":"111111111111111111"};console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.magenta+myServer.adminRoleName+cc.reset)}
	let modRole=guild.roles.find(role => role.name === myServer.modRoleName);
		if(!modRole){modRole={"id":"111111111111111111"};console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" [CONFIG] I could not find role: "+cc.magenta+myServer.modRoleName+cc.reset)}
	
	// GRAB COMMANDS AND ARGUMENTS
	let command=msg.toLowerCase(), args=msg.toLowerCase().split(/ +/).slice(1); command=command.split(/ +/)[0]; command=command.slice(config.cmdPrefix.length);
	
	if(member.roles.has(adminRole.id) || member.roles.has(modRole.id) || member.user.id===config.ownerID){
		if(command==="il"){
			let validArgs="no";
			if(args.length>0){
				if(args[0]==="count"){validArgs="yes"}
				if(args[0]==="check"){
					if(!args[1]){validArgs="yes"}
					if(args[1]){
						if(Number.isInteger(parseInt(args[1]))){validArgs="yes"}
						if(args[1]==="last"){
							if(!args[2]){validArgs="yes"}
							if(Number.isInteger(parseInt(args[2]))){validArgs="yes"}
						}
					}
				}
				if(args[0]==="checked"){
					if(Number.isInteger(parseInt(args[1]))){validArgs="yes"}
				}
				if(args[0]==="del"){
					if(args[1] && Number.isInteger(parseInt(args[1]))){validArgs="yes"}
					if(args[1] && args[1].startsWith("id:")){validArgs="yes"}
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
							+config.cmdPrefix+'il count\n'
							+config.cmdPrefix+'il check\n'
							+config.cmdPrefix+'il check <id>\n'
							+config.cmdPrefix+'il check last [amount]\n'
							+config.cmdPrefix+'il checked <id>\n'
							+config.cmdPrefix+'il del <code>\n'
							+config.cmdPrefix+'il del id:<id>```'
					}]
				};
				return WHchan.send(slackMSG).catch(err=>{
					console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:217 | "+err.message)
				})
			}
			
			// COUNT
			if(args[0]==="count"){
				sql.all(`SELECT * FROM inviteCodes`)
				.then(rows => {
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.goodColor),
							'description': '✅ There are **'+rows.length+'** `unique` inviteCodes stored in my DataBase!'
							}]
						};
					return WHchan.send(slackMSG).catch(err=>{
						console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:234 | "+err.message)
					})
				})
				.catch(err=>{
					console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:238 | "+err.message)
				})
			}
			
			// CHECK
			if(args[0]==="check"){
				
				// NO ARGS
				if(!args[1]){
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.goodColor),
							'title': 'ℹ WORK IN PROGRESS ℹ',
							'description': '```md\n'
								+config.cmdPrefix+'This page will display 10 DB entries at a time, able to scroll through pages using emoji/reactions```'
						}]
					};
					return WHchan.send(slackMSG).catch(err=>{
						console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:258 | "+err.message)
					})
				}
				
				// CHECK ID
				if(Number.isInteger(parseInt(args[1]))){
					sql.get(`SELECT * FROM inviteCodes WHERE id="${args[1]}"`).then(row => {
						if(!row){
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar,
								'embeds': [{
									'color': parseColor(embedSettings.dangerColor),
									'description': '⚠ Couldn\'t find entry with that **ID**...'
								}]
							};
							return WHchan.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:154 | "+err.message)});
						}
						else{
							if(row.forServer){row.forServer=" 🌐`"+row.forServer+"`"}else{row.forServer=""}
							if(row.isSpoofing){
								row.isSpoofing=" Spoofing:`"+row.isSpoofing+"`";
							}else{row.isSpoofing=" Spoofing:`?`"}
							if(row.checked){
								row.checked=" Checked:`"+row.checked+"`.";
							}else{row.checked=" Checked:`no`."}
							
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar
							};
							let msgContent="🗄`"+row.id+"` 📆`"+row.publishDate+"`"+row.forServer+row.isSpoofing+row.checked+"```md\nhttps://discord.gg/"+row.inviteCode+"```";
							
							return WHchan.send(msgContent ,slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:154 | "+err.message)});
						}
					}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:207 | "+err.message)})
				}
				
				// LAST NO ARG = DEFAULT TO 1
				if(args[1]==="last" && !args[2]){
					sql.get(`SELECT * FROM inviteCodes ORDER BY id DESC LIMIT 1`).then(row => {
						if(!row){
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar,
								'embeds': [{
									'color': parseColor(embedSettings.warningColor),
									'description': '⚠ Couldn\'t find anything...'
								}]
							};
							return WHchan.send(slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:154 | "+err.message)});
						}
						else{
							if(row.forServer){row.forServer=" 🌐`"+row.forServer+"`"}else{row.forServer=""}
							if(row.isSpoofing){
								row.isSpoofing=" Spoofing:`"+row.isSpoofing+"`";
							}else{row.isSpoofing=" Spoofing:`?`"}
							if(row.checked){
								row.checked=" Checked:`"+row.checked+"`.";
							}else{row.checked=" Checked:`no`."}
							
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar
							};
							let msgContent="🗄`"+row.id+"` 📆`"+row.publishDate+"`"+row.forServer+row.isSpoofing+row.checked+"```md\nhttps://discord.gg/"+row.inviteCode+"```";
							
							return WHchan.send(msgContent ,slackMSG).catch(err=>{console.info(timeStamp()+" "+cc.bgred+cc.white+" ERROR "+cc.reset+" L:154 | "+err.message)});
						}
					}).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:207 | "+err.message)})
				}
				
				// LAST WITH ARG
				if(args[1]==="last" && Number.isInteger(parseInt(args[2]))){
					return
				}
			}
			
			// CHECKED
			if(args[0]==="checked"){
				
				// CHECK SINGLE ENTRY
				if(Number.isInteger(parseInt(args[1]))){
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.goodColor),
							'title': 'ℹ WORK IN PROGRESS ℹ',
							'description': '```md\n'
								+config.cmdPrefix+'il checked <'+args[1]+'>```'
						}]
					};
					return WHchan.send(slackMSG).catch(err=>{
						console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:207 | "+err.message)
					})
				}
			}
			
			// DELETE
			if(args[0]==="del"){
				if(args[1].startsWith("id:")){
					args[1]=args[1].slice(3);
					slackMSG={
						'username': spoofNinja.name,
						'avatarURL': spoofNinja.avatar,
						'embeds': [{
							'color': parseColor(embedSettings.goodColor),
							'title': 'ℹ WORK IN PROGRESS ℹ',
							'description': '```md\n'
								+config.cmdPrefix+'il del <'+args[1]+'>```'
						}]
					};
					return WHchan.send(slackMSG).catch(err=>{
						console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:207 | "+err.message)
					})
				}
				else{
					sql.get(`SELECT * FROM inviteCodes WHERE inviteCode="${args[1]}"`)
					.then(rows=>{
						if(!rows){
							slackMSG={
								'username': spoofNinja.name,
								'avatarURL': spoofNinja.avatar,
								'embeds': [{
									'color': parseColor(embedSettings.dangerColor),
									'description': '🚫 InviteCode: `'+args[1]+'` was **not found** in database!'
									}]
								};
							return WHchan.send(slackMSG).catch(err=>{
								console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:246 | "+err.message)
							})
						}
						else {
							sql.run(`DELETE FROM inviteCodes WHERE inviteCode="${args[1]}"`)
							.then(rows=>{
								slackMSG={
									'username': spoofNinja.name,
									'avatarURL': spoofNinja.avatar,
									'embeds': [{
										'color': parseColor(embedSettings.goodColor),
										'description': '👍 InviteCode: `'+args[1]+'` has been **deleted** from database!'
										}]
									};
								return WHchan.send(slackMSG).catch(err=>{
									console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:261 | "+err.message)
								})
							})
							.catch(err=>{
								console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:265 | "+err.message)
							})
						}
					})
				}
			}
		}
		
		
		
		// RESTART THIS MODULE
		if(command==="restart" && m.id===config.ownerID && args[0]==="il"){
			slackMSG={
				'username': spoofNinja.name,
				'avatarURL': spoofNinja.avatar,
				'embeds': [{
					'color': parseColor(embedSettings.goodColor),
					'description': '♻ Restarting `spoOfNinja`\'s **Invite Listener**\n » please wait `3` to `5` seconds...'
					}]
				};
			WHchan.send(slackMSG).then(()=>{ process.exit(1) }).catch(err=>{console.info(timeStamp()+" "+cc.white+cc.bgred+" ERROR "+cc.reset+" L:313 | "+err.message)})
		}
	}
});

// BOT LOGIN TO DISCORD
bot.login(spoofNinja.token);

// BOT DISCONNECTED
bot.on('disconnected', function (){
	console.info(timeStamp()+' -- SPOOFNINJA HAS DISCONNECTED --')
});
