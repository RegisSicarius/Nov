
module.exports = (self) => {
	self.registerCommand('expand', function (msg, args) {
		
		if(!args[0]) return this.send(msg,"not enough arguments")
		usr=this.self.getProfile(msg.author.id)
		if(usr.stars<1) return this.send(msg,'you dont have enough stars to do that')
		if(/\D/g.test(args[0])) return this.send(msg,'argument needs to be an integer')
		amount=parseInt(args[0])
		amount=(amount>usr.stars)?usr.stars:amount
		if(amount===0) return this.send(msg,'you havent enough stars to expand your galaxy')
		usr.stars-=amount
		usr.leveledStars+=amount
		usr.lStarsStack+=amount
		this.self.saveProfile(usr)
		return this.send(msg,`${msg.author.username}, you expanded your galaxy to ${this.self.radiusOf(usr)} ly by sacrificing ${amount} stars`)
	}, {
		description: 'increases your Galaxy Radius by sacrificing stars',
		usages: ['nnexpand <amount>']
	})
}
