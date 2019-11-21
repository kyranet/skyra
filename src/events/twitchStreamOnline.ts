import { Event } from 'klasa';
import { StreamBody } from '../routes/twitch/twitchStreamChange';
import { TwitchHelixGameSearchResult } from '../lib/types/definitions/Twitch';
import { TWITCH_REPLACEABLES_MATCHES, TWITCH_REPLACEABLES_REGEX } from '../lib/util/Notifications/Twitch';
import { GuildSettings, NotificationsStreamsTwitchEventStatus } from '../lib/types/settings/GuildSettings';
import { TextChannel, MessageEmbed } from 'discord.js';
import ApiResponse from '../lib/structures/api/ApiResponse';

export default class extends Event {

	public async run(data: StreamBody, response: ApiResponse) {
		const { data: [game] } = await this.client.twitch.fetchGame([data.game_id!]);
		const streamer = await this.client.queries.fetchTwitchStreamSubscription(data.id);

		if (!streamer) return response.error('Streamer not found!');

		for (const guildID of streamer.guild_ids) {
			if (!this.client.guilds.has(guildID)) continue;

			const guild = this.client.guilds.get(guildID);
			await guild?.settings.sync();
			const allGuildSubscriptions = guild?.settings.get(GuildSettings.Notifications.Streams.Twitch.Streamers);
			const guildSubscriptions = allGuildSubscriptions!.find(value => value[0] === streamer.id);

			for (const sub of guildSubscriptions![1]) {
				if (this.client.twitch.streamNotificationLimited(sub.$ID)) continue;
				if (sub.status !== NotificationsStreamsTwitchEventStatus.Online) continue;
				if (sub.gamesBlacklist.includes(game.name) || sub.gamesBlacklist.includes(game.id)) continue;
				if (!sub.gamesWhitelist.includes(game.name) || !sub.gamesWhitelist.includes(game.id)) continue;

				const channel = guild?.channels.get(sub.channel) as TextChannel;
				if (!channel.postable) continue;
				const message = this.transformText(sub.message, data, game);

				if (this.client.twitch.streamNotificationDrip(sub.$ID)) continue;

				if (sub.embed) {
					const embed = new MessageEmbed(JSON.parse(this.transformText(sub.embed, data, game)));
					return channel.send(message, embed);
				}
				return channel.send(message);
			}
		}
	}

	private transformText(str: string, notification: StreamBody, game: TwitchHelixGameSearchResult) {
		return str.replace(TWITCH_REPLACEABLES_REGEX, match => {
			switch (match) {
				case TWITCH_REPLACEABLES_MATCHES.TITLE: return notification.title!;
				case TWITCH_REPLACEABLES_MATCHES.VIEWER_COUNT: return notification.viewer_count!.toString();
				case TWITCH_REPLACEABLES_MATCHES.GAME_NAME: return game.name;
				case TWITCH_REPLACEABLES_MATCHES.LANGUAGE: return notification.language!;
				case TWITCH_REPLACEABLES_MATCHES.GAME_ID: return notification.game_id!;
				case TWITCH_REPLACEABLES_MATCHES.USER_ID: return notification.user_id!;
				case TWITCH_REPLACEABLES_MATCHES.USER_NAME: return notification.user_name!;
				default: return match;
			}
		});
	}

}
