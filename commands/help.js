/*
	Help. Shows all command names in console.
*/
module.exports = (self) => {
	self.registerCommand('help', function (msg, args) {
		pack={title: '__Novæ\'s Help Section__', description: '​', author: null, color: this.defaultColor}
		errM={name: 'Command not found', inline: false, value: 'the command you\'re looking for doesnt exist or is not available'}
		common={name: "Game Explanations", value: ["Welcome in Novæ's Universe",
			"You as a galaxy are growing amongst many other galaxies and your goal is to be the biggest one",
			"In this context, here is a list of what you can do:",
			"- creating stars from sending messages",
			"- spending stars in improving your galaxy",
			"- spending energies in using slots",
			"- upgrading your galaxy",
			"- colliding with the other galaxies",
			"- and also unlockable features!",
			"for further information, check `nnhelp list` out"].join('\n'), inline: false}

		paraf=[]

		switch(args[0]){
			case 'list': {
				listAns={name: 'List of available commands', inline: false, value: '`'+this.self.availables.join('` | `')+'`'}

				paraf.push(listAns)
				break
			}

			case undefined: {
				paraf.push(common)
				break
			}

			default: {
				if(args[0] && !this.self.commands.main[args[0]] && !this.self.commands.aliases[args[0]]){
					paraf.push(errM)
					break
				}
				currCmd=this.self.commands.main[args[0]] || this.self.commands.main[this.self.commands.aliases[args[0]]]
				paraf.push({name: currCmd.name+' usages', inline: true, value: currCmd.usages})
				paraf.push({name: currCmd.name+' purpose', inline: true, value: currCmd.description})
				paraf.push({name: currCmd.name+' aliases', inline: true, value: currCmd.aliases})
				break
			}
		}

		paraf.push({name: 'help usage', inline: false, value: this.usages})

		pack.fields=paraf
		this.embed(msg,pack)

	}, {
		aliases: ['h'],
		description: 'this... helps!',
		usages: ['nnhelp','nnhelp <commandName>','nnhelp list']
	})
}
