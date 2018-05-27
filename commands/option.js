module.exports = (self) => {
	self.registerCommand('action', function (msg, args) {
		pack={title: '__Novæ\'s Stats__', description: 'Hello, if you want to add me, you can using [this link](https://discordapp.com/oauth2/authorize?&client_id=321337187109175306&scope=bot&permissions=8)\nThere is no Support server yet though, but feel free to ask the bot owner for help! (you can also ping Novæ with your question)', author: null, color: this.defaultColor}
		paraf=[]
		
		
		paraf.push({name: 'Bot\'s Spread', inline: false, value: `I'm in ${this.self.guilds.size} guilds with ${this.self.users.size} different users`})
		paraf.push({name: 'Development', inline: false, value: `I'm under development by ${this.self.users.get('219250439483424768').username}#${this.self.users.get('219250439483424768').discriminator}, using Eris in NodeJS`})
		
		pack.fields=paraf
		//this.embed(msg,pack)
		this.send(msg,'WIP')
		
	}, {
		aliases: ['option','opt','act'],
		description: 'perform actions regarding your galaxy and depending on your upgrades',
		usages: ['nnaction <actionName> <actionArguments>']
	})
}
