const { Event } = require('../index');

module.exports = class extends Event {

	public async run(message) {
		const { response, success } = await this.client.ipcPieces.run(message);
		message.reply({ response, success });
	}

};
