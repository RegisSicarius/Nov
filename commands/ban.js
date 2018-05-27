/*
	Ban. Bans a user from a guild. Can input a mention, ID or name. Can specify how many days of messages to delete. (Needs "Ban Members" permission)
	"ban @user 3" will ban "user" and delete 3 days of their messages (Will only accept number of days between 1 - 9) (Default is 3)
*/
module.exports = (self) => {
	self.registerCommand('ban', function (msg, args) {
		if (!args[0]) return this.send(msg, 'Need to specify a name, an ID or mention the user.')

		// Find the user and get deleteDays
		let user = this.findMember(msg, args[0])
		if (!user) return this.send(msg, 'That is not a valid guild member. Need to specify a name, an ID or mention the user.')
		let deleteDays = /\d{1}/.test(args[1]) ? parseInt(args[1], 10) : 3
		if(user.id==msg.author.id) return this.send(msg,'This command doesnt apply on yourself...')
		// Ban user
		msg.channel.guild.banMember(user.id,0)
		.then(() => this.send(msg, `🔨 - *Dropped the hammer on ${user.username}#${user.discriminator}*`))
		.catch((err) => { this.log.err(err, 'Ban'); this.send(msg, `unable to ban ${user.username}`) })
	}, {
		noPms: true,
		admin: true,
		filter: 'server',
		needs: 4,
		description: 'bans an user',
		usages: ['nnban <user>']
	})
}
