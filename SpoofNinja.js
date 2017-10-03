const Discord=require('discord.js');
const bot=new Discord.Client();
const fs=require('fs');
const config=require('./files/config.json');
const servers=require('./files/servers.json'); 



// GRAB THE SPOOFING SERVERS FROM JSON AND REFORMAT IT
spoofServers=servers.servers; myServer=config.myServer;

// GRAB WEBHOOK FROM CONFIG.JSON AND REFORMAT IT
let webhook=config.webhook; webhook=webhook.split("webhooks"); webhook=webhook[1]; webhook=webhook.split("/");
	webhookID=webhook[1]; webhookToken=webhook[2]; 
// DIRECT CALL TO THE WEBHOOK
const WHchan=new Discord.WebhookClient(webhookID,webhookToken);



bot.on('ready', () => {
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	let timeStampSys="["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"] ";
	
	console.info('-- DISCORD SpoofNinjaBOT IS READY --');console.log(console.error);
	console.info(timeStampSys+"Loaded "+spoofServers.length+" Spoofing Servers");
	
	// SET BOT AS INVISIBLE = NINJA <(^.^<) 
	bot.user.setPresence({"status":"invisible"});
});



//
//				DEFINE GLOBAL AND COMMON VARIABLES
//
var serverCount, noobFound, serverFound, noobJoined, ownServer, slackmsg, daServers, myServerFound;



//
//				FUNCTION: CHECK USER "ONJOIN" USING JSON FILE - VIA VARIABLE/FUNCTION
//
function checkUser(userID){
	serverCount="";noobFound="";serverFound="";
	
	// CHECK ALL SERVERS FROM SERVERLIST
	for(serverCount="0"; serverCount < spoofServers.length; serverCount++){
		
		// CHECK IF I'M IN EACH SERVER FIRST
		noobFound=bot.guilds.get(spoofServers[serverCount].server);
		
		// I'M IN THE SERVER NOW LOOK FOR THE NOOB
		if(noobFound){
			noobFound=bot.guilds.get(spoofServers[serverCount].server).members.get(userID);
			
			// I FOUND NOOB, NOW I CAN ADD THE SERVER TO THE LIST
			if(noobFound){
				serverFound += spoofServers[serverCount].name+",";
			}
		}
		
		// I'M NOT IN THE ONE OF THE SERVERS
		else {
			console.info("[WARNING] I am not in server: "+spoofServers[serverCount].name+" | Please join using invite code: "+spoofServers[serverCount].invite);
		}
	}
	
	// CHECK PERSONAL SERVER IN CASE USER JOINS SPOOF SERVER AFTER JOINING MY SERVER
	noobFound=""; noobFound=bot.guilds.get(myServer.server).members.get(userID);
	if(noobFound){ serverFound += myServer.name+","; }
	
	// SEND DATA BACK TO VARIABLE
	return serverFound;
}



