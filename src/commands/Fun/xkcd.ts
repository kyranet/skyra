import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { Timestamp } from '@sapphire/time-utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.XkcdDescription,
	extendedHelp: LanguageKeys.Commands.Fun.XkcdExtended,
	requiredPermissions: ['EMBED_LINKS'],
	spam: true,
	usage: '[query:string]'
})
export default class extends SkyraCommand {
	private readonly timestamp = new Timestamp('MMMM, dddd dd YYYY');

	public async run(message: KlasaMessage, [input]: [string]) {
		const query = typeof input === 'undefined' ? null : /^\d+$/.test(input) ? Number(input) : input;
		const t = await message.fetchT();

		const comicNumber = await this.getNumber(query, t);
		const comic = await fetch<XkcdResultOk>(`https://xkcd.com/${comicNumber}/info.0.json`, FetchResultTypes.JSON).catch(() => {
			throw t(LanguageKeys.Commands.Fun.XkcdNotfound);
		});
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setImage(comic.img)
				.setTitle(comic.title)
				.setURL(`https://xkcd.com/${comicNumber}/`)
				.setFooter(`XKCD | ${comic.num} | ${this.getTime(comic.year, comic.month, comic.day)}`)
				.setDescription(comic.alt)
				.setTimestamp()
		);
	}

	private getTime(year: string, month: string, day: string) {
		return this.timestamp.display(new Date(Number(year), Number(month) - 1, Number(day)));
	}

	private async getNumber(query: string | number | null, t: TFunction) {
		const xkcdInfo = (await fetch('https://xkcd.com/info.0.json', FetchResultTypes.JSON)) as XkcdResultOk;

		if (typeof query === 'number') {
			if (query <= xkcdInfo.num) return query;
			throw t(LanguageKeys.Commands.Fun.XkcdComics, { amount: xkcdInfo.num });
		}

		if (query) {
			const text = await fetch(
				`https://relevantxkcd.appspot.com/process?action=xkcd&query=${encodeURIComponent(query)}`,
				FetchResultTypes.Text
			);
			const comics = text.split(' ').slice(2);
			const random = Math.floor(Math.random() * (comics.length / 2));
			return parseInt(comics[random * 2].replace(/\n/g, ''), 10);
		}

		return Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
	}
}

export interface XkcdResultOk {
	month: string;
	num: number;
	link: string;
	year: string;
	news: string;
	safe_title: string;
	transcript: string;
	alt: string;
	img: string;
	title: string;
	day: string;
}
