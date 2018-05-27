/*
	Eval. Evaluates a snippet of javascript code.
*/
const util = require('util')

module.exports = (self) => {
	self.registerCommand('eval', function (msg, args) {

		// Delete the msg, create a new one, and then eval
		let evaled = ''
			try {
				evaled = eval(args.join(' ')) // eslint-disable-line no-eval
				if (Array.isArray(evaled) || typeof evaled === 'object') { evaled = util.inspect(evaled,{depth: 1}) }
			} catch (err) {
				this.log.err(err, 'Eval')
				return this.send(msg, 'There was an error! Check console.')
			}
			
			feedBack=[
				'```js',
				typeof (evaled) === 'string' ? evaled.replace(/`/g, '`' + String.fromCharCode(8203)) : evaled,
				'```'
			].join('\n')
			
			if(!msg.author.bot)this.self.createMessage(msg.channel.id,feedBack)
			if(this.self.evalch!==msg.channel.id && msg.author.id!==this.self.owner) this.self.createMessage(self.evalch,feedBack)
	}, {admin: true})
}
