import { envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import type {
	Query,
	QueryGetFuzzyFilmArgs,
	QueryGetFuzzyPersonArgs,
	QueryGetFuzzyPlanetArgs,
	QueryGetFuzzySpeciesArgs,
	QueryGetFuzzyStarshipArgs,
	QueryGetFuzzyVehicleArgs
} from '@skyra/star-wars-api';
import { gql } from '../util';

export const getFilms = gql`
	query ($film: String!) {
		getFuzzyFilm(film: $film, take: 10) {
			director
			episodeId
			releaseDate
			openingCrawl
			producers
			title
			characters {
				name
			}
			planets {
				name
			}
			species {
				name
			}
			starships {
				name
			}
			vehicles {
				name
			}
		}
	}
`;

export async function fetchStarWarsApi<R extends StarWarsQueryReturnTypes>(
	query: string,
	variables: StarWarsQueryVariables<R>
): Promise<StarWarsResponse<R>> {
	try {
		return fetch<StarWarsResponse<R>>(
			envParseString('GRAPHQL_STARWARS_URL'),
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
	} catch (error) {
		throw new UserError({ identifier: LanguageKeys.System.QueryFail });
	}
}

export interface StarWarsResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

export type StarWarsQueryReturnTypes = keyof Pick<
	Query,
	'getFuzzyFilm' | 'getFuzzyPerson' | 'getFuzzyPlanet' | 'getFuzzySpecies' | 'getFuzzyStarship' | 'getFuzzyVehicle'
>;

type StarWarsQueryVariables<R extends StarWarsQueryReturnTypes> = R extends 'getFuzzyFilm'
	? QueryGetFuzzyFilmArgs
	: R extends 'getFuzzyPlanet'
	? QueryGetFuzzyPlanetArgs
	: R extends 'getFuzzyPerson'
	? QueryGetFuzzyPersonArgs
	: R extends 'getFuzzySpecies'
	? QueryGetFuzzySpeciesArgs
	: R extends 'getFuzzyStarship'
	? QueryGetFuzzyStarshipArgs
	: R extends 'getFuzzyVehicle'
	? QueryGetFuzzyVehicleArgs
	: never;
