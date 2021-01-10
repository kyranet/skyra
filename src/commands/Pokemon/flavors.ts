import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { fetchGraphQLPokemon, getPokemonFlavorTextsByFuzzy, resolveColour } from '#utils/Pokemon';
import { pickRandom } from '#utils/util';
import { DexDetails } from '@favware/graphql-pokemon';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['flavor', 'flavour', 'flavours'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.FlavorsDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.FlavorsExtended,
	usage: '<pokemon:str>',
	flagSupport: true
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [pokemon]: [string]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading, { returnObjects: true }))).setColor(BrandingColors.Secondary)
		);

		const pokemonData = await this.fetchAPI(t, pokemon.toLowerCase());

		await this.buildDisplay(message, pokemonData).start(response, message.author.id);
		return response;
	}

	private async fetchAPI(t: TFunction, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonFlavorTextsByFuzzy, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.FlavorsQueryFail, { pokemon });
		}
	}

	private buildDisplay(message: GuildMessage, pokemonData: DexDetails) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(pokemonData.color))
				.setAuthor(`#${pokemonData.num} - ${toTitleCase(pokemonData.species)}`, CdnUrls.Pokedex)
				.setThumbnail(message.flagArgs.shiny ? pokemonData.shinySprite : pokemonData.sprite)
		);

		for (const flavorText of pokemonData.flavorTexts) {
			display.addPage((embed: MessageEmbed) => embed.setDescription([`**${flavorText.game}**`, flavorText.flavor].join('\n')));
		}

		return display;
	}
}
