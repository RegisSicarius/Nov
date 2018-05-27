module.exports = (self) => {
	self.registerCommand('collide', function (msg, args) {
		
		atker=this.self.getProfile(msg.author.id)
		if(!atker.evolve&1) return this.send(msg,'you need to purchase at least one upgrade to use this command')
		
		if(!args[0]) return this.send(msg,'you have to specify a galaxy name')
		atk=this.self.getProfile(msg.author.id)
		target=this.findUser(msg,args.join(' '))
		if(!target) return this.send(msg,'this is not a valid galaxy name')
		if(target.id===msg.author.id) return this.send(msg,'you cant collide with yourself...')
		dfder=this.self.getProfile(target.id)
		
		fact=this.self.radiusOf(dfder)/this.self.radiusOf(atker)
		fact=Math.min(1,fact)
		if(fact<0.67) return this.send(msg,'the galaxy you\'re targeting is too small to be reached...')
			
		var dfderR=(Math.random()*0.2+1)*(Math.random()*0.2+1)*(Math.random()*0.2+1)
		var atkerR=(Math.random()*0.2+1)*(Math.random()*0.2+1)*(Math.random()*0.2+1)
		
		transferAmount=(this.self.densityOf(dfder)*dfderR<this.self.densityOf(atker)*fact*atkerR)?Math.floor(0.4*dfder.leveledStars):-Math.floor(0.4*atker.leveledStars)
		
		dfder.leveledStars+=-transferAmount
		atker.leveledStars+=transferAmount
		
		this.self.saveProfile(dfder)
		this.self.saveProfile(atker)
		
		if(transferAmount==0) return this.send(msg,'it looks like nobody was able to absorb the other\'s mass...')
		if(transferAmount>0){
			addStock=(atker.evolve&this.self.upgTypes['Collide']).toString(2).replace(/0/g,'').length
			this.send(msg,msg.author.username+', during the collision, you have absorbed a part of '+target.username+'\'s mass, that results in increasing your galaxy radius to '+this.self.radiusOf(atker)+' ly')
			atker.collideRest+=Math.floor(0.5+dfder.leveledStars*Math.pow(addStock*2,2)/100)
			atker.annexed++
		}
		
		if(transferAmount<0){
			this.send(msg,msg.author.username+', during the collision, '+target.username+' has absorbed a part of your mass, that results in decreasing your galaxy radius to '+this.self.radiusOf(atker)+' ly')
			dfder.annexed++
		}
		
		
		this.self.saveProfile(dfder)
		this.self.saveProfile(atker)
		
	}, {
		deleteAfter: false,
		aliases: ['hit'],
		description: 'collides with another user, the result depends on cohesion and random (inter-server proof)',
		usages: ['nncollide <user>']
	})
}