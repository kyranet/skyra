import { TextChannel } from 'discord.js';
import { RawEvent } from '../lib/structures/RawEvent';
import { WSMessageReactionAdd } from '../lib/types/Discord';
import { GuildSettingsRolesReactions } from '../lib/types/Misc';
import { LLRCData } from '../lib/util/LongLivingReactionCollector';
import { resolveEmoji } from '../lib/util/util';

export default class extends RawEvent {

	public async run(data: WSMessageReactionAdd): Promise<void> {
		const channel = this.client.channels.get(data.channel_id) as TextChannel;
		if (!channel || channel.type !== 'text' || !channel.readable) return;

		const parsed = {
			channel,
			emoji: {
				animated: data.emoji.animated,
				id: data.emoji.id,
				managed: 'managed' in data.emoji ? data.emoji.managed : null,
				name: data.emoji.name,
				requireColons: 'require_colons' in data.emoji ? data.emoji.require_colons : null,
				roles: data.emoji.roles || null,
				user: (data.emoji.user && this.client.users.add(data.emoji.user)) || { id: data.user_id }
			},
			guild: channel.guild,
			messageID: data.message_id,
			userID: data.user_id
		} as LLRCData;

		for (const llrc of this.client.llrCollectors)
			llrc.send(parsed);

		if (data.channel_id === channel.guild.settings.get('channels.roles'))
			this.handleRoleChannel(parsed);
		else if (!parsed.channel.nsfw
			&& parsed.channel.id !== channel.guild.settings.get('starboard.channel')
			&& resolveEmoji(parsed.emoji) === channel.guild.settings.get('starboard.emoji'))
			this.handleStarboard(parsed);
	}

	public async handleRoleChannel(parsed: LLRCData): Promise<void> {
		const messageReaction = parsed.guild.settings.get('roles.messageReaction');
		if (!messageReaction || messageReaction !== parsed.messageID) return;

		const emoji = resolveEmoji(parsed.emoji);
		if (!emoji) return;

		const roleEntry = (parsed.guild.settings.get('roles.reactions') as GuildSettingsRolesReactions)
			.find((entry) => entry.emoji === emoji);
		if (!roleEntry) return;

		try {
			const member = await parsed.guild.members.fetch(parsed.userID);
			if (!member.roles.has(roleEntry.role)) await member.roles.add(roleEntry.role);
		} catch (error) {
			this.client.emit('apiError', error);
		}
	}

	public async handleStarboard(parsed: LLRCData): Promise<void> {
		try {
			const channel = parsed.guild.settings.get('starboard.channel') as string;
			const ignoreChannels = parsed.guild.settings.get('starboard.ignoreChannels') as string[];
			if (!channel || ignoreChannels.includes(parsed.channel.id)) return;

			const starboardChannel = parsed.guild.channels.get(channel) as TextChannel;
			if (!starboardChannel || !starboardChannel.postable) {
				await parsed.guild.settings.reset('starboard.channel');
				return;
			}

			// Process the starboard
			const { starboard } = parsed.guild;
			const sMessage = await starboard.fetch(parsed.channel, parsed.messageID, parsed.userID);
			if (sMessage) await sMessage.add(parsed.userID);
		} catch (error) {
			this.client.emit('apiError', error);
		}
	}

}
