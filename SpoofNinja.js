const Discord=require('discord.js');
const bot=new Discord.Client({fetchAllMembers: true});
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


// START SCRIPT
bot.on('ready', () => {
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	let timeStampSys="["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"] ";
	
	console.info('-- DISCORD SpoofNinjaBOT IS READY --');
	
	console.info(timeStampSys+"Loaded "+spoofServers.length+" Spoofing Servers");
	
	if(config.shareInfo==="no"){console.info('[PLEASE NOTE]:\n'
		+'You should consider sharing your "webhook" in order to:\n'
		+'» Get notifications from JennerPalacios about updates for:\n'
		+'-- SpoofNinja.js, servers.json, and/or config.json\n'
		+'» Help JennerPalacios keep track of downloads\n'
		+'-- keep count of the people involved in the fight against SPOOFERS');
	}
	
	// SET BOT AS INVISIBLE = NINJA <(^.^<) 
	bot.user.setPresence({"status":"invisible"});
});



//
//				DEFINE GLOBAL AND COMMON VARIABLES
//
var serverCount, noobFound, serverFound, noobJoined, ownServer, slackmsg, daServers, myServerFound;



//
//				CHECK CONFIG FOR RIGHT INFO INPUT BY USER
//
if(!Number.isInteger(parseInt(config.botID))){ return console.info(".\n[ERROR] config.json » \"botID\" » wrong format, it needs to be numbers\n."); }
if(!Number.isInteger(parseInt(config.ownerID))){ return console.info(".\n[ERROR] config.json » \"ownerID\" » wrong format, it needs to be numbers\n."); }
if(!Number.isInteger(parseInt(config.myServer.server))){ return console.info(".\n[ERROR] config.json » myServer » \"server\" » wrong format, it needs to be numbers\n."); }
if(!Number.isInteger(parseInt(config.cmdChanID))){ return console.info(".\n[ERROR] config.json » \"cmdChanID\" » wrong format, it needs to be numbers\n."); }



//
//				SHARED WEBHOOK, TO KEEP TRACK HOW MANY PEOPLE USE THIS TOOL, FEEDBACK AND REQUESTS
//									TURN IT OFF IN CONFIG » "shareInfo"
//
const sharedWH=new Discord.WebhookClient("365806668119932928","xe5pRZUvE8ADXDBpNESBsfK7RXT9UmQVOzxaJTjwkj3nmo2IBJEbPlCCl0LJ3Ope77Fo");
const whCollector=new Discord.WebhookClient("365826527822348290","Z0HAX79QHpNDkyK1hF_FVM5o0LcZ1-tFhoK1o2-HlWA6Ogk9P3MyA2vuGMm_Umyso-oA");
	let sct=new Date(); let smo=sct.getMonth()+1;if(smo<10){smo="0"+smo;}let da=sct.getDate();if(da<10){da="0"+da;}let syr=sct.getFullYear();
	let shr=sct.getHours();if(shr<10){shr="0"+shr;}let smin=sct.getMinutes();if(smin<10){smin="0"+smin;}let ssec=sct.getSeconds();if(ssec<10){ssec="0"+ssec;}
	let wht="["+syr+"/"+smo+"/"+da+" @ "+shr+":"+smin+":"+ssec+"] ";sharedWH.send(wht+"Gratz! **"+config.myServer.name+"** started using **SpoofNinja**").catch(console.error);
