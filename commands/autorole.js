/*
	Help. Shows all command names in console.
*/
module.exports = (self) => {
	self.registerCommand('autorole', function (msg, args) {
		
		var chg=false
		switch(args[0]){
			case 'add': chg=true
				var rl=getRoleId(args.slice(1,args.length).join(' '))
				if(!rl) return this.send(msg,'<:OnWrong:434335509393834004> | Invalid role name')
				var templist=this.self.roleList.filter(x => { return x!==rl.id})
				templist.push(rl.id)
				this.self.roleList=templist
				this.send(msg,'<:OnRight:434335488602800138> | Successfully set **'+rl.name.replace(/([*`\-_~])/g,'\\$1')+'** as an autorole')
				break
				
			case 'list': var lst=[]
				msg.channel.guild.roles.filter(x => { return this.self.roleList.join(' ').includes(x.id)}).forEach(x => lst.push('**'+x.name.replace(/([*`\-_~])/g,'\\$1')+'**'))
				return this.send(msg,'ℹ | Autoroles: '+(lst.join(', ') || 'no autorole set'))
			case 'remove': chg=true
				var rl=getRoleId(args.slice(1,args.length).join(' '))
				if(!rl) return this.send(msg,'<:OnWrong:434335509393834004> | Invalid role name')
				if(!this.self.roleList.join(' ').includes(rl.id)) return this.send(msg,'<:OnWrong:434335509393834004> | This role isnt set as an autorole')
				this.self.roleList=this.self.roleList.filter(x => { return x!==rl.id})
				this.send(msg,'<:OnRight:434335488602800138> | Successfully removed **'+rl.name.replace(/([*`\-_~])/g,'\\$1')+'** from the autorole list')
				break				
			default: return this.send(msg,'<:OnWrong:434335509393834004> | Invalid Argument, check `nnhelp autorole` for more information')			
		}
		
		if(chg){
			require('fs').writeFile('./config/onJoinRoles.txt',this.self.roleList.join(' '),(err)=>{
				if(err) console.log(err)
			})
		}
		
		function getRoleId(roleName){
			if(!roleName) return
			return msg.channel.guild.roles.find(rl => { return rl.name.toLowerCase().includes(roleName.toLowerCase())})
		}
		
	}, {
		aliases: ['arole','autoroles','aroles','joinrole','joinroles'],
		description: 'adds or removes roles which will be assigned to the incomer members',
		usages: ['nnautorole add <roleName>','nnautorole remove <roleName>','nnautorole list'],
		admin: true,
		needs: 268435488
	})
}
