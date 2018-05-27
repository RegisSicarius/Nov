module.exports = (self) => {
	self.registerCommand('send', function (msg, args) {
		
	
	if(!args[1]) return this.send(msg,'not enough arguments, correct usage is `nnsend <channel_id> <message>`')
	chn=args.shift().replace(/-/gi,this.self.lastch)
	if(!this.self.getChannel(chn)) return this.send(msg,'invalid channel id '+chn)
	this.self.createMessage(chn,args.join(' '))
	this.send(msg,'message sent to '+chn)
	this.self.lastch=chn
	}, {
		deleteAfter: false,
		admin: true
	})
}