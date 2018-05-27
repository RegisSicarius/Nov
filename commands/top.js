fs=require('fs')
const log = require('../src/plugins/Logger.js')
module.exports = (self) => {
	self.registerCommand('top', function (msg, args) {
		var everyone=[]
		
		var files=fs.readdirSync(this.self.profileDir)
		var ref=[]
		
		for(let user of files){
			var pf=this.self.getProfile(user.replace(/\.json/g,''))
			everyone.push(pf)
			ref[pf.id]=this.self.generateRef(''+this.self.generateRef(pf.id)+'')
		}
		for(var i=0; i<everyone.length; i++){
			var swap=i
			for(var j=i; j<everyone.length;j++){
				swap=this.self.radiusOf(everyone[swap])<this.self.radiusOf(everyone[j])?j:swap				
			}
			
			temp=everyone[i]
			everyone[i]=everyone[swap]
			everyone[swap]=temp
			
		}
		var firstIdx=isNaN(args[0])?0:parseInt(args[0],10)-1
		firstIdx=firstIdx<0?0:firstIdx
		firstIdx=firstIdx>=everyone.length/10?0:firstIdx
		var pos=-1
		for(var lp=0;lp<everyone.length;lp++) if(everyone[lp].id===msg.author.id) pos=lp+1
		
		str=''
		for(var i=firstIdx*10; i<Math.min(everyone.length,firstIdx*10+10);i++){
			user=this.self.users.get(everyone[i].id)
			str+=((i+1)+'. \n')+' Name: '+(user?user.username.replace(/(['`"])/g,'$1$1'):`'O-${ref[everyone[i].id]}GX'`)+(msg.channel.guild.members.get(everyone[i].id)?' ✔':'')+'\n  #Galaxy Radius: '+this.self.radiusOf(everyone[i])+' ly\n\n'
		}
		if(!msg.author.bot)	str+='\n#your position\n  rank: '+pos+'/'+everyone.length+'\n  #Galaxy Radius: '+this.self.radiusOf(everyone[pos-1])+' ly'
		str='```rb\n'+str.replace(/`{3}/g,'`𛲡`𛲡`𛲡')+'```'
		field=[{name: '​', value: str, inline: true}]
		
		this.embed(msg,{title: '🌌Top of the Galaxies in Novæ Universe', author: null, color: this.defaultColor, fields: field})
			
		
		
	}, {
		aliases: ['rank','table'],
		description: 'shows up the ranking of the largest galaxies, \\✔ means that the galaxy is in the current guild',
		usages: ['nntop <pageNumber>','nntop']
	})
}