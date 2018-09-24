const { Command } = require('../../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SETMODLOGS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETMODLOGS_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<here|channel:channel>'
		});
	}

	public async run(msg, [channel]) {
		if (channel === 'here') ({ channel } = msg);
		else if (channel.type !== 'text') throw msg.language.get('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		if (msg.guild.settings.channels.modlog === channel.id) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.settings.update('channels.modlog', channel);
		return msg.sendLocale('COMMAND_SETMODLOGS_SET', [channel]);
	}

};
