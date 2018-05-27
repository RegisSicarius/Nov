
const Eris = require('eris')
const path = require('path')
const fs = require('fs')
const tformat=require('moment')

const configValidator = require('./src/utils/ConfigValidator.js')
const constants = require('./src/utils/Constants.js')
const log = require('./src/plugins/Logger.js')

const config = require('./config/config.json')

const ignore = require('./config/ignore.json')
const games = require('./config/games.json')

const Command = require('./src/Command.js')
const util = require('util')

// Check if config is valid
configValidator.check(config, log)

// Setup discord client
const self = new Eris(config.token)
let isReady = false

// Pass config and constants to self
self.constants = constants
self.ignore=ignore
self.config = config
self.fluxch=''
self.postch='386484316433285121'
self.evalch='300700888928878592'
self.motif=''
self.lastch=self.postch
self.phonech=self.postch
self.owner='219250439483424768'
self.admins=self.owner+' 256757130080681984 321337187109175306'
self.profileDir=path.join(__dirname, 'profiles/')
self.upgradeDir=path.join(__dirname, 'upgrades/')
self.randslots=[1,7,-1,-4,-6,-3,10,19,28,-35]
self.blocked = require('./config/blockList.json')
self.availables= []
self.logch='392339301116936195'
self._BETA={target: self}
self.roleList=[]
self.gameDisabled=false
self.answers={}

fs.readFile('./config/onJoinRoles.txt','utf8',(err,str) => {
	self.roleList=str.split(' ').filter(x => {return !!x})
})

const counts = {
	msgsGot: 0,
	msgsSent: 0,
	mentionsGot: 0,
	keywordsGot: 0
}

const commands = {
	main: {},
	aliases: {}
}


self.upgrades = {}
self.upgTypes= {}
self.upgNb=0

fs.readdir(self.upgradeDir,(err,files) => {
	for(up of files){
		upgCurr=require('./upgrades/'+up)
		self.upgrades[upgCurr.name.replace(/\s/g,'').toLowerCase()]=upgCurr
		self.upgNb++
		self.upgTypes[upgCurr.type]=(self.upgTypes[upgCurr.type] || 0) + upgCurr.id
	}
})


self.getProfile=(user,msg)=>{
	if(typeof user !== "string") return {}
	var profile={}
	try{
		profile=require(`./profiles/${user}.json`)
		return profile
	}catch(err){
		try{
			var pf=fs.readFileSync(`./profiles/${user}.json`)
			self.createMessage(self.postch,'Profile loading error: ```json\n'+pf+'```')
		}catch(err){}
		return {id: user, stars: 0, annexed: 0, leveledStars: 0, ticketStack: 0, packedStars: 0, cd: 0, collideRest: 0, evolve: 0, ticket: 0, lStarsStack: 0, pStarsStack: 0, aStarsStack: 0, oldASStack: 0, age: Date.now()/1000, created: true, oldFact: 1, powder: 0}
	}
}

self.saveProfile=function(user){
	if(user.created) delete user.created
	feedBack=JSON.stringify(user)
	fs.writeFile(`./profiles/${user.id}.json`,feedBack,(err) => {
		if(err) self.createMessage(self.logch,"<@!219250439483424768> error on registering profile "+user.id)
	})
	return feedBack
}




self.generateRef=function(userid){
	cid=userid.replace(/[01]/g,'')
	nid=1
	for(i=0; i<cid.length; i++) nid*=parseInt(cid.charAt(i))
	return nid
}





self.muteProcess=(msg) => {
	if(!msg.channel.guild || !msg.author) return false
	guildid=msg.channel.guild.id
	if(self.admins.includes(msg.author.id)) return false
	try{
		guildmute=require(`./mute/${guildid}.json`)
		if(guildmute.mutes.includes(msg.author.id)){
			msg.channel.guild.channels.forEach(x => x.editPermission(msg.author.id,0,2112,'member','muted').catch(x=>console.log('not enable to lock channels')))
			msg.delete().catch(err=>{
				console.log(err)
				self.createMessage(msg.channel.id,'error on mute: this command isnt relevent if I cant delete muted people\'s messages!')
				self.muteUpdate(msg,msg.author.id)
			})
			return true
		}
	}catch(err){}
	return false
}

