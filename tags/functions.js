const fs=require('fs')
const tm=require('moment')

var container={}


container['aget']=(args,context)=>{
	var varname=context.splitTag(args[0]||'')
	var varcontent=context.splitTag(args[1] || '')
	if(!varname) return '`Invalid variable name`'
	var authVar
	try{
		authVar=JSON.parse(fs.readFileSync('./tags/vars/'+context.author+'.json'))
		return (authVar[varname])||varcontent
	}catch(err){
		return varcontent
	}
}

container['aset']=(args,context)=>{
	var varname=context.splitTag(args[0]||'')
	var varcontent=context.splitTag(args[1] || '')
	if(!varname) return '`Invalid variable name`'
	var authVar
	try{
		authVar=JSON.parse(fs.readFileSync('./tags/vars/'+context.author+'.json'))
		if(!authVar[varname] && Object.keys(authVar)>=5000) return '`var limit reached`'
		authVar[varname]=varcontent
	}catch(err){
		authVar={}
		authVar[varname]=varcontent
	}
	if(!varcontent) delete authVar[varname]
	fs.writeFileSync('./tags/vars/'+context.author+'.json',JSON.stringify(authVar),'utf8')
	return ''
}

container['avars']=(args,context)=>{
	var varIdx=context.splitTag(args[0]||'')
	var authVar={}
	try{
		authVar=JSON.parse(fs.readFileSync('./tags/vars/'+context.author+'.json'))
	}catch(err){}
	if(isNaN(varIdx) || varIdx===''){
		return Object.keys(authVar).length
	}else{
		return Object.keys(authVar)[varIdx*1] || ''
	}
}

container['vars']=(args,context)=>{
	var varIdx=context.splitTag(args[0]||'')
	var authVar={}
	try{
		authVar=JSON.parse(fs.readFileSync('./tags/vars/tag'+context.name+'.json'))
	}catch(err){}
	if(isNaN(varIdx) || varIdx===''){
		return Object.keys(authVar).length
	}else{
		return Object.keys(authVar)[varIdx*1] || ''
	}
}

container['get']=(args,context)=>{
	var varname=context.splitTag(args[0]||'')
	var varcontent=context.splitTag(args[1] || '')
	if(!varname) return '`Invalid variable name`'
	var authVar
	try{
		authVar=JSON.parse(fs.readFileSync('./tags/vars/tag'+context.name+'.json'))
		return (authVar[varname])||varcontent
	}catch(err){
		return varcontent
	}
}

container['set']=(args,context)=>{
	var varname=context.splitTag(args[0]||'')
	var varcontent=context.splitTag(args[1] || '')
	if(!varname) return '`Invalid variable name`'
	var authVar
	try{
		authVar=JSON.parse(fs.readFileSync('./tags/vars/tag'+context.name+'.json'))
		if(!authVar[varname] && Object.keys(authVar)>=5000) return '`var limit reached`'
		authVar[varname]=varcontent
	}catch(err){
		authVar={}
		authVar[varname]=varcontent
	}
	if(!varcontent) delete authVar[varname]
	fs.writeFileSync('./tags/vars/tag'+context.name+'.json',JSON.stringify(authVar),'utf8')
	return ''
}

container['lb']=()=>{
	return '{'
}

container['rb']=()=>{
	return '}'
}

container['nl']=()=>{
	return '\n'
}

container['semi']=()=>{
    return ';'
}

container['space']=(args,context)=>{
	if(!args[0]) return ' '
	var nbSpaces=context.splitTag(args[0])
	if(!isNaN(nbSpaces*1)) return ' '.repeat(nbSpaces*1)
	return ' '
}

container['argslen']=(args,context)=>{
	return context.args.length
}

container['args']=(args,context)=>{
	var firstIdxx=context.splitTag(args[0]||'x')*1
	var firstIdx=(isNaN(firstIdxx))?0:firstIdxx
	var lastIdx=context.splitTag(args[1]||'x')*1
	if(isNaN(lastIdx)){
		if(isNaN(firstIdxx)){
			lastIdx=context.args.length
		}else{
			lastIdx=firstIdx+1
		}
	}else{
		lastIdx=Math.max(firstIdx+1,lastIdx)
	}
	return context.args.slice(firstIdx,lastIdx).join(' ')
}

container['length']=(args,context)=>{
	str=context.splitTag(args[0]||'')
	return str.length
}

container['lower']=(args,context)=>{
	return context.splitTag(args[0]||'').toLowerCase()
}

container['upper']=(args,context)=>{
	return context.splitTag(args[0]||'').toUpperCase()
}

