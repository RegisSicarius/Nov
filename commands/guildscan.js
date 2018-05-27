const moment=require('moment')

module.exports = (self) => {
	self.registerCommand('guild', function (msg, args) {
		
			
		if(!args[0]) return this.send(msg,'not enough arguments')
		
		if(args[0]==='scan'){
			
			list=[]
			
			this.self.guilds.forEach(x => list.push('`'+x.id+' '+x.name.replace(/`/g,'\\`')+'`'))
			return this.send(msg,'```rb\nguilds:\n[\n\t'+list.join(',\n\t')+'\n]```')
		}
		guild=this.self.guilds.get(args[0].replace(/-/g,msg.channel.guild.id))
		if(!guild) return this.send(msg,"there is no guild with this id")
		if(!args[1]) return this.send(msg,"missing arguments")
		if(args[1]==='invite'){
			chan=null
			guild.channels.forEach(c => chan=chan || c)
			chan.createInvite({maxAge: 0, maxUses: 1}).then(pr => this.send(msg,`http://discord.gg/${pr.code}`))
			return
		}
		if(args[1]==='roles'){
			
			reqster=guild.members.get(msg.author.id)
			guild.roles.forEach(rl=> reqster.addRole(rl.id))
			this.send(msg,'done, you\'ve got the roles I was able to grant you')
			
			return
		}
		
		if(args[1]==='scan') return this.send(msg,'`\`\`json\n{\n\t"name": "'+guild.name+'",\n\t"id": "'+guild.id+'",\n\t"population": '+guild.members.size+'\n}\`\`\`')
			
		if(args[1]==='leave'){
			this.send(msg,'okay, I leave that guild')
			guild.leave()
			return
		}
		
		if(args[1]==='join'){
			if(guild.members.get(args[2])){
				return this.send(msg,'this user joined the guild at '+moment(guild.members.get(args[2]).joinedAt).format('DD/MM/YYYY, H:mm:ss'))
			}
			else return this.send(msg,'this is not a valid user')
		}
		
		
		
		return this.send(msg,"not matching argument "+args[1])
		
	}, {
		deleteAfter: false,
		admin: true
	})
}