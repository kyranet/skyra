import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { TypeCodes } from '#utils/moderationConstants';
import { Event } from '@sapphire/framework';

export class UserEvent extends Event {
	public async run(message: GuildMessage) {
		const [threshold, nms, t] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.Selfmod.NoMentionSpam.MentionsAllowed],
			settings.nms,
			settings.getLanguage()
		]);

		const lock = message.guild.moderation.createLock();
		try {
			await message.guild.members
				.ban(message.author.id, { days: 0, reason: t(LanguageKeys.Events.NoMentionSpam.Footer) })
				.catch((error) => this.context.client.emit(Events.Error, error));
			await message.channel
				.send(t(LanguageKeys.Events.NoMentionSpam.Message, { user: message.author }))
				.catch((error) => this.context.client.emit(Events.Error, error));
			nms.delete(message.author.id);

			const reason = t(LanguageKeys.Events.NoMentionSpam.ModerationLog, { threshold });
			await message.guild.moderation
				.create({
					userID: message.author.id,
					moderatorID: process.env.CLIENT_ID,
					type: TypeCodes.Ban,
					reason
				})
				.create();
		} finally {
			lock();
		}
	}
}
