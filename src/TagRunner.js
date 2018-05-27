class TagRunner {

	constructor (msg, tag, self, stats) {
		this.container=require('./../tags/functions.js')
		this.self=self
		this.msg=msg
		this.code=tag.code
		this.author=tag.author
		this.args=tag.args || []
		this.name=tag.name
		this.answer=tag.answer || []
		this.lpos=[]
		this.stats=stats || {exec: 0, inject: ''}
	}

	process(inject){
		if(inject) this.code=inject
		if(!this.checkBraces()) return {code: false, content: 'unclosed brace'}
		return {code: true, content: this.splitTag(this.code)}
	}

	checkBraces(){
		return true


		var balance=0
		for(var idx=0;idx<this.code.length;idx++){
			switch(this.code.charAt(idx)){
				case '{': balance++
					break
				case '}': balance--
					break
			}
			if(balance<0) return false
		}
		return true
	}

	splitTag(code){
		var feedBack=''
		for(var idx=0; idx<code.length; idx++){
			if(code.charAt(idx)=='{'){
				var balance=1
				for(var idx2=idx+1;idx2<code.length;idx2++){
					if(code.charAt(idx2)=='{') balance++
					if(code.charAt(idx2)=='}') balance--
					if(code.charAt(idx2)=='}' && balance==0){
						feedBack+=this.runFunc(code.substring(idx+1,idx2))
						idx=idx2
						break
					}
				}
			}
			else{
				feedBack+=code.charAt(idx)
			}
		}
		return feedBack
	}

	alter(params){
    params=params||{}
    var feedBack=new TagRunner(null,{})
    Object.keys(this).filter(x=>{
      return !'container lpos'.includes(x)
    }).forEach(x=>{
      feedBack[x]=(params[x]==undefined)?this[x]:params[x]
    })
    return feedBack
	}

	runFunc(func){
		var feedBack=''
		func+=';'
		var idx=0
		var balance=0
		while(idx<func.length-1 && (func.charAt(idx)!=';' || balance!=0)){
			idx++
			if(func.charAt(idx)=='{') balance++
			if(func.charAt(idx)=='}') balance--
		}
		var funcName=func.substring(0,idx)
		var funcArgs=[]
		var arglidx=funcName.length+1
		for(idx=funcName.length+1;idx<func.length;idx++){
			if(func.charAt(idx)==';' && balance==0){
				funcArgs.push(func.substring(arglidx,idx).trim())
				arglidx=idx+1
			}
			if(func.charAt(idx)=='{') balance++
			if(func.charAt(idx)=='}') balance--
		}

		funcName=this.splitTag(funcName.trim())
		if(this.container[funcName]){
			feedBack+=this.container[funcName](funcArgs,this)
		}
		else{
			feedBack+='`Invalid tag name`'
		}
		return feedBack
	}


}

module.exports = TagRunner
