import { fetch, FetchMethods, FetchResultTypes } from '#utils/util';
import { PubSubHooksAction } from './Shared';
import FormData from 'form-data';
import { Time } from '#utils/constants';

const SUBSCRIPTION_URL = 'https://pubsubhubbub.appspot.com/subscribe';

export async function subscribe(channelID: string, action: PubSubHooksAction = PubSubHooksAction.Subscribe) {
	const form = new FormData();
	form.append('hub.mode', action);
	form.append('hub.callback', `${process.env.YOUTUBE_CALLBACK}${channelID}`);
	form.append('hub.topic', `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelID}`);
	form.append('hub.lease_seconds', (9 * Time.Day) / Time.Second);

	await fetch(SUBSCRIPTION_URL, {
		method: FetchMethods.Post,
		body: form
	});
}

export function getInfo(input: string): Promise<ResultOk> {
	const url = new URL('https://youtube.googleapis.com/youtube/v3/search');
	url.searchParams.append('part', 'snippet');
	url.searchParams.append('safeSearch', 'strict');
	url.searchParams.append('q', input);
	url.searchParams.append('key', process.env.GOOGLE_API_TOKEN);

	return fetch<ResultOk>(url, FetchResultTypes.JSON);
}

export interface ResultOk {
	kind: string;
	etag: string;
	nextPageToken: string;
	regionCode: string;
	pageInfo: ResultOkPageInfo;
	items: ResultOkItem[];
}

export interface ResultOkItem {
	kind: string;
	etag: string;
	id: ResultOkID;
	snippet: ResultOkSnippet;
}

export interface ResultOkID {
	kind: string;
	playlistId?: string;
	channelId?: string;
	videoId?: string;
}

export interface ResultOkSnippet {
	publishedAt: Date;
	channelId: string;
	title: string;
	description: string;
	thumbnails: ResultOkThumbnails;
	channelTitle: string;
	liveBroadcastContent: string;
}

export interface ResultOkThumbnails {
	default: ResultOkThumbnail;
	medium: ResultOkThumbnail;
	high: ResultOkThumbnail;
}

export interface ResultOkThumbnail {
	url: string;
	width: number;
	height: number;
}

export interface ResultOkPageInfo {
	totalResults: number;
	resultsPerPage: number;
}
