module.exports = (self) => {
	self.registerCommand('link', function (msg, args) {
	
	
			
		if(!args[0]) return this.send(msg,"missing argument, command usage is `nnlink <channel_id|stop>`")
		post=this.self.getChannel(this.self.postch)
		if(args[0]==='stop'){
			if(this.self.phonech===this.self.postch) return this.send(msg,'no channel linked yet')
			post.edit({name: post.name.replace('_linked',''), topic: ''})
			this.send(msg,`${this.self.phonech} wont be able to read messages from the output channel anymore`)
			this.self.phonech=this.self.postch
			return
		}
		chn=this.self.getChannel(args[0])
		if(!chn) return this.send(msg,'invalid channel id '+args[0])
		chn=chn.id
		if(chn===this.self.postch) return this.send(msg,'cant link the output channel to itself')
		if(this.self.phonech!==this.self.postch) return this.send(msg,"there already is a linked channel")
		this.self.phonech=chn
		chon=this.self.getChannel(chn)
		post.edit({name: post.name.replace(new RegExp('_linked','g'),'')+'_linked', topic: `guild: ${chon.guild?chon.guild.name:'none'} (${chon.guild?chon.guild.id:'none'}), channel: ${chon.guild?chon.name:'DM'} (${chon.id})`})
		this.send(msg,`successfully linked ${chn} to the output channel, waiting for messages`)
		
	}, {
		deleteAfter: false,
		admin: true
	})
}