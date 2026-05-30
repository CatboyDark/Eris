import { color, config } from '#utils'

class ErisError extends Error {
	constructor({ message = '', desc = '', cause = null, fatal = false }) {
		super(message, { cause })
		this.name = this.constructor.name
		this.desc = desc
		this.fatal = fatal
	}
}

function handle(error) {
	if (error instanceof ErisError) {
		let output = ''
		let debug
		try {
			debug = config?.debug ?? false
		}
		catch {
			debug = false
		}

		if (error.desc) output += error.fatal ? color.red(error.desc) : color.yellow(error.desc)
		if ((debug || error.unknown) && error.cause) output += error.desc ? '\n' + error.cause.stack : error.cause.stack

		error.fatal ? console.error(error.message, output) : console.warn(error.message, output)

		return
	}

	console.error('Unexpected Error!', error)
	process.exit(1)
}

process.on('uncaughtException', handle)
process.on('unhandledRejection', handle)

class UnknownError extends ErisError {
	constructor({ message = 'Unknown Error!', desc = '', cause = null, fatal = false }) {
		super({ message, desc, cause, fatal })
		this.unknown = true
	}
}

class InternalError extends ErisError {
	constructor({ message = '', desc = '', cause = null, fatal = false }) {
		super({ message, desc, cause, fatal })
	}
}

class UserError extends ErisError {
	constructor({ message = '', desc = '', cause = null, fatal = false }) {
		super({ message, desc, cause, fatal })
	}
}

export {
	UnknownError,
	InternalError,
	UserError
}