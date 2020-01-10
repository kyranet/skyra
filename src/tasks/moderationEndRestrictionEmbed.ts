import { ModerationData, ModerationTask } from '@lib/structures/ModerationTask';
import { CLIENT_ID } from '@root/config';
import { Guild, Permissions } from 'discord.js';

export default class extends ModerationTask {

	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return null;
		await guild.moderation.fetchChannelMessages();
		await guild.security.actions.unRestrictEmbed({
			user_id: data.userID,
			reason: `[MODERATION] Embed Restricted released after ${this.client.languages.default.duration(data.duration)}`
		}, this.getTargetDM(guild, await this.client.users.fetch(data.userID)));
		return null;
	}

}
