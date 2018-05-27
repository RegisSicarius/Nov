module.exports = (self) => {
	self.registerCommand('info', function (msg, args) {
		pack={title: '__Novæ\'s Stats__', description: 'Hello, if you want to add me, you can click [this link](https://discordapp.com/oauth2/authorize?&client_id=321337187109175306&scope=bot&permissions=805620766)\nThere is no Support Server yet though, but feel free to ask questions by pinging the bot and I\'ll answer through it!', author: null, color: this.defaultColor}
		paraf=[]
		
		var version=require('../version.json')
		
		paraf.push({name: `Version ${version.version}`, inline: false, value: '​'+version.update.join('\n')})
		paraf.push({name: 'Bot\'s Spread', inline: false, value: `I'm in ${this.self.guilds.size} guilds with ${this.self.users.size} different users`})
		paraf.push({name: 'Development', inline: false, value: `I'm under development by ${this.self.users.get('219250439483424768').username}#${this.self.users.get('219250439483424768').discriminator}, using Eris in NodeJS`})
		
		pack.fields=paraf
		this.embed(msg,pack)
		
	}, {
		aliases: ['bot'],
		description: 'displays information about the bot',
		usages: ['nninfo']
	})
}