//
//				FUNCTION: JOINED SERVER USING JSON FILES
//
function checkJoined(serverID){
	serverCount="";noobJoined="";serverFound="";ownServer=config.myServer.server;
	
	// CHECK IF SERVER JOINED IS MY SERVER
	if(serverID===ownServer){
		noobJoined=config.myServer.name;
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
	
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	let timeStamp="`"+yr+"/"+mo+"/"+da+"` **@** `"+hr+":"+min+":"+sec+"`";let timeStampSys="["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"] ";

	let guild=member.guild; myServerFound="no";
	
	// USERNAMES REPLACE SPACE WITH UNDERLINE
	let user=member.user; let userNoSpace=user.username; 
		nuser=userNoSpace.split(" "); for(var xn="0";xn < nuser.length; xn++){ userNoSpace=userNoSpace.replace(" ","_"); }
	
	// CHECK IF USER IS IN A SPOOFING SERVER
	let spoofServersFound=checkUser(user.id);
	
	// CHECK JOINED SERVER AND SCAN OTHER SERVERS
	let serverJoined=checkJoined(guild.id); 
	
	// REMOVE JOINED SERVER FROM OTHER SERVERS
	spoofServersFound=spoofServersFound.replace(serverJoined+",","");
	
	//
	//				IF USER IS NOT FOUND IN ANOTHER CHANNEL IGNORE
	//
	if(!spoofServersFound || spoofServersFound===""){
		// console.info(timeStampSys+"User: "+userNoSpace+" has joined Server: "+serverJoined);
		
		//
		//				SLACK TEMPLATE NO THUMBNAIL - LEVEL 1 - SINGLE SERVER FOR TEST CHANNEL
		//
		slackmsg={
			'username': config.botName,
			'attachments': [{
				'color': config.warningColor,
				'text': '**' + userNoSpace + '** has joined: **' + serverJoined + '**\n**UserTag**: ' + user + '\n**On**: ' + timeStamp
			}]
		};
	}
	
	
	
	//
	//				IF USER IS IN ANOTHER SPOOFER CHANNEL, ADD LINE: "OTHER CHANNELS: " WITH GATHERED CHANNELS
	//
	else{
		if(serverJoined===config.myServer.name){
			myServerFound="yes";
		}
		spoofServersFound=spoofServersFound.split(","); daServers="";
				
		for(var serv="0"; serv < spoofServersFound.length; serv++){
			
			// CHECK IF HE JOINED A SPOOF SERVER WHILE BEING IN MY SERVER
			if(spoofServersFound[serv]===config.myServer.name){
				myServerFound="yes"; spoofServersFound[serv]="**"+spoofServersFound[serv]+"**";
			}
			
			// ADD EACH SERVER FOUND AND SEPARATE BY COMMA
			daServers += spoofServersFound[serv]+", ";
			
		}
		
		// ADD "OTHER SERVERS" + SERVERS
		daServers="\n**Other Servers**: "+daServers.slice(0,-4);
		
		//
		//				SLACK TEMPLATE NO THUMBNAIL - LEVEL 2 - MULTIPLE SERVERS FOR TEST CHANNEL
		//
		slackmsg={
			'username': config.botName,
			'attachments': [{
				'color': config.dangerColor,
				'text': '**' + userNoSpace + '** has joined: **' + serverJoined + '**\n**UserTag**: ' + user + daServers + '\n**On**: ' + timeStamp
			}]
		};
	}
	
	// PREVENT BLANK POSTING OR FAKE NOTIFICATION GLITCH
	if(!serverJoined){ return }
	
	consoleInfo=timeStampSys+"User: "+userNoSpace+" has joined Server: "+serverJoined+" || other Servers: "+spoofServersFound;
	
	if(spoofServersFound && myServerFound==="no"){ console.info(consoleInfo) }
	
	
	//
	//				POSTING TO MODLOG CHANNELS
	//
	if(myServerFound==="yes"){
		//
		//				SLACK TEMPLATE WITH THUMBNAIL - LEVEL 3 - MULTIPLE SERVERS PLUS MY SERVER
		//
		slackmsg={
			'username': config.botName,
			'attachments': [{
				'color': config.dangerColor,
				'thumb_url': config.snipeImg,
				'text': '⚠ __**WARNING**__ ⚠\n**'
					+ userNoSpace + '** has joined: **' + serverJoined + '**\n**UserTag**: ' + user + daServers + '\n**On**: ' + timeStamp
			}]
		};
		
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		console.log(consoleInfo);
		return WHchan.sendSlackMessage(slackmsg).catch(console.error);
	}
	
	// FOR TESTING - POST "EVERY" JOIN FROM EVERY SERVER TO MY CHANNEL
	// WHchan.sendSlackMessage(slackmsg).catch(console.error);
});



