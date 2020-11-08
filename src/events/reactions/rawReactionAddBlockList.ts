import { GuildEntity, GuildSettings } from '@lib/database';
import { HardPunishment, ModerationEvent } from '@lib/structures/ModerationEvent';
import { SelfModeratorBitField } from '@lib/structures/SelfModeratorBitField';
import { KeyOfType } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Adder } from '@utils/Adder';
import { MessageLogsEnum } from '@utils/constants';
import { LLRCData } from '@utils/LongLivingReactionCollector';
import { api } from '@utils/Models/Api';
import { floatPromise, twemoji } from '@utils/util';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import { EventOptions } from 'klasa';

type ArgumentType = [LLRCData, string];

@ApplyOptions<EventOptions>({ name: Events.RawReactionAdd })
export default class extends ModerationEvent<ArgumentType, unknown, number> {
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Reactions.Enabled;
	protected softPunishmentPath: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Reactions.SoftAction;
	protected hardPunishmentPath: HardPunishment<number> = {
		action: GuildSettings.Selfmod.Reactions.HardAction,
		actionDuration: GuildSettings.Selfmod.Reactions.HardActionDuration,
		adder: 'reactions',
		adderMaximum: GuildSettings.Selfmod.Reactions.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Reactions.ThresholdDuration
	};

	public async run(data: LLRCData, emoji: string) {
		const [
			enabled,
			blockedReactions,
			ignoredChannels,
			softPunishment,
			maximumThreshold,
			durationThreshold,
			hardAction
		] = await data.guild.readSettings([
			GuildSettings.Selfmod.Reactions.Enabled,
			GuildSettings.Selfmod.Reactions.BlackList,
			GuildSettings.Channels.Ignore.ReactionAdd,
			GuildSettings.Selfmod.Reactions.SoftAction,
			GuildSettings.Selfmod.Reactions.ThresholdMaximum,
			GuildSettings.Selfmod.Reactions.ThresholdDuration,
			GuildSettings.Selfmod.Reactions.HardAction
		]);

		if (!enabled || blockedReactions.length === 0 || ignoredChannels.includes(data.channel.id)) return;

		const member = await data.guild.members.fetch(data.userID);
		if (member.user.bot || this.hasPermissions(member)) return;

		const args = [data, emoji] as const;
		const preProcessed = await this.preProcess(args);
		if (preProcessed === null) return;

		this.processSoftPunishment(args, preProcessed, new SelfModeratorBitField(softPunishment));

		if (this.hardPunishmentPath === null) return;

		if (!maximumThreshold || !durationThreshold) return this.processHardPunishment(data.guild, data.userID, hardAction);

		const $adder = this.hardPunishmentPath.adder;
		if (data.guild.security.adders[$adder] === null) {
			data.guild.security.adders[$adder] = new Adder(maximumThreshold, durationThreshold);
		}

		try {
			const points = typeof preProcessed === 'number' ? preProcessed : 1;
			data.guild.security.adders[$adder]!.add(data.userID, points);
		} catch {
			await this.processHardPunishment(data.guild, data.userID, await data.guild.readSettings(this.hardPunishmentPath.action));
		}
	}

	protected async preProcess([data, emoji]: Readonly<ArgumentType>) {
		return (await data.guild.readSettings(GuildSettings.Selfmod.Reactions.BlackList)).includes(emoji) ? 1 : null;
	}

	protected onDelete([data, emoji]: Readonly<ArgumentType>) {
		floatPromise(
			this,
			api(this.client)
				.channels(data.channel.id)
				.messages(data.messageID)
				.reactions(emoji, data.userID)
				.delete({ reason: '[MODERATION] Automatic Removal of Blacklisted Emoji.' })
		);
	}

	protected onAlert([data]: Readonly<ArgumentType>) {
		floatPromise(
			this,
			data.channel.sendLocale(LanguageKeys.Monitors.ReactionsFilter, [{ user: `<@${data.userID}>` }]).then((message) => message.nuke(15000))
		);
	}

	protected async onLogMessage([data]: Readonly<ArgumentType>) {
		const user = await this.client.users.fetch(data.userID);
		const language = await data.guild.fetchLanguage();
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setThumbnail(
				data.emoji.id === null
					? `https://twemoji.maxcdn.com/72x72/${twemoji(data.emoji.name!)}.png`
					: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`
			)
			.setDescription(
				`[${language.get(LanguageKeys.Misc.JumpTo)}](https://discord.com/channels/${data.guild.id}/${data.channel.id}/${data.messageID})`
			)
			.setFooter(`${data.channel.name} | ${language.get(LanguageKeys.Monitors.ReactionsFilterFooter)}`)
			.setTimestamp();
	}

	protected onLog(args: Readonly<ArgumentType>) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, args[0].guild, this.onLogMessage.bind(this, args));
	}

	private async hasPermissions(member: GuildMember) {
		const modRole = await member.guild.readSettings(GuildSettings.Roles.Moderator);
		return modRole ? member.roles.cache.has(modRole) : member.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
	}
}