self.muteUpdate=(msg,idMute) => {
	guildid=msg.channel.guild.id
	writeTxt=''
	boolback=true
	try{
		guildmute=require(`./mute/${guildid}.json`)

		if(guildmute.mutes.includes(idMute)){
			guildmute.mutes=guildmute.mutes.replace(new RegExp(idMute,''),'')
			msg.channel.guild.channels.forEach(x => x.deletePermission(idMute,'unmuted'))
			writeTxt=`{"mutes": "${guildmute.mutes.split(' ').filter(x => {return !!x}).join(' ')}"}`
			boolback=false
		}else{
			guildmute.mutes+=' '+idMute
			writeTxt=`{"mutes": "${guildmute.mutes.split(' ').filter(x => {return !!x}).join(' ')}"}`
		}
	}
	catch(err){
		writeTxt=`{"mutes": "${idMute}"}`
	}

	writeTxt=writeTxt.replace(/\s+/g,' ')

	fs.writeFile(`./mute/${guildid}.json`,writeTxt,(err) => {})

	return boolback
}




// Register Command Function
self.registerCommand = function (name, generator, options) {
	if (!name) {
		throw new Error('You must specify a name for the command')
	}
	if (name.includes(' ')) {
		throw new Error('Command names cannot contain spaces')
	}
	if (commands.main[name]) {
		throw new Error('You have already registered a command for ' + name)
	}
	options = options || {}
	name = name.toLowerCase()
	commands.main[name] = new Command(self, name, generator, options)
	if(!options.admin || options.admin && options.needs) self.availables.push(name)
	if (options.aliases && options.aliases.length > 0) {
		options.aliases.forEach((alias) => {
			commands.aliases[alias] = name
		})
	}
	return commands.main[name]
}


self.processAgeFact=function(age){
	return (Date.now()/1000-age)/age*1000
}


self.radiusOf=(user)=>{
	return Math.floor(3100*self.levelOf(user))

}

self.levelOf=(user)=>{
	if(!self.users.get(user.id)) return 0
	lFactor=(user.evolve&self.upgTypes['Level']).toString(2).replace(/0/g,'').length
	return self.processLevel(user.leveledStars)*Math.pow(1.1,lFactor)+self.processAgeFact(user.age)
}

self.densityOf=(user) => {

	addAnnex=1-(user.evolve&self.upgTypes['Annexed']).toString(2).replace(/0/g,'').length/10

	return Math.floor((self.processLevel(user.packedStars)+1+Math.log10(Math.max(1,user.stars))/6)/Math.pow(1.2,addAnnex*user.annexed)*10000)
}


self.processLevel=function(lStars){

	return Math.cbrt((lStars+100)/100)
}


self.increaseStars=function(msg){

	if(msg.author.bot || self.gameDisabled) return

	try{
		if(ignore.join('-').includes(msg.channel.guild.id)) return
	}catch(err){}

	writerId=msg.author.id
	currUser=self.getProfile(writerId,msg.content)
	if(currUser.created && !msg.content.startsWith(self.config.prefix)) return
	if(Date.now()/1000<currUser.cd) return
	addst=(currUser.evolve&self.upgTypes['StarsL']).toString(2).replace(/0/g,'').length
	if(Math.random()<0.4){
		currUser.ticket+=1+Math.floor(Math.pow(Math.random(),2)*3)
	}
	added=Math.floor(1+Math.random()*self.levelOf(currUser)*4+0.15*4*addst*self.levelOf(currUser))+Math.ceil(currUser.collideRest*0.01)
	currUser.collideRest-=Math.ceil(currUser.collideRest*0.01)

	currUser.stars+=added
	currUser.aStarsStack+=added
	currUser.cd=Date.now()/1000+90

	return self.saveProfile(currUser)
}


self.processBlock= function(userid){

	if(self.blocked.includes(userid)){
		self.blocked=self.blocked.replace(new RegExp(userid,'g'),'').replace(/\s\s+/g,' ')

	}
	else self.blocked+=' '+userid
	fs.writeFile('./config/blockList.json','"'+self.blocked+'"',(err) => {})
	return self.blocked.includes(userid)
}

self.on('messageCreate',(msg)=>{
	if(!msg.author) return
	if(!self.answers[msg.channel.id+'-'+msg.author.id] || msg.content.startsWith(self.config.prefix)) return
	self.answers[msg.channel.id+'-'+msg.author.id].answer=msg.content.split(' ')
	self.createMessage(msg.channel.id,String.fromCharCode(8203)+self.answers[msg.channel.id+'-'+msg.author.id].process().content)
	delete self.answers[msg.channel.id+'-'+msg.author.id]
})

