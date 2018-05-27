var rq=require('request')
TagRunner=require('../src/TagRunner')

module.exports = (self) => {
	self.registerCommand('tags', function (msg, args) {
		if(!args[0]) return this.send(msg,'Missing argument')

		switch(args[0]){
			case 'test': if(!args[1]) return this.send(msg,'Missing argument')
				var tag=new TagRunner(msg,{code: args.splice(1).join(' '), name: 'test', author: msg.author.id, args: args.slice(2)},self)
				return this.send(msg,String.fromCharCode(8203)+tag.process().content)
				break

			case 'create': if(!args[1]) return this.send(msg,'Missing argument')
				var tagname=args[1].replace(/^\W|\W$|[^\w-]/g,'')
				if(tagname.length>15 || !tagname) return this.send(msg,'Invalid tag name (tag names have to be shorter than 15 characters)')
				var tagFile
				try{
					tagFile=JSON.parse(fs.readFileSync(`./tags/tags/${tagname}.json`))
					return this.send(msg,'This tag already exists')
				}catch(err){
					tagFile={uses: 0, tagName: tagname, author: msg.author.id, created: Date.now()/1000, edited: 'created'}
				}
				if(args.slice(2).join(' ')){
					tagFile.code=args.slice(2).join(' ')
					fs.writeFileSync(`./tags/tags/${tagname}.json`,JSON.stringify(tagFile))
					return this.send(msg,'Tag created!')
				}else if(msg.attachments.filter(x=>/\.txt$/.test(x.url)).length){
					rq.get(msg.attachments.filter(x=>/\.txt$/.test(x.url))[0].url,(error,response,body)=>{
						if(error) return this.send(msg,'Error while reading the file')
						tagFile.code=body
						fs.writeFileSync(`./tags/tags/${tagname}.json`,JSON.stringify(tagFile))
					})
				}
				else{
					return this.send(msg,'Missing argument or text file')
				}
				break

			case 'edit': if(!args[1]) return this.send(msg,'Missing argument')
				var tagname=args[1].replace(/^\W|\W$|[^\w-]/g,'')
				var tagFile
				try{
					tagFile=JSON.parse(fs.readFileSync(`./tags/tags/${tagname}.json`))
					if(tagFile.author!=msg.author.id) return this.send(msg,'You dont own this tag')
				}catch(err){
					return this.send(msg,'This tag doesnt exist')
				}
				if(args.slice(2).join(' ')){
					tagFile.code=args.slice(2).join(' ')
					tagFile.edited=Date.now()/1000
					fs.writeFileSync(`./tags/tags/${tagname}.json`,JSON.stringify(tagFile))
					return this.send(msg,'Tag edited!')
				}else if(msg.attachments.filter(x=>/\.txt$/.test(x.url)).length){
					rq.get(msg.attachments.filter(x=>/\.txt$/.test(x.url))[0].url,(error,response,body)=>{
						if(error) return this.send(msg,'Error while reading the file')
						tagFile.code=body
						tagFile.edited=Date.now()/1000
						fs.writeFileSync(`./tags/tags/${tagname}.json`,JSON.stringify(tagFile))
						this.send(msg,`Tag edited!`)
					})
				}
				else{
					return this.send(msg,'Missing argument or text file')
				}
				break

			case 'delete': if(!args[1]) return this.send(msg,'Missing argument')
				var tagname=args[1].replace(/^\W|\W$|[^\w-]/g,'')
				var tagFile
				try{
					tagFile=JSON.parse(fs.readFileSync(`./tags/tags/${tagname}.json`))
					if(tagFile.author!=msg.author.id) return this.send(msg,'You dont own this tag')
					fs.rename(`./tags/tags/${tagname}.json`,'TAG_TRASH',(err)=>{
						if(err) return this.send(msg,'Error while removing your tag')
						return this.send(msg,`Tag deleted!`)
					})
				}catch(err){
					return this.send(msg,'This tag doesnt exist')
				}
				break

			case 'search': if(!args[1]) return this.send(msg,'Missing argument')
				var tagname=args[1].replace(/^\W|\W$|[^\w-]/g,'')
				var pg=Math.max(1,parseInt(args[2]) || 1)
				var tags=fs.readdirSync('./tags/tags').map(x=> x.replace(/\.json$/g,'')).filter(x => x.includes(tagname)).slice((pg-1)*50,50+(pg-1)*50)
				if(tags.length) return this.send(msg,'Some tags from page '+pg+' of your search:\n`'+tags.join('` | `').replace(/_/g,'\\_').replace(/\.json$/g,'')+'`')
				return this.send(msg,'No result on this page')
				break

			case 'raw': if(!args[1]) return this.send(msg,'Missing argument')
				var tagname=args[1].replace(/^\W|\W$|[^\w-]/g,'')
				var tagFile
				try{
					tagFile=JSON.parse(fs.readFileSync(`./tags/tags/${tagname}.json`))
					this.self.createMessage(msg.channel.id,'Here is the raw code you were looking for:',{name: tagFile.tagName+'.txt', file: Buffer.from(tagFile.code,'utf8')})
				}catch(err){
					return this.send(msg,'This tag doesnt exist')
				}
				break

			case 'list': var trg=(args.filter(x=>!x.startsWith('--page='))[1])?args.slice(1).filter(x=>!x.startsWith('--page=')).join(' '):msg.author.id
				var trg=(this.findMember(msg,trg) || msg.author).id
				var tags=[]
				fs.readdirSync('./tags/tags').forEach(x=>tags.push(JSON.parse(fs.readFileSync('./tags/tags/'+x))))
				tags=tags.filter(t=> t.author==trg)
				if(!tags.length) return this.send(msg,'The user '+this.self.users.get(trg).username.replace(/([*_~`])/,'\\$1')+' doesnt own any tag')
				var pg=args.join(' ').includes('--page=')?Math.max(parseInt(args.filter(x=>x.startsWith('--page='))[0].replace(/^--page=/,'')) || 1,1):1
				tags=tags.slice((pg-1)*50,50+(pg-1)*50)
				if(tags.length) return this.send(msg,'List of tags '+this.self.users.get(trg).username.replace(/([*_~`])/,'\\$1')+' made (Page '+pg+'):\n`'+tags.map(x=> x.tagName.replace(/([*_~`])/,'\\$1')).join('` | `').replace(/_/g,'\\_').replace(/\.json$/g,'')+'`')
				return this.send(msg,'Page '+pg+' from the list of tags '+this.self.users.get(trg).username.replace(/([*_~`])/,'\\$1')+' made is empty')
				break

			case 'info': if(!args[1]) return this.send(msg,'Missing argument')
				var tagname=args[1].replace(/^\W|\W$|[^\w-]/g,'')
				var tagFile
				var relateTime=(time)=>{
					if(time=='created') return 'never got edited'
					time=Math.floor(Date.now()/1000-time)
					var sD=60*60*24, sH=60*60, sM=60
					var d=Math.floor(time/sD), h=Math.floor((time%sD)/sH), m=Math.floor((time%sH)/60), s=time%sM
					var time=(d?d+'d ':'')+(h?h+'h ':'')+(m?m+'mn ':'')
					time+=s?s+'s ':(time?'':0+'s ')
					return time+'ago'
				}
				try{
					tagFile=JSON.parse(fs.readFileSync(`./tags/tags/${tagname}.json`))
					var ans=`**Tag**: ${tagname}\n**Author**: ${(this.self.users.get(tagFile.author))?this.self.users.get(tagFile.author).username.replace(/([*_~`])/,'\\$1')+'#'+this.self.users.get(tagFile.author).discriminator:'`Unknown user`'}\n**Uses**: ${tagFile.uses}\n**Created**: ${relateTime(tagFile.created)}\n**Edited**: ${relateTime(tagFile.edited)}`
					this.send(msg,'__Displaying info on a tag__\n'+ans)
				}catch(err){
					return this.send(msg,'This tag doesnt exist')
				}
				break

			default: var tagname=args[0].replace(/^\W|\W$|[^\w-]/g,'')
				var tagFile
				try{
					tagFile=JSON.parse(fs.readFileSync(`./tags/tags/${tagname}.json`))
					var tag=new TagRunner(msg,{code: tagFile.code, name: tagFile.tagName, author: tagFile.author, args: args.slice(1)},self)
					tagFile.uses+=1
					fs.writeFileSync(`./tags/tags/${tagname}.json`,JSON.stringify(tagFile))
					return this.send(msg,String.fromCharCode(8203)+tag.process().content)
				}catch(err){
					console.log(err)
					return this.send(msg,'This tag doesnt exist')
				}
				break
		}

	},{
		aliases: ['t','cc','tag','customcommand'],
		description: 'runs custom commands able to process a set of available functions',
		filter: 'misc',
		usages: ['nntags <tagName> [<args>]','nntags edit <tagName> <txtFile OR code>','nntags create <tagName> <txtFile OR code>','nntags delete <tagName>','nntags test <code>','nntags raw <tagName>','nntags info <tagName>','nntags search <query>']
	})
}
