const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, { name: 'USER_UPDATE' });
	}

	// 	{ id: '80351110224678912',
	// 	  username: 'Nelly',
	// 	  discriminator: '1337',
	// 	  avatar: '8342729096ea3675442027381ff50dfe',
	// 	  verified: true,
	// 	  email: 'nelly@discordapp.com' }

	public process(data) {
		const user = this.client.users.get(data.id);
		if (user) user._patch(data);
	}

};
