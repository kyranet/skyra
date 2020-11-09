import { DbSet } from '@lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { GuildMessage } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['emojis'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Tools.EmotesDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.EmotesExtended),
	runIn: ['text']
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(await message.fetchLocale(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const animEmotes: string[] = [];
		const staticEmotes: string[] = [];

		for (const [id, emote] of [...message.guild.emojis.cache.entries()]) {
			if (emote.animated) animEmotes.push(`<a:${emote.name}:${id}>`);
			else staticEmotes.push(`<:${emote.name}:${id}>`);
		}

		const display = await this.buildDisplay(message, chunk(animEmotes, 50), chunk(staticEmotes, 50));

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(message: GuildMessage, animatedEmojis: string[][], staticEmojis: string[][]) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(
					[
						`${message.guild.emojis.cache.size}`,
						`${await message.fetchLocale(LanguageKeys.Commands.Tools.EmotesTitle)}`,
						`${message.guild.name}`
					].join(' '),
					message.guild.iconURL({ format: 'png' })!
				)
		);

		for (const chunk of staticEmojis) {
			display.addPage((embed: MessageEmbed) => embed.setDescription(chunk.join(' ')));
		}

		for (const chunk of animatedEmojis) {
			display.addPage((embed: MessageEmbed) => embed.setDescription(chunk.join(' ')));
		}

		return display;
	}
}
