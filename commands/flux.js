module.exports = (self) => {
	self.registerCommand('flux', function (msg, args) {
		
	
	if(!args[0]) return this.send(msg,'missing arguments `<action>` `<channel_id>`')
	if(args[0]==='list') return this.send(msg,'list of channels flux are turned on for:\n'+this.self.fluxch)
	if(args[0]==='on'){
		if(!args[1]) return this.send(msg,'missing arguments `<channel_id>`')
		chn=this.self.getChannel(args[1])
		if(!chn) return this.send(msg,`invalid channel id ${args[1]}`)
		chn=chn.id
		if(chn===this.self.postch) return this.send(msg,'cant turning on flux from the ouput channel')
		if((new RegExp(chn,'g').test(this.self.fluxch))) return this.send(msg,`already turned on flux from ${chn}`)
		this.send(msg,`successfully turned on flux from ${chn}`)
		return this.self.fluxch+=`	${chn}`
	}
	if(args[0]==='off'){
		if(!args[1]) return this.send(msg,'missing arguments `<channel_id>`')
		chn=args[1]
		if(chn==='all'){
			if(this.self.fluxch==='') return this.send(msg,'there is no flux to turn off')
			 chn=chn.replace(/all/g,this.self.fluxch)
		}else{
			chn=this.self.getChannel(chn)
			if(!chn) return this.send(msg,`invalid channel id ${args[1]}`)
			chn=chn.id
		}
		if(!(new RegExp(chn,'g').test(this.self.fluxch))) return this.send(msg,`there is no turned-on flux from ${chn}`)
		if(chn===this.self.phonech) return this.send(msg,'cant stop receiving flux from the linked channel')
		this.self.fluxch=this.self.fluxch.replace(new RegExp(chn,'g'),'')
		return this.send(msg,`successfully turned off flux from ${args[1]}`)
	}
	return this.send(msg,'command usage is `nnflux <on|off> <channel_id|all>`')
		
	}, {
		deleteAfter: false,
		admin: true
	})
}