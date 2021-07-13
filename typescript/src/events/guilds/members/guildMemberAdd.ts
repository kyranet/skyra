import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { floatPromise } from '#utils/util';
import { Event } from '@sapphire/framework';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';

const { FLAGS } = Permissions;

export class UserEvent extends Event {
	public async run(member: GuildMember) {
		if (await this.handleStickyRoles(member)) return;
		this.context.client.emit(Events.NotMutedMemberAdd, member);
	}

	private async handleStickyRoles(member: GuildMember) {
		if (!member.guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const stickyRoles = await member.guild.stickyRoles.fetch(member.id);
		if (stickyRoles.length === 0) return false;

		// Handle the case the user is muted
		const key = GuildSettings.Channels.Logs.MemberAdd;
		const [channelId, roleId, t] = await member.guild.readSettings((settings) => [
			settings[key],
			settings[GuildSettings.Roles.Muted],
			settings.getLanguage()
		]);
		if (roleId && stickyRoles.includes(roleId)) {
			// Handle mute
			const role = member.guild.roles.cache.get(roleId);
			floatPromise(role ? member.roles.add(role) : member.guild.writeSettings([[GuildSettings.Roles.Muted, null]]));

			// Handle log
			this.context.client.emit(Events.GuildMessageLog, member.guild, channelId, key, () =>
				new MessageEmbed()
					.setColor(Colors.Amber)
					.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
					.setDescription(
						t(LanguageKeys.Events.Guilds.Members.GuildMemberAddDescription, {
							mention: member.toString(),
							time: Date.now() - member.user.createdTimestamp
						})
					)
					.setFooter(t(LanguageKeys.Events.Guilds.Members.GuildMemberAddMute))
					.setTimestamp()
			);

			return true;
		}

		floatPromise(member.roles.add(stickyRoles));

		return false;
	}
}
