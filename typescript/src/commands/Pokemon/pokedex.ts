import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { PokedexEmbedDataReturn } from '#lib/i18n/languageKeys/keys/commands/Pokemon';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import {
	fetchGraphQLPokemon,
	getPokemonDetailsByFuzzy,
	GetPokemonSpriteParameters,
	getSpriteKey,
	parseBulbapediaURL,
	resolveColour
} from '#utils/APIs/Pokemon';
import { Emojis } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import type { AbilitiesEntry, DexDetails, GenderEntry, StatsEntry } from '@favware/graphql-pokemon';
import { zalgo } from '@favware/zalgo';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

enum BaseStats {
	hp = 'HP',
	attack = 'ATK',
	defense = 'DEF',
	specialattack = 'SPA',
	specialdefense = 'SPD',
	speed = 'SPE'
}

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['pokemon', 'dex', 'mon', 'poke', 'dexter'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.PokedexDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.PokedexExtended,
	strategyOptions: { flags: ['shiny', 'back'] }
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const pokemon = (await args.rest('string')).toLowerCase();
		const backSprite = args.getFlags('back');
		const shinySprite = args.getFlags('shiny');

		const pokeDetails = await this.fetchAPI(pokemon.toLowerCase(), { backSprite, shinySprite });

		await this.buildDisplay(pokeDetails, t, { backSprite, shinySprite }).start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchAPI(pokemon: string, getSpriteParams: GetPokemonSpriteParameters) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonDetailsByFuzzy(getSpriteParams), { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.PokedexQueryFail, { pokemon });
		}
	}

	/**
	 * Constructs a link in the evolution chain
	 * @param species Name of the pokemon that the evolution goes to
	 * @param level Level the evolution happens
	 * @param evoChain The current evolution chain
	 * @param isEvo Whether this is an evolution or pre-evolution
	 */
	private constructEvoLink(species: DexDetails['species'], level: DexDetails['evolutionLevel'], evoChain: string, isEvo = true) {
		if (isEvo) {
			return `${evoChain} → \`${toTitleCase(species)}\` ${level ? `(${level})` : ''}`;
		}
		return `\`${toTitleCase(species)}\` ${level ? `(${level})` : ''} → ${evoChain}`;
	}

	/**
	 * Parse the gender ratios to an embeddable format
	 */
	private parseGenderRatio(genderRatio: GenderEntry) {
		if (genderRatio.male === '0%' && genderRatio.female === '0%') {
			return 'Genderless';
		}

		return `${genderRatio.male} ${Emojis.MaleSignEmoji} | ${genderRatio.female} ${Emojis.FemaleSignEmoji}`;
	}

	/**
	 * Parses abilities to an embeddable format
	 * @remark required to distinguish hidden abilities from regular abilities
	 * @returns an array of abilities
	 */
	private getAbilities(abilitiesData: AbilitiesEntry): string[] {
		const abilities: string[] = [];
		for (const [type, ability] of Object.entries(abilitiesData)) {
			if (!ability) continue;
			abilities.push(type === 'hidden' ? `*${ability}*` : ability);
		}

		return abilities;
	}

	/**
	 * Parses base stats to an embeddable format
	 * @returns an array of stats with their keys and values
	 */
	private getBaseStats(statsData: StatsEntry): string[] {
		const baseStats: string[] = [];
		for (const [stat, value] of Object.entries(statsData)) {
			baseStats.push(`${BaseStats[stat as keyof Omit<StatsEntry, '__typename'>]}: **${value}**`);
		}

		return baseStats;
	}

	/**
	 * Parses the evolution chain to an embeddable format
	 * @returns The evolution chain for the Pokémon
	 */
	private getEvoChain(pokeDetails: DexDetails): string {
		// Set evochain if there are no evolutions
		let evoChain = `**${toTitleCase(pokeDetails.species)} ${pokeDetails.evolutionLevel ? `(${pokeDetails.evolutionLevel})` : ''}**` as string;
		if (!pokeDetails.evolutions?.length && !pokeDetails.preevolutions?.length) {
			evoChain += ' (No Evolutions)';
		}

		// Parse pre-evolutions and add to evochain
		if (pokeDetails.preevolutions?.length) {
			const { evolutionLevel } = pokeDetails.preevolutions[0];
			evoChain = this.constructEvoLink(pokeDetails.preevolutions[0].species, evolutionLevel, evoChain, false);

			// If the direct pre-evolution has another pre-evolution (charizard -> charmeleon -> charmander)
			if (pokeDetails.preevolutions[0].preevolutions?.length) {
				evoChain = this.constructEvoLink(pokeDetails.preevolutions[0].preevolutions[0].species, null, evoChain, false);
			}
		}

		// Parse evolution chain and add to evochain
		if (pokeDetails.evolutions?.length) {
			evoChain = this.constructEvoLink(pokeDetails.evolutions[0].species, pokeDetails.evolutions[0].evolutionLevel, evoChain);

			// In case there are multiple evolutionary paths
			const otherFormeEvos = pokeDetails.evolutions.slice(1);
			if (otherFormeEvos.length) {
				evoChain = `${evoChain}, ${otherFormeEvos.map((oevo) => `\`${oevo.species}\` (${oevo.evolutionLevel})`).join(', ')}`;
			}

			// If the direct evolution has another evolution (charmander -> charmeleon -> charizard)
			if (pokeDetails.evolutions[0].evolutions?.length) {
				evoChain = this.constructEvoLink(
					pokeDetails.evolutions[0].evolutions[0].species,
					pokeDetails.evolutions[0].evolutions[0].evolutionLevel,
					evoChain
				);
			}
		}

		return evoChain;
	}

	private buildDisplay(pokeDetails: DexDetails, t: TFunction, getSpriteParams: GetPokemonSpriteParameters) {
		const abilities = this.getAbilities(pokeDetails.abilities);
		const baseStats = this.getBaseStats(pokeDetails.baseStats);
		const evoChain = this.getEvoChain(pokeDetails);
		const spriteToGet = getSpriteKey(getSpriteParams);

		const embedTranslations = t(LanguageKeys.Commands.Pokemon.PokedexEmbedData, {
			otherFormes: pokeDetails.otherFormes ?? [],
			cosmeticFormes: pokeDetails.cosmeticFormes ?? []
		});

		if (pokeDetails.num < 0) {
			return this.parseCAPPokemon({ pokeDetails, abilities, baseStats, evoChain, embedTranslations, t, spriteToGet });
		} else if (pokeDetails.num === 0) {
			return this.parseMissingno({ pokeDetails, abilities, baseStats, evoChain, embedTranslations, t, spriteToGet });
		}
		return this.parseRegularPokemon({ pokeDetails, abilities, baseStats, evoChain, embedTranslations, t, spriteToGet });
	}

	private parseCAPPokemon({ pokeDetails, abilities, baseStats, evoChain, embedTranslations, spriteToGet }: PokemonToDisplayArgs) {
		return new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(pokeDetails.color))
				.setAuthor(`#${pokeDetails.num} - ${toTitleCase(pokeDetails.species)}`, CdnUrls.Pokedex)
				.setThumbnail(pokeDetails[spriteToGet])
		})
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.types, pokeDetails.types.join(', '), true)
					.addField(embedTranslations.abilities, abilities.join(', '), true)
					.addField(embedTranslations.genderRatio, this.parseGenderRatio(pokeDetails.gender), true)
					.addField(embedTranslations.evolutionaryLine, evoChain)
					.addField(
						embedTranslations.baseStats,
						`${baseStats.join(', ')} (*${embedTranslations.baseStatsTotal}*: **${pokeDetails.baseStatsTotal}**)`
					)
			)
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.height, `${pokeDetails.height}m`, true)
					.addField(embedTranslations.weight, `${pokeDetails.weight}kg`, true)
					.addField(embedTranslations.eggGroups, pokeDetails.eggGroups?.join(', ') || '', true)
					.addField(embedTranslations.smogonTier, pokeDetails.smogonTier, true)
			);
	}

	private parseMissingno({ pokeDetails, abilities, baseStats, evoChain, embedTranslations, t, spriteToGet }: PokemonToDisplayArgs) {
		const externalResources = t(LanguageKeys.System.PokedexExternalResource);
		const externalResourceData = [
			`[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/MissingNo.)`,
			`[Serebii](https://www.serebii.net/pokedex/000.shtml)`
		].join(' | ');

		return new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(pokeDetails.color))
				.setAuthor(`#${pokeDetails.num} - ${zalgo(toTitleCase(pokeDetails.species))}`, CdnUrls.Pokedex)
				.setThumbnail(pokeDetails[spriteToGet])
		})
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.types, zalgo(pokeDetails.types.join(', ')), true)
					.addField(embedTranslations.abilities, zalgo(abilities.join(', ')), true)
					.addField(embedTranslations.genderRatio, zalgo(this.parseGenderRatio(pokeDetails.gender)), true)
					.addField(embedTranslations.evolutionaryLine, zalgo(evoChain))
					.addField(
						embedTranslations.baseStats,
						zalgo(`${baseStats.join(', ')} (*${embedTranslations.baseStatsTotal}*: **${pokeDetails.baseStatsTotal}**)`)
					)
					.addField(externalResources, externalResourceData)
			)
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.height, zalgo(`${pokeDetails.height}m`), true)
					.addField(embedTranslations.weight, zalgo(`${pokeDetails.weight}kg`), true)
					.addField(embedTranslations.eggGroups, zalgo(pokeDetails.eggGroups?.join(', ') || ''), true)
					.addField(externalResources, externalResourceData)
			)
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.flavourText, `\`(${pokeDetails.flavorTexts[0].game})\` ${zalgo(pokeDetails.flavorTexts[0].flavor)}`)
					.addField(externalResources, externalResourceData)
			);
	}

	private parseRegularPokemon({ pokeDetails, abilities, baseStats, evoChain, embedTranslations, t, spriteToGet }: PokemonToDisplayArgs) {
		const externalResources = t(LanguageKeys.System.PokedexExternalResource);
		const externalResourceData = [
			`[Bulbapedia](${parseBulbapediaURL(pokeDetails.bulbapediaPage)} )`,
			`[Serebii](${pokeDetails.serebiiPage})`,
			`[Smogon](${pokeDetails.smogonPage})`
		].join(' | ');

		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(pokeDetails.color))
				.setAuthor(`#${pokeDetails.num} - ${toTitleCase(pokeDetails.species)}`, CdnUrls.Pokedex)
				.setThumbnail(pokeDetails[spriteToGet])
		})
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.types, pokeDetails.types.join(', '), true)
					.addField(embedTranslations.abilities, abilities.join(', '), true)
					.addField(embedTranslations.genderRatio, this.parseGenderRatio(pokeDetails.gender), true)
					.addField(embedTranslations.evolutionaryLine, evoChain)
					.addField(
						embedTranslations.baseStats,
						`${baseStats.join(', ')} (*${embedTranslations.baseStatsTotal}*: **${pokeDetails.baseStatsTotal}**)`
					)
					.addField(externalResources, externalResourceData)
			)
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.height, `${pokeDetails.height}m`, true)
					.addField(embedTranslations.weight, `${pokeDetails.weight}kg`, true)
					.addField(embedTranslations.eggGroups, pokeDetails.eggGroups?.join(', ') || '', true)
					.addField(externalResources, externalResourceData)
			)
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.smogonTier, pokeDetails.smogonTier, true)
					.addField(embedTranslations.flavourText, `\`(${pokeDetails.flavorTexts[0].game})\` ${pokeDetails.flavorTexts[0].flavor}`)
					.addField(externalResources, externalResourceData)
			);

		// If there are any cosmetic formes or other formes then add a page for them
		// If the pokémon doesn't have the formes then the API will default them to `null`
		if (pokeDetails.cosmeticFormes || pokeDetails.otherFormes) {
			display.addPageEmbed((embed) => {
				// If the pokémon has other formes
				if (pokeDetails.otherFormes) {
					embed.addField(embedTranslations.otherFormesTitle, embedTranslations.otherFormesList);
				}

				// If the pokémon has cosmetic formes
				if (pokeDetails.cosmeticFormes) {
					embed.addField(embedTranslations.cosmeticFormesTitle, embedTranslations.cosmeticFormesList);
				}

				// Add the external resource field
				embed.addField(externalResources, externalResourceData);

				return embed;
			});
		}

		return display;
	}
}

interface PokemonToDisplayArgs {
	pokeDetails: DexDetails;
	abilities: string[];
	baseStats: string[];
	evoChain: string;
	t: TFunction;
	embedTranslations: PokedexEmbedDataReturn;
	spriteToGet: ReturnType<typeof getSpriteKey>;
}
