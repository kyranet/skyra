import { ReactionRole } from '@lib/database';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { displayEmoji, pickRandom, resolveEmoji } from '@utils/util';
import { Guild, MessageEmbed, Role, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['mrr', 'managereactionrole', 'managerolereaction', 'managerolereactions'],
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.ManageReactionRolesDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ManageReactionRolesExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|reset|show:default> (role:role) (message:messageOrChannel) (reaction:reaction)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'role',
		(arg, possible, message, [type]) =>
			type === 'add' || type === 'remove' ? message.client.arguments.get('rolename')!.run(arg, possible, message) : undefined
	],
	[
		'messageOrChannel',
		(arg, possible, message, [type]) =>
			type === 'add'
				? arg
					? message.client.arguments.get('textchannelname')!.run(arg, possible, message)
					: undefined
				: type === 'remove'
				? message.client.arguments.get('snowflake')!.run(arg, possible, message)
				: undefined
	],
	[
		'reaction',
		(arg, possible, message, [type, , channel]) =>
			type === 'add' && channel ? message.client.arguments.get('emoji')!.run(arg, possible, message) : undefined
	]
])
export default class extends SkyraCommand {
	public async show(message: KlasaMessage) {
		const { reactionRoles, language } = await message.guild!.readSettings((settings) => ({
			reactionRoles: settings[GuildSettings.ReactionRoles],
			language: settings.getLanguage()
		}));
		if (reactionRoles.length === 0) {
			throw language.get(LanguageKeys.Commands.Management.ManageReactionRolesShowEmpty);
		}

		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const bulk of chunk(reactionRoles, 20)) {
			const serialized = bulk.map((value) => this.format(value, message.guild!)).join('\n');
			display.addPage((template: MessageEmbed) => template.setDescription(serialized));
		}

		await display.start(response, message.author.id);
		return response;
	}

	public async add(message: KlasaMessage, [role, channel, emoji]: [Role, TextChannel?, string?]) {
		if (emoji) {
			const reactionRole: ReactionRole = {
				emoji: emoji!,
				message: null,
				channel: channel!.id,
				role: role.id
			};
			await message.guild!.readSettings((settings) => {
				settings[GuildSettings.ReactionRoles].push(reactionRole);
				return settings.getLanguage();
			});

			return message.sendLocale(LanguageKeys.Commands.Management.ManageReactionRolesAddChannel, [
				{ emoji: displayEmoji(reactionRole.emoji), channel: `<#${channel}>` }
			]);
		}

		await message.sendLocale(LanguageKeys.Commands.Management.ManageReactionRolesAddPrompt);

		const reaction = await LongLivingReactionCollector.collectOne(this.client, {
			filter: (reaction) => reaction.userID === message.author.id && reaction.guild.id === message.guild!.id
		});
		if (!reaction) throw message.fetchLocale(LanguageKeys.Commands.Management.ManageReactionRolesAddMissing);

		const reactionRole: ReactionRole = {
			emoji: resolveEmoji(reaction.emoji)!,
			message: reaction.messageID,
			channel: reaction.channel.id,
			role: role.id
		};
		await message.guild!.writeSettings((settings) => {
			settings[GuildSettings.ReactionRoles].push(reactionRole);
			return settings.getLanguage();
		});

		const url = `<https://discord.com/channels/${message.guild!.id}/${reactionRole.channel}/${reactionRole.message}>`;
		return message.sendLocale(LanguageKeys.Commands.Management.ManageReactionRolesAdd, [{ emoji: displayEmoji(reactionRole.emoji), url }]);
	}

	public async remove(message: KlasaMessage, [role, messageID]: [Role, string]) {
		const reactionRoles = await message.guild!.readSettings(GuildSettings.ReactionRoles);
		const reactionRoleIndex = reactionRoles.findIndex((entry) => entry.message === messageID && entry.role === role.id);
		if (reactionRoleIndex === -1) throw message.fetchLocale(LanguageKeys.Commands.Management.ManageReactionRolesRemoveNotExists);

		const reactionRole = reactionRoles[reactionRoleIndex];
		await message.guild!.writeSettings((settings) => {
			settings[GuildSettings.ReactionRoles].splice(reactionRoleIndex, 1);
			return settings.getLanguage();
		});
		const url = reactionRole.message
			? `<https://discord.com/channels/${message.guild!.id}/${reactionRole.channel}/${reactionRole.message}>`
			: `<#${reactionRole.channel}>`;
		return message.sendLocale(LanguageKeys.Commands.Management.ManageReactionRolesRemove, [{ emoji: displayEmoji(reactionRole.emoji), url }]);
	}

	public async reset(message: KlasaMessage) {
		const reactionRoles = await message.guild!.readSettings(GuildSettings.ReactionRoles);
		if (reactionRoles.length === 0) {
			throw message.fetchLocale(LanguageKeys.Commands.Management.ManageReactionRolesResetEmpty);
		}

		await message.guild!.writeSettings((settings) => {
			settings[GuildSettings.ReactionRoles].length = 0;
			return settings.getLanguage();
		});
		return message.sendLocale(LanguageKeys.Commands.Management.ManageReactionRolesReset);
	}

	private format(entry: ReactionRole, guild: Guild): string {
		const emoji = displayEmoji(entry.emoji);
		const role = `<@&${entry.role}>`;
		const url = entry.message ? `[🔗](https://discord.com/channels/${guild.id}/${entry.channel}/${entry.message})` : `<#${entry.channel}>`;
		return `${emoji} | ${role} -> ${url}`;
	}
}
