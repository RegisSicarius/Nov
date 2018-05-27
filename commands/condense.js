
module.exports = (self) => {
	self.registerCommand('condense', function (msg, args) {
		
		if(!args[0]) return this.send(msg,"not enough arguments")
		usr=this.self.getProfile(msg.author.id)
		if(usr.stars<1) return this.send(msg,'you dont have enough stars to do that')
		if(/\D/g.test(args[0])) return this.send(msg,'argument needs to be an integer')
		amount=parseInt(args[0])
		amount=(amount>usr.stars)?usr.stars:amount
		if(amount===0) return this.send(msg,'you havent enough stars to stabilize your galaxy')
		usr.stars-=amount
		usr.packedStars+=amount
		usr.pStarsStack+=amount
		this.self.saveProfile(usr)
		return this.send(msg,`${msg.author.username}, you increased your galaxy's cohesion index by sacrificing ${amount} stars`)
	}, {
		description: 'increases your Galaxy Cohension Index by sacrificing stars',
		usages: ['nncondense <amount>']
	})
}
