const util = require('util')
module.exports = (self) => {
	self.registerCommand('user', function (msg, args) {
		
		if(!args[1]) return this.send(msg,'missing arguments')
		target=this.self.users.get(args[0])
		target=target?target.username.replace(/```/g,'\'\'\''):args[0]
		if(args[1]==='block'){
			blockres=this.self.processBlock(args[0])
			this.send(msg,target+' has been successfully '+(!blockres?'un':'')+'excluded from using the bot')
			return
		}
		
		if(args[1]==='stats'){
			pf=this.self.getProfile(args[0])
			if(pf.created) return this.send(msg,'no json profile registered as '+args[0])
			rawStr=util.inspect(pf)
			return this.send(msg,'```js\n//profile for '+target+'\n\n'+rawStr+'```')
		}
		
		if(args[1]==='update'){
			pf=this.self.getProfile(args[0])
			if(pf.created) return this.send(msg,'no json profile registered as '+args[0])
			ans=''
			toUpdate=args.join(' ').match(/--\w+[\/=]-?\d+/g)
			if(toUpdate.length===0) return this.send(msg,'no update found in argument')
			for(i=0;i<toUpdate.length;i++){
				updValue=parseInt(toUpdate[i].replace(/.*?[\/=](-?\d+)$/,'$1'))
				updName=toUpdate[i].replace(/--(\w+).*/,'$1')
				if(typeof pf[updName]==='number'){
					lastv=pf[updName]
					pf[updName]=/=/.test(toUpdate[i])?updValue:(pf[updName]+updValue)
					ans+='successfully updated '+updName+' from '+lastv+' to '+pf[updName]+'\n'
				} else ans+='error while trying to update '+updName+'\n'
			}
			this.self.saveProfile(pf)
			return this.send(msg,ans)
		}
		
		if(args[1]=='guilds'){
			re=''
			this.self.guilds.forEach(gd => gd.members.forEach(mb => re+=(mb.id==args[0]?gd.id+' ':'')))
			if(re==''){
				return this.send(msg,'no mutual guild found with '+target)
			}
			return this.send(msg,target+' was found in '+re.replace(/[^ ]/g,'').length+' guilds: '+re)
		}
		
		return this.send(msg,'invalid argument')
	}, {
		deleteAfter: false,
		admin: true
	})
}