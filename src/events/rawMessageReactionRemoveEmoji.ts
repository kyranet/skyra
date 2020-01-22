import { WSMessageReactionRemoveEmoji } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { api } from '@utils/Models/Api';
import { compareEmoji } from '@utils/util';
import { DiscordAPIError } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_REACTION_REMOVE_EMOJI', emitter: store.client.ws });
	}

	public async run(data: WSMessageReactionRemoveEmoji) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		if (!compareEmoji(guild.settings.get(GuildSettings.Starboard.Emoji), data.emoji)) return;
		guild.starboard.delete(`${data.channel_id}-${data.message_id}`);

		// Delete entry from starboard if it exists
		try {
			const results = await this.client.queries.deleteStarReturning(data.guild_id, data.message_id);


			if (results && results.star_message_id) {
				// Get channel
				const channel = guild.settings.get(GuildSettings.Starboard.Channel);
				if (!channel) return;

				await api(this.client).channels(channel).messages(results.star_message_id)
					.delete({ reason: 'Starboard Management: Reactions Cleared' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