container['substr']=(args,context)=>{
	if(!args[0]) return ''
	var str=context.splitTag(args[0])
	var firstIdx=context.splitTag(args[1]||'x')*1
	firstIdx=isNaN(firstIdx)?0:firstIdx
	var lastIdx=context.splitTag(args[2]||'x')*1
	lastIdx=isNaN(lastIdx)?str.length:lastIdx
	return str.substr(firstIdx,lastIdx)
}

container['if']=(args,context)=>{
	var sign=context.splitTag(args[0]||'')
	var left=context.splitTag(args[1]||'')
	var right=context.splitTag(args[2]||'')
	var res
	switch(sign){
		case '==': res=(left.replace(/^0*(.?\d)/,'$1')==right.replace(/^0*(.?\d)/,'$1') || left*1==right*1)
			break
		case '===': res=(left==right)
			break
		case '<': res=(left.replace(/^0*(.?\d)/,'$1')*1<right.replace(/^0*(.?\d)/,'$1')*1)
			break
		case '>': res=(left.replace(/^0*(.?\d)/,'$1')*1<right.replace(/^0*(.?\d)/,'$1')*1)
			break
		case '<=': res=(left.replace(/^0*(.?\d)/,'$1')*1<=right.replace(/^0*(.?\d)/,'$1')*1)
			break
		case '>=': res=(left.replace(/^0*(.?\d)/,'$1')*1>=right.replace(/^0*(.?\d)/,'$1')*1)
			break
		case '!=': res=(left.replace(/^0*(.?\d)/,'$1')!=right.replace(/^0*(.?\d)/,'$1'))
			break
		default: return '`Invalid operator`'
	}
	if(res){
		return context.splitTag(args[3]||'')
	}
	return context.splitTag(args[4]||'')



	return ''
}

container['inject']=(args,context)=>{
	if(context.stats.inject==context.name) return '`unable to run a nested inject in the same tag`'
	var oldinject=context.stats.inject
	context.stats.inject=context.name
	var injected=context.splitTag(context.splitTag(args[0]||''))
	context.stats.inject=oldinject
  return injected
}

container['userid']=(args,context)=>{
  if(!args[0]) return context.msg.author.id
  var arg=context.splitTag(args[0])
  var usrs=arg.match(/\<@!?\d{17,19}\>/g)
  if(usrs){
        var usrr=usrs.find(x => context.msg.channel.guild.members.get(x.replace(/\D+/g,''))).replace(/\D+/g,'')
        if(usrr) return context.msg.channel.guild.members.get(usrr).user.id
    }
  for(var i=0; i<arg.length-17; i++){
        var usrr=context.msg.channel.guild.members.get(arg.substr(i,18)) || context.msg.channel.guild.members.get(arg.substr(i,17)) || context.msg.channel.guild.members.get(arg.substr(i,19))
        if(usrr) return usrr.user.id
    }
  return '`User not found`'
}

container['username']=(args,context)=>{
  if(!args[0]) return context.msg.author.username
  var arg=context.splitTag(args[0])
  var usrs=arg.match(/\<@!?\d{17,19}\>/g)
  if(usrs){
        var usrr=usrs.find(x => context.msg.channel.guild.members.get(x.replace(/\D+/g,''))).replace(/\D+/g,'')
        if(usrr) return context.msg.channel.guild.members.get(usrr).user.username
    }
  for(var i=0; i<arg.length-17; i++){
        var usrr=context.msg.channel.guild.members.get(arg.substr(i,18)) || context.msg.channel.guild.members.get(arg.substr(i,17)) || context.msg.channel.guild.members.get(arg.substr(i,19))
        if(usrr) return usrr.user.username
    }
  return '`User not found`'
}

container['usernick']=(args,context)=>{
  if(!args[0]) return context.msg.member.nick || context.msg.author.username
  var arg=context.splitTag(args[0])
  var usrs=arg.match(/\<@!?\d{17,19}\>/g)
  if(usrs){
        var usrr=usrs.find(x => context.msg.channel.guild.members.get(x.replace(/\D+/g,''))).replace(/\D+/g,'')
        if(usrr) return context.msg.channel.guild.members.get(usrr).nick || context.msg.channel.guild.members.get(usrr).user.username
    }
  for(var i=0; i<arg.length-17; i++){
        var usrr=context.msg.channel.guild.members.get(arg.substr(i,18)) || context.msg.channel.guild.members.get(arg.substr(i,17)) || context.msg.channel.guild.members.get(arg.substr(i,19))
        if(usrr) return usrr.nick || usrr.user.username
    }
  return '`User not found`'
}

container['switch']=(args,context)=>{
	var comp=context.splitTag(args[0]||'')
	if(args.length<2) return context.splitTag(args[1]||'')
	for(var i=0;i<Math.floor((args.length-1)/2);i++){
		if(comp==context.splitTag(args[i*2+1])) return context.splitTag(args[i*2+2])
	}

	return ((args.length-1)%2)?context.splitTag(args[args.length-1]):''
}

