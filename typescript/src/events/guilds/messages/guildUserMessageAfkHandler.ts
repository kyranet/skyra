import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { envParseBoolean } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { isGuildOwner, sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { isNullish, Nullish } from '@sapphire/utilities';
import { Permissions } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<EventOptions>({ enabled: envParseBoolean('REDIS_ENABLED'), event: Events.GuildUserMessage })
export class UserEvent extends Event {
	private readonly threshold = Time.Second * 30;

	public async run(message: GuildMessage) {
		await this.removeAfk(message);
		await this.notifyAfk(message);
	}

	private async removeAfk(message: GuildMessage) {
		// Get the entry, if any:
		const entry = await this.getAfk(message.guild.id, message.author.id);

		// If it does not exist, do nothing:
		if (entry === null) return;

		// If the channel is ignored, do nothing:
		if (entry.channels?.includes(message.channel.id)) return;

		// If the message was sent within 30 seconds, do nothing:
		if (Date.now() - entry.time < this.threshold) return;

		// Remove and notify the user:
		await this.context.afk.del(`afk:${message.guild.id}:${message.author.id}`);

		const [prefix, roleID, t] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.Afk.Prefix],
			settings[GuildSettings.Afk.Role],
			settings.getLanguage()
		]);

		await Promise.all([this.removeNickName(message, entry.name, prefix, t), this.removeRole(message, roleID)]);
		await sendTemporaryMessage(message, t(LanguageKeys.Events.Messages.AfkRemove, { user: message.author.toString() }), Time.Second * 10);
	}

	private async removeNickName(message: GuildMessage, oldName: string, prefix: string | Nullish, t: TFunction) {
		// If the target member is the guild's owner, return:
		if (isGuildOwner(message.member)) return;

		const me = message.guild.me!;

		// If Skyra does not have permissions to manage nicknames, return:
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) return;

		// If the target member has higher role hierarchy than Skyra, return:
		if (message.member.roles.highest.position >= me.roles.highest.position) return;

		const name = message.member.displayName;
		if (name.startsWith(prefix ?? t(LanguageKeys.Commands.Misc.AfkPrefix))) {
			await message.member.setNickname(oldName);
		}
	}

	private async removeRole(message: GuildMessage, roleID: string | Nullish) {
		if (isNullish(roleID)) return;

		const role = message.guild.roles.cache.get(roleID);
		if (role === undefined) {
			await writeSettings(message.guild, [[GuildSettings.Afk.Role, null]]);
			return;
		}

		if (role.position >= message.guild.me!.roles.highest.position) {
			return;
		}

		const { roles } = message.member;
		if (roles.cache.has(role.id)) {
			await roles.remove(role.id);
		}
	}

	private async notifyAfk(message: GuildMessage) {
		const { users } = message.mentions;
		if (users.size === 0) return;

		const entries: AfkEntry[] = [];
		for (const user of users.values()) {
			if (user.bot) continue;
			if (user.id === message.author.id) continue;

			const entry = await this.getAfk(message.guild.id, user.id);
			if (entry === null) continue;
			if (entry.channels?.includes(message.channel.id)) continue;

			entries.push(entry);
		}

		if (entries.length === 0) return;

		const t = await message.fetchT();
		const now = Date.now();
		await message.send(
			entries
				.map((entry) => t(LanguageKeys.Events.Messages.AfkStatus, { user: entry.name, duration: now - entry.time, content: entry.content }))
				.join('\n'),
			{ allowedMentions: { roles: [], users: [] } }
		);
	}

	private async getAfk(guildID: string, userID: string): Promise<AfkEntry | null> {
		const data = await this.context.afk.get(`afk:${guildID}:${userID}`);
		return data === null ? null : JSON.parse(data);
	}
}

interface AfkEntry {
	time: number;
	name: string;
	content: string;
	channels?: readonly string[];
}
