/*
	Help. Shows all command names in console.
*/
module.exports = (self) => {
	self.registerCommand('stats', function (msg, args) {
		let target=!args[0]?msg.author:this.findUser(msg,args[0])
		if(!target) return this.send(msg,'This is not an existing galaxy')
		glx=this.self.getProfile(target.id)
		if(glx.created) return this.send(msg,'This is not an existing galaxy')
		pack={description: '​', author: null, color: this.defaultColor}
		pack.title=`🔭 Data Report From ${msg.author.username.replace(/_/g,'\\_')} Observatory`
		
		pack.fields=[
			{name: '📋Galaxy Short Name', value: '​\t  '+target.username, inline: true},
			{name: '🌌Universal Reference', value: '​\t  '+`O${glx.id.substr(1,2)+this.self.generateRef(''+this.self.generateRef(glx.id)+'')}-GX`, inline: true},
			{name: '🎆Energy Sources', value: '​\t  '+glx.ticket, inline: true},
			{name: '✨Population', value: '​\t  '+`${glx.stars} stars`, inline: true},
			{name: '📏Galaxy Radius', value: '​\t  '+this.self.radiusOf(glx)+' ly', inline: true},
			{name: '🔗Galaxy Cohesion Index', value: '​\t  '+this.self.densityOf(glx), inline: true},
			{name: '⌛Galaxy Age', value: '​\t  '+Math.floor(Date.now()/100-glx.age*10)+' yo', inline: true},
			{name: '⏳Last Activity', value: '​\t  '+(Math.max(0,Math.floor(900+Date.now()/100-glx.cd*10))+' years ago').replace(/^0\syears\sago/g,'now'), inline: true},
			{name: '🌟Galaxies Absorbed Till Now', value: '​\t  '+glx.annexed+' galaxies', inline: true}
		]
		this.embed(msg,pack)
	}, {
		aliases: ['whois'],
		usages: ['nnstats','nnstats <user>'],
		description: 'shows your status or the status of a galaxy (inter-server proof)'
	})
}
