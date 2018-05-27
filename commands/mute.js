module.exports = (self) => {
	self.registerCommand('mute', function (msg, args) {

		if(!msg.channel.guild) return this.send(msg,'you cant mute someone in a DM channel')

		if(!args[0]) return this.send(msg,'not enough arguments')

		target=this.findMember(msg,args[0])

		if(!target) return this.send(msg,'User not found')
		if(target.id==msg.author.id) return this.send(msg,'This command doesnt apply on yourself...')
		if(this.self.muteUpdate(msg,target.id)) return this.send(msg,'successfully muted '+target.username)
		return this.send(msg,'successfully unmuted '+target.username)


	}, {
		deleteAfter: false,
		admin: true,
		needs: 8192,
		description: 'mutes an user',
		usages: ['nnmute <user>']
	})
}