// ##########################################################################
// ############################## TEXT COMMANDS #############################
// ##########################################################################
bot.on('message', message => { 
	
	// TIME AND DATE FOR TIMESTAMP IN LOGS - COMMANDLINE AND DISCORD MODLOG
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	let timeStamp="`"+yr+"/"+mo+"/"+da+"` **@** `"+hr+":"+min+":"+sec+"`";let timeStampSys="["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"] ";
	
	// IGNORE MESSAGES FROM CHANNELS THAT ARE NOT CMDCHANID AKA COMMAND CHANNEL ID AKA MODLOG
	if(message.channel.id===config.cmdChanID){
	
		// IGNORE REGULAR CHAT
		if(!message.content.startsWith(config.prefix)){ return }
		
		// DEFINE SHORTER DISCORD PROPERTIES
		let g=message.guild; let c=message.channel; let m=message.member;let msg=message.content;
		let command=msg.toLowerCase(); command=command.split(" ")[0]; command=command.slice(1);
		args=msg.split(" ").slice(1);
		
		// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
		let adminRole=g.roles.find("name", config.adminRoleName); if(!adminRole){adminRole=""}
		let modRole=g.roles.find("name", config.modRoleName); if(!modRole){modRole=""}
		
		
		// COMMAND: !CHECK
		if(command=="check"){
			var u2c=""; var u2cn="";
			
			// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
			let mentioned=""; if(message.mentions.users.first()){ mentioned=message.mentions.users.first(); }
			
			// MENTIONED PERSONW AS FOUND IN MY SERVER - GRAB THEIR USER ID AND USERNAME
			if(mentioned){ u2cn=mentioned.username; u2c=mentioned.id } 
			
			// IF USER ID WAS PROVIDED INSTEAD OF @MENTIONED
			if(Number.isInteger(parseInt(args[0]))){ 
				u2cn=g.members.get(args[0]); 
				if(u2cn){ u2cn=g.members.get(args[0]).user.username; }
				else{ u2cn="<not_on_server>"; } u2c=args[0]
			}
			
			// PERSON USING COMMAND IS AUTHORIZED - PERSON HAS ROLE FROM CONFIG.JSON OR IS BOT-OWNER
			if(m.roles.has(adminRole.id) || m.roles.has(modRole.id) || m.user.id===config.ownerID){
				if(u2c){
					
					// CHECK FOR THE PERSON USING SPOOFING SERVERS LIST
					let spoofServersFound=checkUser(u2c);
						// REMOVE MY SERVER NAME FROM FINDINGS - SO ALERT DOESNT GET TRIGGERED
						spoofServersFound=spoofServersFound.replace(config.myServer.name+",","");
					
					// USER WAS NOT FOUND IN ANY SPOOFING SERVER
					if(!spoofServersFound || spoofServersFound===""){
						//
						//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
						//
						slackmsg={
							'username': config.botName,
							'attachments': [{
								'color': config.goodColor,
								'text': '✅ **'+u2cn+'** \nappears to be a __honorable__\n **Pokemon Go Trainer**'
							}]
						};
					}
					
					// USER WAS FOUND IN A SPOOFING SERVER
					else{
						// CONVERT FINDINGS INTO ARRAY IN ORDER TO ADD COMMA AND SPACING IN-BETWEEN
						spoofServersFound=spoofServersFound.split(","); daServers="";
						for(var serv=0;serv<spoofServersFound.length;serv++){
							daServers += spoofServersFound[serv]+", ";
						}
						daServers=daServers.slice(0,-4);
						
						//
						//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
						//
						slackmsg={
							'username': config.botName,
							'attachments': [{
								'color': config.warningColor,
								'thumb_url': config.snipeImg,
								'text': '⚠ __**WARNING**__ ⚠\n**User**: '+u2cn+'\nwas **found** in servers: \n' + daServers
							}]
						};
					}
					
					// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
					return WHchan.sendSlackMessage(slackmsg).catch(console.error);
				}
				
				// MENTIONED IS INCORRECT FORMAT - NO A VALID @MENTION OR USER_ID
				else {
					slackmsg={
						'username': config.botName,
						'attachments': [{
							'color': config.goodColor,
							'text': 'Please `@mention` a person you want me to `!check`, you can use `@user_tag` or `user_id_number`'
						}]
					};
					
					// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
					return WHchan.sendSlackMessage(slackmsg).catch(console.error);
				}
			}
			
			// USER IS NOT ALLOWED TO USE THIS COMMAND - DOES NOT HAVE THE REQUIRED ROLE OR NOT THE BOT-OWNER
			else {
				slackmsg={
					'username': config.botName,
					'attachments': [{
						'color': config.dangerColor,
						'text': '⚠ You are **NOT** __ALLOWED__ to use this command!'
					}]
				};
				
				// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
				return WHchan.sendSlackMessage(slackmsg).catch(console.error);
			}
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