container['base']=(args,context)=>{
	var radx1=parseInt(context.splitTag(args[1] || '10'),10)
	var bs1=parseInt(context.splitTag(args[0] || ''),radx1)
	var radx2=parseInt(context.splitTag(args[2] || '10'),10)
	if(isNaN(radx1) || radx1>36 || radx1<2) return '`Invalid radix`'
	if(isNaN(radx2) || radx2>36 || radx2<2) return '`Invalid radix`'
	var eq=bs1.toString(radx2)
	return eq
}

container['randint']=(args,context)=>{
	var min=parseInt(context.splitTag(args[0]||''),10)
	min=Math.floor(isNaN(min)?0:min)
	var max=parseInt(context.splitTag(args[1]||''),10)
	max=Math.floor(isNaN(max)?10:max)
	if(max<min) return Math.floor(Math.random()*10)
	return Math.floor(Math.random()*(max-min)+min)
}

container['randchoice']=(args,context)=>{
	if(!args.length) return ''
	return context.splitTag(args[Math.floor(Math.random()*args.length)])
}

container['randstr']=(args,context)=>{
	var list=context.splitTag(args[0]||'').split('')
	var amount=parseInt(context.splitTag(args[1]||''),10)
	if(isNaN(amount) || amount<1) return ''
	var anss=''
	for(var tm=0;tm<amount;tm++) anss+=list[Math.floor(Math.random()*list.length)]
	return anss

}

container['randarg']=(args,context)=>{
	if(!context.args.length) return ''
	return context.args[Math.floor(Math.random()*context.args.length)]
}

container['channelid']=(args,context)=>{
  return context.msg.channel.id
}

container['channelname']=(args,context)=>{
  return context.msg.channel.name
}

container['serverid']=(args,context)=>{
  return context.msg.channel.guild.id
}

container['servername']=(args,context)=>{
  return context.msg.channel.guild.name
}

container['serverusers']=(args,context)=>{
  return context.msg.channel.guild.members.size
}

container['randuser']=(args,context)=>{
  return context.msg.channel.guild.members.map(x => x.id)[Math.floor(Math.random()*context.msg.channel.guild.members.size)]
}

container['sort']=(args,context)=>{
  var sep=context.splitTag(args[1]||'')
  var list=context.splitTag(args[0]||'').split(sep)
  for(var ststep=0;ststep<list.length-1;ststep++){
    var mxx=ststep
    for(var stlook=ststep+1;stlook<list.length;stlook++){
    	if(isNaN(list[mxx]) || list[stlook]>parseInt(list[mxx],10)) mxx=stlook
    }
    var tmp=list[ststep]
    list[ststep]=list[mxx]
    list[mxx]=tmp
  }
  return list.join(sep)
}

container['randcase']=(args,context)=>{
  var str=context.splitTag(args[0]||'').split('')
  for(var stri=0;stri<str.length;stri++){
    str[stri]=Math.random()<0.5?str[stri].toLowerCase():str[stri].toUpperCase()
  }
  return str.join('')
}

container['regexreplace']=(args,context)=>{
	var strf=context.splitTag(args[0]||'')
	var strt=context.splitTag(args[2]||'')
  var regexp=context.splitTag(args[1]||'')
  if(!/^(\/.*[^\\]\/[gmi]{0,3}?)?$/.test(regexp)) return '`Invalid regular expression`'
  var flags=regexp.replace(/^.*\/([gmi]{0,3}?)$/,'$1')
  regexp=regexp.replace(/^\/(.+)\/[gmi]{0,3}?$/,'$1')
  try{
    return strf.replace(new RegExp(regexp,flags),strt)
  }catch(err){
    return '`Invalid regular expression`'
  }
}

container['channeltopic']=(args,context)=>{
	return context.msg.channel.topic || ''
}

container['repeat']=(args,context)=>{
  var nb=parseInt(context.splitTag(args[1]),10)
  if(isNaN(nb) || nb<0) nb=0
  return context.splitTag(args[0]||'').repeat(nb)
}

container['reverse']=(args,context)=>{
	return context.splitTag(args[0]||'').split('').reverse().join('')
}

container['shuffle']=(args,context)=>{
  str=context.splitTag(args[0]||'').split('')
  for(var shf=0;shf<str.length;shf++){
		var alt=Math.floor(Math.random()*str.length)
    var tmp=str[alt]
    str[alt]=str[shf]
    str[shf]=tmp
    }
  return str.join('')
}

container['indexof']=(args,context)=>{
  var str=context.splitTag(args[0]||'')
  var qr=context.splitTag(args[1]||'')
  return ''+str.indexOf(qr)
}

container['lastindexof']=(args,context)=>{
  var str=context.splitTag(args[0]||'')
  var qr=context.splitTag(args[1]||'')
  return ''+str.lastIndexOf(qr)
}

