import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { MessageEmbed, User } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(previous: User, next: User) {
		if (previous.username === next.username) return;

		for (const guild of this.client.guilds.cache.values()) {
			if (!guild.members.cache.has(next.id)) continue;
			if (guild.settings.get(GuildSettings.Events.MemberNicknameUpdate)) {
				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () =>
					new MessageEmbed()
						.setColor(Colors.Yellow)
						.setAuthor(`${next.tag} (${next.id})`, next.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
						.setDescription(guild.language.get('eventsNameDifference', { previous: previous.username, next: next.username }))
						.setFooter(guild.language.get('eventsNicknameUpdate'))
						.setTimestamp()
				);
			}
		}
	}
}
