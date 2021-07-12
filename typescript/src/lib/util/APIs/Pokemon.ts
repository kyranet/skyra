import { envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type {
	Query,
	QueryGetAbilityDetailsByFuzzyArgs,
	QueryGetItemDetailsByFuzzyArgs,
	QueryGetMoveDetailsByFuzzyArgs,
	QueryGetPokemonDetailsByFuzzyArgs,
	QueryGetPokemonLearnsetByFuzzyArgs,
	QueryGetTypeMatchupArgs
} from '@favware/graphql-pokemon';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import { gql } from '../util';

const FlavorsFrament = gql`
	fragment flavors on FlavorEntry {
		game
		flavor
	}
`;

export const getPokemonDetailsByFuzzy = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		${FlavorsFrament}

		fragment abilities on AbilitiesEntry {
			first
			second
			hidden
			special
		}

		fragment stats on StatsEntry {
			hp
			attack
			defense
			specialattack
			specialdefense
			speed
		}

		fragment genders on GenderEntry {
			male
			female
		}

		fragment dexdetails on DexDetails {
			num
			species
			types
			abilities {
				...abilities
			}
			baseStats {
				...stats
			}
			gender {
				...genders
			}
			baseStatsTotal
			color
			eggGroups
			evolutionLevel
			height
			weight
			otherFormes
			cosmeticFormes
			${spriteToGet}
			smogonTier
			bulbapediaPage
			serebiiPage
			smogonPage
			flavorTexts {
				...flavors
			}
		}

		fragment evolutionsData on DexDetails {
			species
			evolutionLevel
		}

		fragment evolutions on DexDetails {
			evolutions {
				...evolutionsData
				evolutions {
					...evolutionsData
				}
			}
			preevolutions {
				...evolutionsData
				preevolutions {
					...evolutionsData
				}
			}
		}

		query getPokemonDetails($pokemon: String!) {
			getPokemonDetailsByFuzzy(pokemon: $pokemon, skip: 0, take: 1, reverse: true) {
				...dexdetails
				...evolutions
			}
		}
`;
};

export const getPokemonFlavorTextsByFuzzy = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		${FlavorsFrament}

		fragment flavortexts on DexDetails {
			flavorTexts {
				...flavors
			}
		}

		query getPokemonFlavors($pokemon: String!) {
			getPokemonDetailsByFuzzy(pokemon: $pokemon, skip: 0, reverse: true, take: 50) {
				${spriteToGet}
				num
				species
				color
				...flavortexts
			}
		}
`;
};

export const getAbilityDetailsByFuzzy = gql`
	fragment ability on AbilityEntry {
		desc
		shortDesc
		name
		isFieldAbility
		bulbapediaPage
		serebiiPage
		smogonPage
	}

	query getAbilityDetails($ability: String!) {
		getAbilityDetailsByFuzzy(ability: $ability, skip: 0, take: 1) {
			...ability
		}
	}
`;

export const getItemDetailsByFuzzy = gql`
	fragment items on ItemEntry {
		desc
		name
		bulbapediaPage
		serebiiPage
		smogonPage
		sprite
		isNonstandard
		generationIntroduced
	}

	query getItemDetails($item: String!) {
		getItemDetailsByFuzzy(item: $item, skip: 0, take: 1) {
			...items
		}
	}
`;

export const getPokemonLearnsetByFuzzy = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		fragment learnsetLevelupMove on LearnsetLevelUpMove {
			name
			generation
			level
		}
		fragment learnsetMove on LearnsetMove {
			name
			generation
		}

		fragment learnset on LearnsetEntry {
			num
			species
			${spriteToGet}
			color
			levelUpMoves {
				...learnsetLevelupMove
			}
			virtualTransferMoves {
				...learnsetMove
			}
			tutorMoves {
				...learnsetMove
			}
			tmMoves {
				...learnsetMove
			}
			eggMoves {
				...learnsetMove
			}
			eventMoves {
				...learnsetMove
			}
			dreamworldMoves {
				...learnsetMove
			}
		}

		query getLearnsetDetails($pokemon: String!, $moves: [String!]!, $generation: Int) {
			getPokemonLearnsetByFuzzy(pokemon: $pokemon, moves: $moves, generation: $generation) {
				...learnset
			}
		}
