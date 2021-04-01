import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ZeroWidthSpace } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import { MessageEmbed, Permissions, Role } from 'discord.js';

const SORT = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;
const roleMention = (role: Role) => role.toString();

const paginatedMessagePermissions = new Permissions([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES]);

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['server-info'],
	cooldown: 15,
	description: LanguageKeys.Commands.Management.GuildInfoDescription,
	extendedHelp: LanguageKeys.Commands.Management.GuildInfoExtended,
	permissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const color = await this.context.db.fetchColor(message);
		const roles = this.getRoles(args);

		if (message.channel.permissionsFor(message.guild.me!)!.has(paginatedMessagePermissions)) {
			const display = await this.buildDisplay(args, roles, color);
			return display.start(message);
		}

		return message.send(await this.getSummary(args, roles, color));
	}

	private async buildDisplay(args: SkyraCommand.Args, roles: Role[], color: number): Promise<UserPaginatedMessage> {
		const guild = args.message.guild!;
		const display = new UserPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(color)
				.setThumbnail(guild.iconURL()!)
				.setTitle(`${guild.name} [${guild.id}]`)
		});

		display.addPageEmbed(await this.getSummary(args, roles, color));

		for (const batch of chunk(roles, 20)) {
			if (batch.length <= 10) {
				display.addPageEmbed((embed) => embed.addField(ZeroWidthSpace, batch.map(roleMention)));
			} else {
				const left = batch.slice(0, 10);
				const right = batch.slice(10);
				display.addPageEmbed((embed) =>
					embed.addField(ZeroWidthSpace, left.map(roleMention), true).addField(ZeroWidthSpace, right.map(roleMention), true)
				);
			}
		}

		return display;
	}

	private async getSummary(args: SkyraCommand.Args, roles: Role[], color: number): Promise<MessageEmbed> {
		const guild = args.message.guild!;

		const serverInfoTitles = args.t(LanguageKeys.Commands.Management.GuildInfoTitles);
		const roleCount = guild.roles.cache.size - 1;
		return new MessageEmbed()
			.setColor(color)
			.setThumbnail(guild.iconURL()!)
			.setTitle(`${guild.name} [${guild.id}]`)
			.addField(args.t(LanguageKeys.Commands.Tools.WhoisMemberRoles, { count: roleCount }), this.getSummaryRoles(args, roles))
			.addField(serverInfoTitles.MEMBERS, await this.getSummaryMembers(args), true)
			.addField(serverInfoTitles.CHANNELS, this.getSummaryChannels(args), true)
			.addField(serverInfoTitles.OTHER, this.getSummaryOther(args));
	}

	private getRoles(args: SkyraCommand.Args): Role[] {
		const roles = [...args.message.guild!.roles.cache.values()].sort(SORT);
		// Pop off the @everyone role
		roles.pop();

		return roles;
	}

	private getSummaryRoles(args: SkyraCommand.Args, roles: Role[]): string {
		if (roles.length <= 15) return args.t(LanguageKeys.Globals.AndListValue, { value: roles.map((role) => role.toString()) });

		const mentions = roles
			.slice(0, 14)
			.map((role) => role.toString())
			.concat(args.t(LanguageKeys.Commands.Tools.WhoisMemberRoleListAndMore, { count: roles.length - 14 }));
		return args.t(LanguageKeys.Globals.AndListValue, { value: mentions });
	}

	private async getSummaryMembers(args: SkyraCommand.Args): Promise<string> {
		const guild = args.message.guild!;
		const owner = await this.context.client.users.fetch(guild.ownerID);

		return args.t(LanguageKeys.Commands.Management.GuildInfoMembers, { memberCount: guild.memberCount, owner });
	}

	private getSummaryChannels(args: SkyraCommand.Args): string {
		const guild = args.message.guild!;

		let tChannels = 0;
		let vChannels = 0;
		let cChannels = 0;
		for (const channel of guild.channels.cache.values()) {
			if (channel.type === 'text' || channel.type === 'news') tChannels++;
			else if (channel.type === 'voice') vChannels++;
			else if (channel.type === 'category') cChannels++;
		}

		return args.t(LanguageKeys.Commands.Management.GuildInfoChannels, {
			text: tChannels,
			voice: vChannels,
			categories: cChannels,
			afkChannelText: guild.afkChannelID
				? args.t(LanguageKeys.Commands.Management.GuildInfoChannelsAfkChannelText, {
						afkChannel: guild.afkChannelID,
						afkTime: guild.afkTimeout / 60
				  })
				: `**${args.t(LanguageKeys.Globals.None)}**`
		});
	}

	private getSummaryOther(args: SkyraCommand.Args): string {
		const guild = args.message.guild!;
		return args.t(LanguageKeys.Commands.Management.GuildInfoOther, {
			size: guild.roles.cache.size,
			region: guild.region,
			createdAt: guild.createdTimestamp,
			verificationLevel: guild.verificationLevel
		});
	}
}