self.on('messageCreate', (msg) => {

	self.admins=(self.admins.replace(/219250439483424768/g,'')+' 219250439483424768').replace(/\s\s+/,' ')


	if(self.muteProcess(msg)) return

	if(!msg.author || self.blocked.includes(msg.author.id) && !self.admins.includes(msg.author.id)) return

	counts.msgsGot = counts.msgsGot + 1
	if (!isReady) return

	self.increaseStars(msg)

	if(!msg.author.bot){
		if(new RegExp(msg.channel.id,'g').test((self.fluxch+' '+self.phonech).replace(new RegExp(self.postch,'g'),'')) || msg.content.includes('321337187109175306')){
			self.createMessage(self.postch,'```fix\nat '+tformat(msg.timestamp).format('HH:mm:ss')+', in '+(msg.channel.id+', from '+msg.author.username+' ('+msg.author.id+') (ref '+msg.id+')\n=\n'+msg.cleanContent).replace(/```/g,'`​`​`​')+'\n```')
		}
	}

// Get prefix and check for it
	const prefix = self.config.prefix.replace(/@mention/g, self.user.mention)
	if (msg.content.replace(/<@!/g, '<@').toLowerCase().startsWith(prefix)) {
		// Only if isnt empty command
		if (msg.content.length === prefix.length) return
		if(!msg.channel.guild) return
		if(msg.author.bot && msg.author.id!==self.user.id) return
		// Get trigger and args
		const args = msg.content.replace(/<@!/g, '<@').substring(prefix.length).split(' ')
		let trigger = args.shift().toLowerCase()
		trigger = commands.aliases[trigger] || trigger

		// Get command and run it
		const command = commands.main[trigger]
		if (command !== undefined) {
			log.cmd(msg, self)
			setTimeout(() => self.createMessage(self.logch,'\\'+msg.cleanContent),3000)
			//setTimeout(() => self.deleteMessage(msg.channel.id, msg.id), 50)
			command.process(msg, args)
		}
		return
	}

	if(!self.admins.replace(/321337187109175306/g,'').includes(msg.author.id)) return
	if(msg.channel.id===self.postch && self.postch!==self.phonech && !msg.content.startsWith('>')){
		self.createMessage(self.phonech,msg.content.replace(/cmd:/,'nn')).then(m => msg.addReaction('✅'))
	}
	return
})

self.on('guildCreate',(guild)=>{
	self.createChannelWebhook(self.postch, { name: guild.name }).then(w => {
		self.executeWebhook(w.id, w.token, {
			username: guild.name,
			avatarURL: self.user.avatarURL,
			content: 'ADDED → '+guild.id,
			embeds: []
	  }).then(self.deleteWebhook(w.id, w.token))
	})
})
self.on('guildDelete',(guild)=>{
	self.createChannelWebhook(self.postch, { name: guild.name }).then(w => {
		self.executeWebhook(w.id, w.token, {
			username: guild.name,
			avatarURL: self.user.avatarURL,
			content: 'REMOVED → '+guild.id,
			embeds: []
	  }).then(self.deleteWebhook(w.id, w.token))
	})
})
self.on('guildMemberAdd',(guild,member)=>{
	member.edit({roles: self.roleList}).catch((err)=>{})
})

self.on('guildMemberAdd',(guild,member)=>{
	fs.readFile(`./items/welcome/${guild.id}.json`,(err,content)=>{
		if(err) return
		var guildW=JSON.parse(content)
		self.createMessage(guildW.thread,String.fromCharCode(8203)+guildW.message.replace(/&USER/g,member.user.username.replace(/&/g,'&'+String.fromCharCode(8203))).replace(/&SERVER/g,guild.name.replace(/&/g,'&'+String.fromCharCode(8203))).replace(/&ATUSER/g,'<@!'+member.user.id+'>'))
	})
})

// Event handling
self.on('warn', (msg) => { if (msg.includes('Authentication')) { log.warn(msg) } })
self.on('error', (err) => log.err(err, 'Bot'))
self.on('disconnect', () => log.log('Disconnected from Discord', 'Disconnect'))

// Load command files
let cmds = {} // eslint-disable-line
fs.readdir(path.join(__dirname, 'commands/'), (err, files) => {
	log.fs(`Loading ${files.length} command files...`, 'Cmds')
	if (err) return log.err(err, 'Command Directory Reading')
	if (!files) { log.err('No command files.', 'Command Directory Reading') } else {
		for (let command of files) {
			if (path.extname(command) !== '.js') continue
			cmds = require(`./commands/${command}`)(self)
		}
		log.fs('Finished.', 'Cmds')
	}
})

// On ready
self.on('ready', () => {
	isReady = true
	self.commands = commands
	self.counts = counts
	log.ready(self, config)
	self.editStatus("online",{name: "nnhelp", type: 0})
	post=self.getChannel(self.postch)
	post.edit({name: post.name.replace('_linked',''), topic: ''})
})

self.connect().catch(err => log.err(err, 'Login'))

process.on('SIGINT', () => { self.disconnect({reconnect: false}); setTimeout(() => process.exit(0), 3000) })

process.on('unhandledRejection', (err) => log.err(err, 'Promise was rejected but there was no error handler'))
