import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { CustomSearchType, GoogleCSEImageData, GoogleResponseCodes, handleNotOK, queryGoogleCustomSearchAPI } from '@utils/Google';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['googleimage', 'img'],
	cooldown: 10,
	nsfw: true, // Google will return explicit results when seaching for explicit terms, even when safe-search is on
	description: language => language.tget('COMMAND_GIMAGE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_GIMAGE_EXTENDED'),
	usage: '<query:query>'
})
export default class extends RichDisplayCommand {

	public async init() {
		this.createCustomResolver('query', (arg, possible, message) => this.client.arguments.get('string')!.run(
			arg.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '').replace(/ /g, '+'),
			possible,
			message
		));
	}

	public async run(message: KlasaMessage, [query]: [string]) {
		const [response, { items }] = await Promise.all([
			message.sendEmbed(new MessageEmbed()
				.setDescription(message.language.tget('SYSTEM_LOADING'))
				.setColor(BrandingColors.Secondary)),
			queryGoogleCustomSearchAPI<CustomSearchType.Image>(message, CustomSearchType.Image, query)
		]);

		if (!items || !items.length) throw message.language.tget(handleNotOK(GoogleResponseCodes.ZeroResults, message.client));

		const display = await this.buildDisplay(message, items);

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(message: KlasaMessage, items: GoogleCSEImageData[]) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(await DbSet.fetchColor(message)));

		for (const item of items) {
			display.addPage((embed: MessageEmbed) => embed
				.setTitle(item.title)
				.setURL(item.image.contextLink)
				.setImage(item.link));
		}

		return display;
	}

}