container['i']=(args,context)=>{
  var idx=parseInt(context.splitTag(args[0]||''),10) || 0
  return ''+(isNaN(context.lpos[idx])?'':context.lpos[idx])
}

container['loop']=(args,context)=>{
  if(!args[2]) return ''
  var times=parseInt(context.splitTag(args[1] ||''),10) || 1
  times=times>100?100:times
  var firstIdx=parseInt(context.splitTag(args[0]||''),10) || 0
  var idx=context.lpos.length
  var code=args[2]
  if(idx!=3) context.lpos.push(firstIdx)
  var ans=[]
  for(var i=0;i<times;i++){
  	if(idx!=3){
      context.lpos[idx]=i+firstIdx
    }
    ans.push(context.splitTag(code))

    }
	if(idx!=3) context.lpos.pop()
  return ans.join(context.splitTag(args[3]||''))
}

container['incr']=(args,context)=>{
  var base=parseInt(context.splitTag(args[0]||''),10) || 0
  var step=parseInt(context.splitTag(args[1]||''),10)
  step=isNaN(step)?1:step
  return (base+step)
}

container['decr']=(args,context)=>{
  var base=parseInt(context.splitTag(args[0]||''),10) || 0
  var step=parseInt(context.splitTag(args[1]||''),10)
  step=isNaN(step)?1:step
  return (base-step)
}

container['count']=(args,context)=>{
	var str=context.splitTag(args[0]||'')
	var qr=context.splitTag(args[1]||'')
	return str.split(qr).length-1
}

container['time']=(args,context)=>{
	var how=context.splitTag(args[0]||'')
	var when=context.splitTag(args[1]||'')
	how=how?how:'MM/DD/YYYY HH:m:s'
	if(['now',''].includes(when)) when=Date.now()
	when=parseInt(when)
	return tm(when).format(how)
}

container['wait']=(args,context)=>{
	if(context.answer.length) return '`Unable to wait twice`'
  var resp=args[0]||''
  var noresp=args[1]||''
  const TagRunner=require('../src/TagRunner')
  var tagR=context.alter({code: resp})
  var tagN=context.alter({code: noresp})
  context.self.answers[context.msg.channel.id+'-'+context.msg.author.id]=tagR
	setTimeout(()=>{
  	if(!context.self.answers[context.msg.channel.id+'-'+context.msg.author.id] || context.self.answers[context.msg.channel.id+'-'+context.msg.author.id].msg.id!=context.msg.id) return
    context.self.createMessage(context.msg.channel.id,String.fromCharCode(8203)+tagN.process().content)
		delete context.self.answers[context.msg.channel.id+'-'+context.msg.author.id]
  },30000)
  return ''
}

container['expr']=(args,context)=>{
  var expr=context.splitTag(args[0]||'').replace(/true/g,'1').replace(/false/g,'0').replace(/(\d)e([+-]?\d)/g,'$1*10^$2').replace(/Infinity/g,'2^1024').replace(/([A-Z]\w*)/gi,'Math.$1')
  if(/[^<>]=[^=<]|=$|^=/.test(expr)) throw '`Invalid token in expression`'
  try{
    var res=eval(expr.replace(/\^/g,'**'))
    if(isNaN(res)) return 'NaN'
    return ''+res*1
  }catch(err){
    console.log(err)
    return '`Invalid token in expression`'
  }
}

container['answer']=(args,context)=>{
	var firstIdxx=context.splitTag(args[0]||'x')*1
	var firstIdx=(isNaN(firstIdxx))?0:firstIdxx
	var lastIdx=context.splitTag(args[1]||'x')*1
	if(isNaN(lastIdx)){
		if(isNaN(firstIdxx)){
			lastIdx=context.answer.length
		}else{
			lastIdx=firstIdx+1
		}
	}else{
		lastIdx=Math.max(firstIdx+1,lastIdx)
	}
	return context.answer.slice(firstIdx,lastIdx).join(' ')
}

container['anslen']=(args,context)=>{
	return context.answer.length
}

container['exec']=(args,context)=>{
    var path=context.splitTag(args.shift()||'').replace(/^\W|\W$|[^\w-]/g,'')
    var tagArgs=[]
    args.forEach(x => tagArgs.push(context.splitTag(x||'')))
    if(context.stats.exec==100) return '`exec limit reached`'
    try{
        var tagFile=JSON.parse(fs.readFileSync(`./tags/tags/${path}.json`))
        var tag=context.alter({code: tagFile.code, name: tagFile.tagName, author: tagFile.author, args: tagArgs})
        context.stats.exec++
        return tag.process().content
    }catch(err){
        return '`This tag doesnt exist`'
    }
}

container['comment']=()=>{
	return ''
}


module.exports = container
