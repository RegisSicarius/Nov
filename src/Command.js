/*
  Created by TheRacingLion (https://github.com/TheRacingLion) [ 03 / 03 / 2017 ]
  -*Read LICENSE to know more about permissions*-

  Command class. Everything that is needed to build a command on this selfbot.
*/
const Logger = require('./plugins/Logger.js')

class Command {
  constructor (self, name, generator, options) {
    this.self = self
    this.constants = self.constants
    this.config = self.config
    this.log = Logger
    this.defaultColor = parseInt(this.config.defaultEmbedColor.replace('#', ''), 16)

    this.name = name || ''
    this.aliases = (options.aliases)?'`'+options.aliases.join('`\n`')+'`':'no alias for this command'
    this.perms = options.perms || []
    this.deleteAfter = options.deleteAfter || this.config.deleteCommandMessages
    this.noPms = !!options.noPms
	this.admin = !!options.admin
	this.description=options.description || 'no description for this command'
	this.usages=(options.usages)?'`'+options.usages.join('`\n`')+'`':'no information about usages'
	this.needs=options.needs||0

    if (typeof generator === 'function') {
      this.run = generator.bind(this)
    } else {
      throw new Error('Invalid command function')
    }
  }

  process (msg, args) {
    // Check if owner is the author
    // Check if msg is private
	if(!this.self.admins.includes(msg.author.id) && this.admin && (msg.member.permission.allow&((this.needs||0)+(this.needs?8:0)))==0) return
    if (!msg.channel.guild && this.noPMs == true) {
      this.send(msg, 'This command is disabled in PMs!', 5000)
      return
    }
    // Check if author has the required permissions
    if (this.perms.length > 0) {
      if (!msg.channel.guild) {
        this.send(msg, 'This is a server only command!', 5000)
        return
      }
      const authorPerms = msg.channel.permissionsOf(msg.author.id).json
      for (let perm in this.perms) {
        if (!authorPerms[this.perms[perm]]) {
          this.send(msg, `Missing permissions. (${this.perms[perm]})`, 5000)
          return
        }
      }
    }
    // Run command
    try {
      this.run(msg, args.filter(x => !!x))
    } catch (err) {
      this.log.err(err, `${this.name.toUpperCase()} on run`)
      this.send(msg, 'Something bad happened.', 5000)
      return
    }
  }

  send (msg, content, deleteDelay = 0) {
    deleteDelay = deleteDelay || this.config.deleteCommandMessagesTime
    if (content.length > 2000) {
      this.log.err('Error sending a message larger than the limit (2000+)')
      return
    }
    return new Promise((resolve, reject) => {
      this.self.createMessage(msg.channel.id, content)
      .then(m => {
        this.self.counts.msgsSent = this.self.counts.msgsSent + 1
        return resolve(m)
      })
      .catch(reject)
    })
  }

  embed (msg, embed = {}, deleteDelay = 0) {
    deleteDelay = deleteDelay || this.config.deleteCommandMessagesTime
    if (!embed.color) embed.color = this.defaultColor
    return new Promise((resolve, reject) => {
      this.self.createMessage(msg.channel.id, { content: '', embed: embed })
      .then(m => {
        this.self.counts.msgsSent = this.self.counts.msgsSent + 1
        return resolve(m)
      })
      .catch(x=> this.send(msg,'I cant do that, I need embed permission!'))
    })
  }

  edit (msg, content, deleteDelay = 0) {
    deleteDelay = deleteDelay || this.config.deleteCommandMessagesTime
    if (content.length > 2000) {
      this.log.err('Error sending a message larger than the limit (2000+)')
      return
    }
    return new Promise((resolve, reject) => {
      this.self.editMessage(msg.channel.id, msg.id, content)
      .then(m => {
        return resolve(m)
      })
      .catch(reject)
    })
  }

  findMember (msg, str) {
    if (!str || str === '') return false
    const guild = msg.channel.guild
    if (!guild) return msg.mentions[0] ? msg.mentions[0] : false
    if (/^\d{17,18}/.test(str) || /^<@!?\d{17,18}>/.test(str)) {
      const member = guild.members.get(/^<@!?\d{17,18}>/.test(str) ? str.replace(/<@!?/, '').replace('>', '') : str)
      return member ? member.user : false
    } else if (str.length <= 33) {
      const isMemberName = (name, str) => name === str || name.startsWith(str) || name.includes(str)
      const member = guild.members.find(m => {
        if (m.nick && isMemberName(m.nick.toLowerCase(), str.toLowerCase())) return true
        return isMemberName(m.user.username.toLowerCase(), str.toLowerCase())
      })
      return member ? member.user : false
    } else return false
  }

	findUser(msg,query){

		if(!query) return false
		let user
		if(user=this.findMember(msg,query)) return user
		user=this.self.users.find((usr)=>{
			return usr.mention==query.replace(/!/,'') || usr.id==query || usr.username.toLowerCase().includes(query.toLowerCase())
		})
		return user
	}

  getColor (color, msg = {}, user = {}) {
    if (!color) return this.defaultColor
    const colors = this.constants.colors

    // color=random
    if (color.toLowerCase() === 'random') {
      const keys = Object.keys(colors)
      let random = colors[ keys[ keys.length * Math.random() << 0 ] ]
      return parseInt(random.replace('#', ''), 16)

    // color=role
    } else if (color.toLowerCase() === 'role' && user.id && msg.channel.guild) {
      const userRoles = msg.channel.guild.members.get(user.id).roles.map(r => msg.channel.guild.roles.get(r)).filter(r => r.color !== 0)
      const rolePositions = userRoles.map(r => r.position)
      const toprole = rolePositions.indexOf(Math.max.apply(Math, rolePositions))
      return userRoles.map(r => r.color)[toprole]

    // color=BASIC_COLOR_NAME
    } else if (Object.keys(colors).includes(color.toLowerCase())) {
      return parseInt(colors[color].replace('#', ''), 16)

    // color=#2a3g4h
    } else if (/#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/i.test(color)) {
      return parseInt(color.replace('#', ''), 16)

    // Default
    } else return this.defaultColor
  }
}

module.exports = Command
