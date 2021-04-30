import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Time } from '#utils/constants';
import { LLRCData, LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import { ApplyOptions } from '@sapphire/decorators';
import * as YouTube from '#utils/Notifications/Youtube';
import { Message, Permissions } from 'discord.js';

const kPermissions = new Permissions([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES]).freeze();

const EMOJIS = {
	previous: '⬅️',
	stop: '⏹️',
	next: '➡️'
};

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('GOOGLE_API_TOKEN'),
	aliases: ['yt'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.YouTubeDescription,
	extendedHelp: LanguageKeys.Commands.Tools.YouTubeExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const input = await args.rest('string');
		const data = await YouTube.getInfo(input);
		const results = data.items.slice(0, 5);

		if (!results.length) this.error(LanguageKeys.Commands.Tools.YouTubeNotFound);

		const sent = await message.send(this.getLink(results[0]));

		// if Skyra doesn't have permissions for an LLRC, we fallback to the first link
		if (!message.guild?.me?.permissionsIn(message.channel).has(kPermissions)) return;

		for (const emoji of Object.values(EMOJIS)) await sent.react(emoji);

		let index = 0;
		const llrc = new LongLivingReactionCollector();

		llrc.setListener(async (reaction: LLRCData) => {
			if (reaction.messageID !== sent.id || reaction.userID !== message.author.id) return;

			switch (reaction.emoji.name) {
				case EMOJIS.next:
					index++;
					if (index >= results.length) return;
					if (index === results.length - 1) {
						// at the final page, remove the next emoji
						await sent.reactions.cache.get(EMOJIS.next)?.remove();
					}

					// add the previous emoji to go back
					if (!sent.reactions.cache.has(EMOJIS.previous)) {
						// remove all reactions to preserve the order: previous, stop, next
						await sent.reactions.removeAll();
						for (const emoji of Object.values(EMOJIS)) await sent.react(emoji);
					}
					await sent.edit(this.getLink(results[index]));
					await sent.reactions.cache.get(EMOJIS.next)?.users.remove(reaction.userID);
					break;

				case EMOJIS.previous:
					index--;
					if (index < 0) return;
					if (index === 0) {
						// at the first page, remove the previous emoji
						await sent.reactions.cache.get(EMOJIS.previous)?.remove();
					}

					if (!sent.reactions.cache.has(EMOJIS.next)) await sent.react(EMOJIS.next);
					await sent.edit(this.getLink(results[index]));
					await sent.reactions.cache.get(EMOJIS.previous)?.users.remove(reaction.userID);
					break;

				case EMOJIS.stop:
					await sent.reactions.removeAll();
					llrc.end();
			}
		});

		llrc.setEndListener(async () => {
			await sent.reactions.removeAll();
		});

		llrc.setTime(Time.Second * 60);
	}

	private getLink(result: YouTube.ResultOkItem) {
		let output = '';
		switch (result.id.kind) {
			case 'youtube#channel':
				output = `https://youtube.com/channel/${result.id.channelId}`;
				break;
			case 'youtube#playlist':
				output = `https://www.youtube.com/playlist?list=${result.id.playlistId}`;
				break;
			case 'youtube#video':
				output = `https://youtu.be/${result.id.videoId}`;
				break;
			default: {
				this.context.client.logger.fatal(`YouTube -> Returned incompatible kind '${result.id.kind}'.`);
				throw 'I found an incompatible kind of result...';
			}
		}

		return output;
	}
}
