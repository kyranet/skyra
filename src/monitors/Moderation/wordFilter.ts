import { DbSet, GuildSettings } from '@lib/database';
import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { GuildMessage } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { codeBlock, cutText } from '@sapphire/utilities';
import { floatPromise, getContent } from '@utils/util';
import { remove as removeConfusables } from 'confusables';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Language } from 'klasa';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationWords;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationWordsWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Filter.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Filter.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Filter.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Filter.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Filter.HardAction,
		actionDuration: GuildSettings.Selfmod.Filter.HardActionDuration,
		adder: 'words'
	};

	public shouldRun(message: GuildMessage) {
		return super.shouldRun(message);
	}

	protected async preProcess(message: GuildMessage) {
		const content = getContent(message);
		if (content === null) return null;

		const regex = await message.guild.readSettings((settings) => settings.wordFilterRegExp);
		return regex ? this.filter(removeConfusables(content), regex) : null;
	}

	protected async onDelete(message: GuildMessage, language: Language, value: FilterResults) {
		floatPromise(this, message.nuke());
		if (message.content.length > 25 && (await DbSet.fetchModerationDirectMessageEnabled(message.author.id))) {
			await message.author.send(language.get(LanguageKeys.Monitors.WordFilterDm, { filtered: codeBlock('md', cutText(value.filtered, 1900)) }));
		}
	}

	protected onAlert(message: GuildMessage, language: Language) {
		return message.alert(language.get(LanguageKeys.Monitors.WordFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, language: Language, results: FilterResults) {
		return new MessageEmbed()
			.splitFields(cutText(results.highlighted, 4000))
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${language.get(LanguageKeys.Monitors.WordFooter)}`)
			.setTimestamp();
	}

	private filter(str: string, regex: RegExp): FilterResults | null {
		const matches = str.match(regex);
		if (matches === null) return null;

		let last = 0;
		let next = 0;

		const filtered: string[] = [];
		const highlighted: string[] = [];
		for (const match of matches) {
			next = str.indexOf(match, last);
			const section = str.slice(last, next);
			if (section) {
				filtered.push(section, '*'.repeat(match.length));
				highlighted.push(section, `__${match}__`);
			} else {
				filtered.push('*'.repeat(match.length));
				highlighted.push(`__${match}__`);
			}
			last = next + match.length;
		}

		if (last !== str.length) {
			const end = str.slice(last);
			filtered.push(end);
			highlighted.push(end);
		}

		return {
			filtered: filtered.join(''),
			highlighted: highlighted.join('')
		};
	}
}

interface FilterResults {
	filtered: string;
	highlighted: string;
}