`;
};

export const getMoveDetailsByFuzzy = gql`
	fragment moves on MoveEntry {
		name
		shortDesc
		type
		basePower
		pp
		category
		accuracy
		priority
		target
		contestType
		bulbapediaPage
		serebiiPage
		smogonPage
		isNonstandard
		isZ
		isGMax
		desc
		maxMovePower
		zMovePower
		isFieldMove
	}

	query getMoveDetails($move: String!) {
		getMoveDetailsByFuzzy(move: $move, skip: 0, take: 1) {
			...moves
		}
	}
`;

export const getTypeMatchup = gql`
	fragment typeEntry on TypeEntry {
		doubleEffectiveTypes
		effectiveTypes
		normalTypes
		resistedTypes
		doubleResistedTypes
		effectlessTypes
	}

	fragment typesMatchups on TypeMatchups {
		attacking {
			...typeEntry
		}
		defending {
			...typeEntry
		}
	}

	query getTypeMatchups($types: [Types!]!) {
		getTypeMatchup(types: $types) {
			...typesMatchups
		}
	}
`;

export const getPokemonSprite = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		query getPokemonSprites($pokemon: String!) {
			getPokemonDetailsByFuzzy(pokemon: $pokemon) {
				${spriteToGet}
			}
		}
`;
};

export const getSpriteKey = ({
	backSprite = false,
	shinySprite = false
}: GetPokemonSpriteParameters): 'sprite' | 'shinySprite' | 'backSprite' | 'shinyBackSprite' => {
	if (backSprite && shinySprite) return 'shinyBackSprite';
	if (backSprite) return 'backSprite';
	if (shinySprite) return 'shinySprite';

	return 'sprite';
};

export async function fetchGraphQLPokemon<R extends PokemonQueryReturnTypes>(
	query: string,
	variables: PokemonQueryVariables<R>
): Promise<PokemonResponse<R>> {
	try {
		return fetch<PokemonResponse<R>>(
			envParseString('GRAPHQL_POKEMON_URL'),
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': MimeTypes.ApplicationJson
				},
				body: JSON.stringify({
					query,
					variables
				})
			},
			FetchResultTypes.JSON
		);
	} catch {
		throw new UserError({ identifier: LanguageKeys.System.QueryFail });
	}
}

/**
 * Parses a Bulbapedia-like URL to be properly embeddable on Discord
 * @param url URL to parse
 */
export const parseBulbapediaURL = (url: string) => url.replace(/[ ]/g, '_').replace(/\(/g, '%28').replace(/\)/g, '%29');

/** Parses PokéDex colours to Discord MessageEmbed colours */
export const resolveColour = (col: string) => {
	switch (col) {
		case 'Black':
			return 0x323232;
		case 'Blue':
			return 0x257cff;
		case 'Brown':
			return 0xa3501a;
		case 'Gray':
			return 0x969696;
		case 'Green':
			return 0x3eff4e;
		case 'Pink':
			return 0xff65a5;
		case 'Purple':
			return 0xa63de8;
		case 'Red':
			return 0xff3232;
		case 'White':
			return 0xe1e1e1;
		case 'Yellow':
			return 0xfff359;
		default:
			return 0xff0000;
	}
};

export interface GetPokemonSpriteParameters {
	backSprite?: boolean;
	shinySprite?: boolean;
}

export interface PokemonResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

export type PokemonQueryReturnTypes = keyof Pick<
	Query,
	| 'getAbilityDetailsByFuzzy'
	| 'getItemDetailsByFuzzy'
	| 'getMoveDetailsByFuzzy'
	| 'getPokemonDetailsByFuzzy'
	| 'getPokemonLearnsetByFuzzy'
	| 'getTypeMatchup'
>;

type PokemonQueryVariables<R extends PokemonQueryReturnTypes> = R extends 'getAbilityDetailsByFuzzy'
	? QueryGetAbilityDetailsByFuzzyArgs
	: R extends 'getItemDetailsByFuzzy'
	? QueryGetItemDetailsByFuzzyArgs
	: R extends 'getMoveDetailsByFuzzy'
	? QueryGetMoveDetailsByFuzzyArgs
	: R extends 'getPokemonDetailsByFuzzy'
	? QueryGetPokemonDetailsByFuzzyArgs
	: R extends 'getPokemonLearnsetByFuzzy'
	? QueryGetPokemonLearnsetByFuzzyArgs
	: R extends 'getTypeMatchup'
	? QueryGetTypeMatchupArgs
	: never;