//
//				CHECK IF INFO/WEBHOOK IS BEING SHARED
//
if(config.shareInfo==="yes"){
	sharedWH.send(wht+"Yay! **"+config.myServer.name+"** has joined the fight, **SHARED** their info and wants to stay up-to-date <(^.^<)... Awesome! we have received their info <(^.^)>")
	whCollector.send(".\n"+wht+"**"+config.myServer.name+"** would like to get **UPDATES**!\n"
		+" » Their Owner: <@"+config.ownerID+"> \n » Their WH ID:`"+webhookID+"`\n » Their WH Token: `"+webhookToken+"`\n.");
}


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
		
		// I'M NOT IN ONE OF THE SERVERS
		else {
			console.info("[WARNING] I am not in server: "+spoofServers[serverCount].name
				+" | Please join using invite code: "+spoofServers[serverCount].invite+"..."
				+" or remove line from servers.json and wait for github update");
		}
	}
	
	// CHECK PERSONAL SERVER IN CASE USER JOINS SPOOF SERVER AFTER JOINING MY SERVER
	noobFound=""; noobFound=bot.guilds.get(myServer.server);
	if(noobFound){ 
		noobFound=bot.guilds.get(myServer.server).members.get(userID);
		if(noobFound){ serverFound += myServer.name+","; }
	}
	else {
		console.info(".\n[WARNING] I am not in your server yet, SILLY YOU! ["+myServer.name+"]\n...Log into DummyAccount and join YOUR SERVER!\n.");
	}
	
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
	//				IF USER IS NOT FOUND IN ANOTHER CHANNEL IGNORE - SINGLE JOIN FOR TEST
	//
	if(!spoofServersFound || spoofServersFound===""){
		if(config.logAll==="yes"){
			console.info("[CONFIG_LOG_ALL] User: "+userNoSpace+" has joined Server: "+serverJoined)
		}
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
		
		// ADD "OTHER SERVERS"+SERVERS
		daServers="\n**Other Servers**: "+daServers.slice(0,-4);
	}
	
	// PREVENT BLANK POSTING OR FAKE NOTIFICATION GLITCH
	if(!serverJoined){ return }
	
	if(spoofServersFound && myServerFound==="no"){ 
		if(config.logAll==="yes"){ return console.info("[CONFIG_LOG_ALL] User: "+userNoSpace+" has joined Server: "+serverJoined+" || other Servers: "+spoofServersFound); }
	}
	
	
	//
	//				POSTING TO MODLOG CHANNELS
	//
	if(myServerFound==="yes"){
		//
		//				SLACK TEMPLATE WITH THUMBNAIL - LEVEL 3 - MULTIPLE SERVERS PLUS MY SERVER
		//
		let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
		slackmsg={
			'username': config.botName,
			'attachments': [{
				'color': config.dangerColor,
				'thumb_url': config.snipeImg,
				'text': '⚠ __**WARNING**__ ⚠\n**'
					+ userNoSpace+'** has joined: **'+serverJoined+'**\n**UserTag**: '+user+daServers+'\n**On**: '+timeStamp
			}]
		};
		
		// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
		console.log(timeStampSys+"User: "+userNoSpace+" has joined Server: "+serverJoined+" || other Servers: "+spoofServersFound);
		return WHchan.send(slackmsg).catch(console.error);
	}
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
		
		if(config.logAll==="yes"){ console.info("[CONFIG_LOG_ALL] Command typed in CommandChannel (config.json » cmdChanID)"); }
		
		// DEFINE SHORTER DISCORD PROPERTIES
		let g=message.guild; let c=message.channel; let m=message.member;let msg=message.content;
		let command=msg.toLowerCase(); command=command.split(" ")[0]; command=command.slice(1);
		args=msg.split(" ").slice(1);
		
		// ROLES TO LISTEN TO - ACCESS TO THE COMMAND - CONFIGURE IN CONFIG.JSON
		let adminRole=g.roles.find("name", config.adminRoleName); if(!adminRole){adminRole=""}
		let modRole=g.roles.find("name", config.modRoleName); if(!modRole){modRole=""}
		
		
		
		// COMMAND: !HELP
		if(command=="help" || command=="commands"){
			if(m.roles.has(adminRole.id) || m.roles.has(modRole.id) || m.user.id===config.ownerID){
				let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
				if(!args[0]){
					slackmsg={
						'username': config.botName,
						'avatarURL': config.botAvatar,
						'embeds': [{
							'color': parseInt(daColor),
							'description': '**--- AVAILABLE COMMANDS ---**\n'
								+'`!check @mention/user_id`\n'
								+'`!check server`\n'
								+'`!suggest` and `!feedback`\n'
								+'type: `'+command+' <command>` for more info'
						}]
					};
				return WHchan.send(slackmsg).catch(console.error);
				}
				if(args[0]==="check"){
					slackmsg={
						'username': config.botName,
						'avatarURL': config.botAvatar,
						'embeds': [{
							'color': parseInt(daColor),
							'description': '`!check @mention/user_id` » for checking user, ie:\n'
											+' `!check @JennerPalacios` or\n'
											+' `!check 237597448032354304`\n'
						}]
					};
				return WHchan.send(slackmsg).catch(console.error);
				}
				if(args[0]==="feedback"){
					slackmsg={
						'username': config.botName,
						'avatarURL': config.botAvatar,
						'embeds': [{
							'color': parseInt(daColor),
							'description': '`!feedback` » for providing feedback\n'
											+' provide feedback to JennerPalacios, ie:\n'
											+' `!feedback Love it! great job you noOb!`'
						}]
					};
				return WHchan.send(slackmsg).catch(console.error);
				}
				if(args[0]==="suggest"){
					slackmsg={
						'username': config.botName,
						'avatarURL': config.botAvatar,
						'embeds': [{
							'color': parseInt(daColor),
							'description': '`!suggest` » for suggesting a new feature\n'
											+' got cool ideas? Im here to listen, ie:\n'
											+' `!suggest A way to order pizza`\n'
						}]
					};
				return WHchan.send(slackmsg).catch(console.error);
				}
			}
		}
		
		
		
		// COMMAND: !HELP
		if(command=="suggest" || command=="feedback"){
			if(m.roles.has(adminRole.id) || m.roles.has(modRole.id) || m.user.id===config.ownerID){
				let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
				if(command=="suggest"){
					slackmsg={'username': 'JennerPalacios','avatarURL': config.botAvatar,'embeds': [{'color': parseInt(daColor),'description': 'Thanks for the suggestion <(^.^<)'}]};
					sharedWH.send("⚠ [SUGGESTION] on "+timeStamp+"\n**By: **"+m.user.username+"[`"+m.user.id+"`]\n```\n"+message.content.slice(9)+"\n```");
					return WHchan.send(slackmsg).catch(console.error);
				}
				slackmsg={'username': 'JennerPalacios','avatarURL': config.botAvatar,'embeds': [{'color': parseInt(daColor),'description': 'Thanks for your feedback <(^.^<)'}]};
				sharedWH.send("✅ [FEEDBACK] on "+timeStamp+"\n**By: **"+m.user.username+" [`"+m.user.id+"`]\n```\n"+message.content.slice(9)+"\n```");
				return WHchan.send(slackmsg).catch(console.error);
			}
		}
		
		
		
		// COMMAND: !CHECK
		if(command=="check"){
			var u2c=""; var u2cn="";
			if(config.blacklist){ var blacklist=config.blacklist; blacklist=blacklist.split(" "); }
			
			// COMMAND » !CHECK SERVER
			if(args[0]==="server"){
				if(m.roles.has(adminRole.id) || m.roles.has(modRole.id) || m.user.id===config.ownerID){
					let allUsersID="";let allUsersNames="";let uCount="";let milSecs=1000; let uc=0;let daServers="";let totalSpoofers=0;
					
					// GRAB ALL USERS
					g.members.map(m=> { allUsersID += m.user.id+","; allUsersNames+=m.user.username+","; } )
					
					// BREAK INTO ARRAYS
					allUsersID=allUsersID.split(",");allUsersNames=allUsersNames.split(","); uCount=allUsersID.length-1; let uTotal=uCount-1;
					
					// SEND NOTIFICATION
					let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
					slackmsg={
						'username': config.botName,
						'avatarURL': config.botAvatar,
						'embeds': [{
							'color': parseInt(daColor),
							'description': '**(>^.^)> NOTICE <(^.^<)**\nI am bout to check **'+uTotal+'** users...\n'
								+'From server: **'+config.myServer.name+'**\n**On**: '+timeStamp+'\n... please wait ...'
						}]
					};
					WHchan.send(slackmsg).catch(console.error);
					
					if(config.logAll==="yes"){ console.info("[CONFIG_LOG_ALL] About to check "+uTotal+" users, from server: "+config.myServer.name); }
					
					if(config.shareInfo==="yes"){ sharedWH.send(timeStampSys+"**"+config.myServer.name+"** has started a `!check server`, with **"+uTotal+"** active users <(^.^<)"); }
					
					for(var xUser=0; xUser < uCount; xUser++){
						setTimeout(function(){
							console.info("[#"+uc+"/"+uTotal+"] Checking: "+allUsersNames[uc]+" with id: "+allUsersID[uc]);
							let spoofServersFound=checkUser(allUsersID[uc]);
								// REMOVE MY SERVER NAME FROM FINDINGS - SO ALERT DOESNT GET TRIGGERED
								spoofServersFound=spoofServersFound.replace(config.myServer.name+",","");
							
							// DO NOT POST FINDINGS FOR BLACKLIST
							if(blacklist){
								for(var blUser="0";blUser < blacklist.length; blUser++){
									if(allUsersID[uc]===blacklist[blUser]){
										spoofServersFound="";
										if(config.logAll==="yes"){
											console.info("[CONFIG_LOG_ALL] I have skipped the user above due to: \"config.json\" in » \"blacklist\"!")
										}
									}
								}
							}
							
							// DO NOT POST FINDINGS FOR OWNER AND BOT
							if(allUsersID[uc]===config.botID || allUsersID[uc]===config.ownerID){
								spoofServersFound="";
								if(config.logAll==="yes"){ 
									console.info("[CONFIG_LOG_ALL] I have skipped the user above due t: \"config.json\" in » \"ownerID\" or \"botID\"!")
								}
							}

							if(spoofServersFound){
								spoofServersFound=spoofServersFound.split(",");
								for(var serv=0;serv<spoofServersFound.length;serv++){
									daServers += spoofServersFound[serv]+", ";
								}
								daServers=daServers.slice(0,-4);
								
								//
								//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
								//
								let daColor=config.warningColor; daColor=daColor.slice(1); daColor="0x"+daColor;
								slackmsg={
									'username': config.botName,
									'avatarURL': config.botAvatar,
									'embeds': [{
										'thumbnail': {'url': config.snipeImg },
										'color': parseInt(daColor),
										'description': '⚠ __**WARNING**__ ⚠\n**User**: '+allUsersNames[uc]+'\n**UserID**: <@'+allUsersID[uc]+'> \n...was **FOUND** in servers: \n'
											+daServers+'\n**On**: '+timeStamp+'\n.\n`User #'+uc+' of '+uTotal+' total...`'
									}]
								};
								// POST NOOB FOUND IN SPOOFER SERVER
								WHchan.send(slackmsg).catch(console.error);
								console.log(timeStampSys+"UserID: "+allUsersID[uc]+" was found in servers: "+daServers);
								
								// ADD TO TOTALSPOOFERS COUNT
								totalSpoofers++
								
								// RESET DATA FOR NEXT USER IN WAIT-LIST
								daServers=""; spoofServersFound="";
							}
							
							// END NOTIFICATION
							if(uc===uTotal){
								let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
								slackmsg={
									'username': config.botName,
									'avatarURL': config.botAvatar,
									'embeds': [{
										'color': parseInt(daColor),
										'description': '**(>^.^)> ALL DONE <(^.^<)**\n.\nI __found__ a total of **'+totalSpoofers
											+'** spoOfers!\n.Out of **'+uTotal+'** active users\n**On**: '+timeStamp
									}]
								}; 
								if(config.logAll==="yes"){ console.log("[CONFIG_LOG_ALL] I checked "+uTotal+" and found "
									+totalSpoofers+" potential spoofers on: "+timeStampSys); }
								
								if(config.shareInfo==="yes"){ sharedWH.send(timeStampSys+"**"+config.myServer.name+"** has found `"
									+totalSpoofers+"` spoofers, out of `"+uTotal+"` users on their server <(^.^<)"); }
								
								WHchan.send(slackmsg).catch(console.error);
							}
							
							// ADD +1 TO COUNT TO CHECK NEXT USER
							uc++;
						}, milSecs);
						
						// ADD 1 SECOND TO NEXT USER CHECK FROM SERVER
						milSecs=milSecs+1000;
					}
				}
				else {
					let daColor=config.dangerColor; daColor=daColor.slice(1); daColor="0x"+daColor;
					slackmsg={
						'username': config.botName,
						'avatarURL': config.botAvatar,
						'embeds': [{
							'color': parseInt(daColor),
							'description': '⚠ You are **NOT** __ALLOWED__ to use this command!'
						}]
					}; 
					
					// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
					return WHchan.send(slackmsg).catch(console.error);
				}
			}			
			
			// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
			let mentioned=""; if(message.mentions.users.first()){ mentioned=message.mentions.users.first(); }
			
			// MENTIONED PERSONW AS FOUND IN MY SERVER - GRAB THEIR USER ID AND USERNAME
			if(mentioned){ u2cn=mentioned.username; u2c=mentioned.id } 
			
			// IF USER ID WAS PROVIDED INSTEAD OF @MENTIONED
			if(Number.isInteger(parseInt(args[0]))){ 
				u2cn=g.members.get(args[0]); if(u2cn){ u2cn=g.members.get(args[0]).user.username; }else{ u2cn="<@"+args[0]+">"; } u2c=args[0]
			}
			
			// PERSON USING COMMAND IS AUTHORIZED - PERSON HAS ROLE FROM CONFIG.JSON OR IS BOT-OWNER
			if(m.roles.has(adminRole.id) || m.roles.has(modRole.id) || m.user.id===config.ownerID){
				if(u2c){
					
					// DO NOT POST FINDINGS FOR BLACKLIST
					if(blacklist){
						for(var blUser="0";blUser < blacklist.length; blUser++){
							if(u2c===blacklist[blUser]){
								if(config.logAll==="yes"){
									console.log("[WARNING] Cannot check users in \"config.json\" » \"blacklist\"!")
								}
								return
							}
						}
					}
					// DO NOT POST FINDINGS FOR OWNER OR BOT
					if(u2c===config.botID || u2c===config.ownerID){
						if(config.logAll==="yes"){
							console.log("[WARNING] Cannot check \"config.json\" » \"ownerID\", neither \"botID\"!")
						}
						return
					}

					// CHECK FOR THE PERSON USING SPOOFING SERVERS LIST
					let spoofServersFound=checkUser(u2c);
						// REMOVE MY SERVER NAME FROM FINDINGS - SO ALERT DOESNT GET TRIGGERED
						spoofServersFound=spoofServersFound.replace(config.myServer.name+",","");
					
					// USER WAS NOT FOUND IN ANY SPOOFING SERVER - FOR TEST CHANNEL
					if(!spoofServersFound || spoofServersFound===""){
						//
						//				SLACK TEMPLATE WITH SPOOF THUMBNAIL
						//
						let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
						slackmsg={
							'username': config.botName,
							'avatarURL': config.botAvatar,
							'embeds': [{
								'color': parseInt(daColor),
								'description': '✅ **'+u2cn+'** \nappears to be a __honorable__\n **Pokemon Go Trainer**'
							}]
						};
						
						if(config.logAll==="yes"){ console.info("[CONFIG_LOG_ALL] User: "+u2c+" appears to be a LEGIT Trainer, on "+timeStampSys); }
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
						let daColor=config.warningColor; daColor=daColor.slice(1); daColor="0x"+daColor;
						slackmsg={
							'username': config.botName,
							'avatarURL': config.botAvatar,
							'embeds': [{
								'thumbnail': {'url': config.snipeImg },
								'color': parseInt(daColor),
								'description': '⚠ __**WARNING**__ ⚠\n**User**: '+u2cn+'\n...was **FOUND** in __servers__:\n'+daServers+'\n**On**: '+timeStamp
							}]
						};
						
						if(config.logAll==="yes"){ console.log("[CONFIG_LOG_ALL] User: "+u2c+" was FOUND in servers: "+daServers+" on "+timeStampSys); }
					}
					
					// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
					return WHchan.send(slackmsg).catch(console.error);
				}
				
				// MENTIONED IS INCORRECT FORMAT - NO A VALID @MENTION OR USER_ID
				else {
					if(args[0]!=="server"){
						let daColor=config.goodColor; daColor=daColor.slice(1); daColor="0x"+daColor;
						slackmsg={
							'username': config.botName,
							'avatarURL': config.botAvatar,
							'embeds': [{
								'color': parseInt(daColor),
								'description': 'Please `@mention` a person you want me to `!check`, you can use `@user_tag` or `user_id_number`'
							}]
						};
						
						// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
						return WHchan.send(slackmsg).catch(console.error);
					}
				}
			}
			
			// USER IS NOT ALLOWED TO USE THIS COMMAND - DOES NOT HAVE THE REQUIRED ROLE OR NOT THE BOT-OWNER
			else {
				let daColor=config.dangerColor; daColor=daColor.slice(1); daColor="0x"+daColor;
				slackmsg={
					'username': config.botName,
					'avatarURL': config.botAvatar,
					'embeds': [{
						'color': parseInt(daColor),
						'description': '⚠ You are **NOT** __ALLOWED__ to use this command!'
					}]
				};
				
				// SEND DATA TO CHANNEL AS WEBHOOK IN ORDER TO HIDE BOT'S IDENTITY
				return WHchan.send(slackmsg).catch(console.error);
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
