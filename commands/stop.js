/*
	Ban. Bans a user from a guild. Can input a mention, ID or name. Can specify how many days of messages to delete. (Needs "Ban Members" permission)
	"ban @user 3" will ban "user" and delete 3 days of their messages (Will only accept number of days between 1 - 9) (Default is 3)
*/
module.exports = (self) => {
	self.registerCommand('kill', function (msg, args) {
		msg.addReaction('✅')
		this.self.disconnect({reconnect: false})
		setTimeout(() => process.exit(0),5000)
	}, {
		admin: true
	})
}
