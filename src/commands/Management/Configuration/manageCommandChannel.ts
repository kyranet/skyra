import { GuildSettings } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.ManageCommandChannelDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ManageCommandChannelExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<show|add|remove|reset> (channel:channel) (command:command)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'channel',
		async (arg, possible, message) => {
			if (!arg) return message.channel;
			const channel = await message.client.arguments.get('textchannelname')!.run(arg, possible, message);
			if (channel.type === 'text') return channel;
			throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelTextChannel);
		}
	],
	[
		'command',
		async (arg, possible, message, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (arg) {
				const command = await message.client.arguments.get('command')!.run(arg, possible, message);
				if (!command.disabled && command.permissionLevel < 9) return command;
			}
			throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelRequiredCommand);
		}
	]
])
export default class extends SkyraCommand {
	public async show(message: GuildMessage, [channel]: [TextChannel]) {
		const [disabledCommandsChannels, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.DisabledCommandChannels],
			settings.getLanguage()
		]);

		const entry = disabledCommandsChannels.find((e) => e.channel === channel.id);
		if (entry && entry.commands.length) {
			return message.send(
				language.get(LanguageKeys.Commands.Management.ManageCommandChannelShow, {
					channel: channel.toString(),
					commands: `\`${entry.commands.join('` | `')}\``
				})
			);
		}

		throw language.get(LanguageKeys.Commands.Management.ManageCommandChannelShowEmpty);
	}

	public async add(message: GuildMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		const language = await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const indexOfChannel = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);
			const language = settings.getLanguage();

			if (indexOfChannel === -1) {
				settings[GuildSettings.DisabledCommandChannels].push({ channel: channel.id, commands: [command.name] });
			} else {
				const disabledCommandChannel = disabledCommandsChannels[indexOfChannel];
				if (disabledCommandChannel.commands.includes(command.name))
					throw language.get(LanguageKeys.Commands.Management.ManageCommandChannelAddAlreadySet);

				settings[GuildSettings.DisabledCommandChannels][indexOfChannel].commands.push(command.name);
			}

			return language;
		});

		return message.send(
			language.get(LanguageKeys.Commands.Management.ManageCommandChannelAdd, { channel: channel.toString(), command: command.name })
		);
	}

	public async remove(message: GuildMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		const language = await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const indexOfChannel = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);
			const language = settings.getLanguage();

			if (indexOfChannel === -1) {
				throw language.get(LanguageKeys.Commands.Management.ManageCommandChannelRemoveNotSet, { channel: channel.toString() });
			}

			const disabledCommandChannel = disabledCommandsChannels[indexOfChannel];
			const indexOfDisabledCommand = disabledCommandChannel.commands.indexOf(command.name);

			if (indexOfDisabledCommand !== -1) {
				if (disabledCommandChannel.commands.length > 1) {
					settings[GuildSettings.DisabledCommandChannels][indexOfChannel].commands.splice(indexOfDisabledCommand, 1);
				} else {
					settings[GuildSettings.DisabledCommandChannels].splice(indexOfChannel, 1);
				}
			}

			return language;
		});

		return message.send(
			language.get(LanguageKeys.Commands.Management.ManageCommandChannelRemove, { channel: channel.toString(), command: command.name })
		);
	}

	public async reset(message: GuildMessage, [channel]: [TextChannel]) {
		const language = await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const entryIndex = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);
			const language = settings.getLanguage();

			if (entryIndex === -1) {
				throw language.get(LanguageKeys.Commands.Management.ManageCommandChannelResetEmpty);
			}

			settings[GuildSettings.DisabledCommandChannels].splice(entryIndex, 1);
			return language;
		});

		return message.send(language.get(LanguageKeys.Commands.Management.ManageCommandChannelReset, { channel: channel.toString() }));
	}
}
