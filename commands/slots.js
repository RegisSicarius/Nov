
module.exports = (self) => {
	self.registerCommand('slots', function (msg, args) {
		
		let usr=this.self.getProfile(msg.author.id)
		if(usr.ticket<1) return this.send(msg,'you dont have enough energy source to found new stars')
		times=1
		if(!!args[0] && /^-?\d+$/.test(args[0])){
			times=parseInt(args[0])
			times=Math.max(1,times)
			times=Math.min(times,usr.ticket)
		}
		var ans=''
		
		addsl=(this.self.upgTypes['Slots']&usr.evolve).toString(2).replace(/0/g,'').length
		var stack=0
		
		usr.ticket-=times
		for(i=0;i<times;i++){
			amount=(this.self.randslots[Math.floor(Math.pow(Math.random(),3)*10)])*this.self.levelOf(usr)
			amount=Math.floor(amount*(amount<0?Math.pow(1.1,addsl):Math.pow(1.2,addsl))+0.5)
			stack+=amount
			usr.stars+=amount
			usr.ticketStack+=Math.max(amount,0)
		}
		
		if(stack<=0) ans+='💥 | the energy source has just exploded and blasted '+(-stack)+' stars from your galaxy...\n'
			else ans+='🌠 | the energy source was stable enough to create '+stack+ ' stars in your galaxy!\n'
		
		this.send(msg,ans)
		this.self.saveProfile(usr)
	}, {
		aliases: ['rand'],
		description: 'spends your energy sources in random prizes',
		usages: ['nnslots','nnslots <repeat>']
	})
}
