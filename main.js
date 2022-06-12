const child_process = require('child_process');

const isTokenExpired = (token) => {
  const decoded = Buffer.from(token.split('.')[1], 'base64url').toString()
  const deets = JSON.parse(decoded)
  const exp = deets.exp

  return Date.now() > exp * 1000
}

const liveDisplayName = (args) => args[0].value ?
  `Token from ${args[0].value}` :
  `Token from command: <<Click to specify>>`

const validate = async (token) => isTokenExpired(token) ? 'token expired' : undefined

module.exports.templateTags = [{
  name: 'tokenFromCommand',
  displayName: 'Token from command',
  liveDisplayName,
  description: 'Get Token from command',
  validate,
  args: [
    {
      displayName: 'Command',
      type: 'string'
    },
    {
      displayName: 'Cache value',
      type: 'boolean',
      defaultValue: true
    },
    {
      displayName: 'Refresh when expired',
      type: 'boolean',
      defaultValue: true
    }
  ],
  async run(context, command, cacheValue, refreshOnExpire) {
    await context.app.alert('hello', 'some message')

    if (!command.trim()) {
      return ''
    }

    const lastToken = await context.store.getItem('token')
    const lastCommand = await context.store.getItem('command')

    if (command != lastCommand) {
      await context.store.clear()
    }

    if (lastToken && (!refreshOnExpire || !isTokenExpired(lastToken))) {
      return lastToken
    }

    const token = child_process.execSync(command, {
      encoding: 'utf8'
    })

    await context.store.setItem('command', command)

    if (cacheValue) {
      await context.store.setItem('token', token)
    }

    return token
  }
}];