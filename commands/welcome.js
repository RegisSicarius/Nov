module.exports = (self) => {
	self.registerCommand('welcome', function (msg, args) {
		if(!args[0]) return this.send(msg,'Missing argument','err')
		switch(args[0]){
			case 'stats': fs.readFile(`./items/welcome/${msg.channel.guild.id}.json`,(err,content)=>{
					if(err) return this.send(msg,'No welcome message set in this guild','err')
					var guild=JSON.parse(content)
					var emb={title: 'Welcome message', description: String.fromCharCode(8203), author: null, color: this.defaultColor, fields: []}
					emb.fields.push({name: 'Channel', value: `<#${guild.thread}>`, inline: false})
					emb.fields.push({name: 'Message', value: guild.message})
					this.embed(msg,emb)
				})
				break

			case 'remove': fs.readFile(`./items/welcome/${msg.channel.guild.id}.json`,(err)=>{
					if(err) return this.send(msg,'No welcome message set in this guild','err')
					fs.rename(`./items/welcome/${msg.channel.guild.id}.json`,'WELCOME_TRASH',(err)=>{
						if(err) return this.send(msg,'A system error occurs','err')
						return this.send(msg,'Successfully removed the welcome message!','succ')
					})
				})
				break

			case 'set': if(!args[1]) return this.send(msg,'Missing argument, check the help','err')
			var guild={thread: msg.channel.id, message: args.slice(1).join(' ')}
				fs.writeFile(`./items/welcome/${msg.channel.guild.id}.json`,JSON.stringify(guild),(err)=>{
					if(err) return this.send(msg,'An error occurs...','err')
					return this.send(msg,`Welcome messages ready to get displayed in <#${guild.thread}>`,'succ')
				})
				break

			default: return this.send(msg,'Invalid argument, check the help','err')
		}
	}, {
		filter: 'server',
		needs: 8224,
		aliases: ['join'],
		description: 'adds or removes welcome messages for the channel you send the command in\nwrite &USER for comer user name, &ATUSER for comer user mention, and &SERVER for server name',
		usages: ['nnwelcome stats','nnwelcome set <welcomeMessage>','nnwelcome remove']
	})
}
