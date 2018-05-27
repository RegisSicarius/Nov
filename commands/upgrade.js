/*
	Ping. Edits the message to "Pong!" to check if the bot is online.
*/
module.exports = (self) => {
	self.registerCommand('upgrade', function (msg, args) {
		
		if(!args[0]) return this.send(msg,'not enough argument')
		usr=this.self.getProfile(msg.author.id)
		upgs=this.self.upgrades
		field=[{name: 'Status', value: 'purchased upgrades: '+usr.evolve.toString(2).replace(/0/g,'').length+'\nupgrade progression: '+Math.floor(usr.evolve.toString(2).replace(/0/g,'').length/this.self.upgNb*100)+'%', inline: false}]
		pack={title: 'Upgrade Shop', description: '*note that arguments for upgrade names are case insensitive and also get spaces removed from them*\n​', author: null, color: this.defaultColor, fields: field}

		if(args[0]==='list'){
			str=''
			
			for(upg in upgs){
				if((usr.evolve&upgs[upg].id)===0 && (usr.evolve&upgs[upg].pid)===upgs[upg].pid && usr.annexed>=upgs[upg].annexed){
					str+='*'+upgs[upg].name+'*\t(**'+upgs[upg].cost+'** stars)\n'
				} 
			}
			
			if(str==='') str='it looks like there is no upgrade purchasable at this moment'
			field.push({name: 'Upgrade List', value: str, inline: false})
			
			return this.embed(msg,pack)
		}
		
		if(args[0]==='info'){
			args.shift()
			if(!args[0]) return this.send(msg,'this command needs an argument as the upgrade name!')
			upg=upgs[args.join('').toLowerCase()]
			if(!upg) return this.send(msg,`no *${args.join('').toLowerCase()}* upgrade found`)
			
			str=''
			str+=`Cost: **${upg.cost}** stars, Required Victories: **${upg.annexed}**\n${upg.description}`
			field.push({name: 'Showing info on '+upg.name, value: str, inline: false})
			return this.embed(msg,pack)
		}
		
		if(args[0]==='buy'){
			args.shift()
			upg=upgs[args.join('').toLowerCase()]
			if(!upg) return this.send(msg,`no *${args.join('').toLowerCase()}* upgrade found`)
			if((usr.evolve&upg.id)!==0 || (usr.evolve&upg.pid)!==upg.pid) return this.send(msg,`no *${args.join('').toLowerCase()}* upgrade found`)
			if((usr.evolve&upg.id)===0 && (usr.evolve&upg.pid)===upg.pid && usr.annexed>=upg.annexed && upg.cost<usr.stars){
				usr.stars-=upg.cost
				usr.evolve+=upg.id
				this.self.saveProfile(usr)
				return this.send(msg,msg.author.username+', you\'ve successfully obtained the *'+upg.name+'* upgrade')
			}else return this.send(msg,'you cant buy this upgrade at this moment, get more information at `nnupgrades info '+args.join('').toLowerCase()+'`')
		}
		
		return this.send(msg,'wrong command usage, read `nnhelp command upgrades` for further information')
		
	}, {
		usages: ['nnupgrades list','nnupgrades info <upgradeName>', 'nnupgrades buy <upgradeName'],
		aliases: ['upgrades', 'upgrade','upg'],
		description: 'shows upgrade shop, allows upgrade purchasing'
	})
}
