import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../../lib/structures/api/ApiRequest';
import ApiResponse from '../../../lib/structures/api/ApiResponse';
import { ratelimit, iteratorRange } from '../../../lib/util/util';
import { LeaderboardUser } from '../../../lib/util/Leaderboard';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'localLeaderboard', route: 'guilds/:guild/leaderboard' });
	}

	@ratelimit(2, 2500)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.get(guildID);
		if (!guild) return response.error(400);

		const limit = 'limit' in request.query ? Number(request.query.limit) : 10;
		if (!Number.isInteger(limit) || limit <= 0 || limit > 100) return response.error(400);

		const before = 'before' in request.query ? Number(request.query.before) : null;
		if (before !== null && (!Number.isInteger(before) || before <= 0 || before > 2500 - limit)) return response.error(400);

		const after = 'after' in request.query ? Number(request.query.after) : null;
		if (after !== null && (!Number.isInteger(after) || after <= 0 || after > 2500)) return response.error(400);

		const start = before === null ? after === null ? 0 : after : before - limit;
		const leaderboard = await this.client.leaderboard.fetch(guildID);
		const results = iteratorRange(leaderboard.entries(), start, limit);

		return response.json(await this.fetchAllEntries(results));
	}

	private async fetchAllEntries(results: readonly [string, LeaderboardUser][]) {
		const promises: Promise<unknown>[] = [];
		for (const [id, element] of results) {
			if (element.name === null) {
				promises.push(this.client.userTags.fetchUsername(id).then(username => {
					element.name = username;
				}));
			}
		}
		await Promise.all(promises);

		const payload: Payload[] = [];
		for (const [id, element] of results) {
			const userTag = this.client.userTags.get(id)!;
			payload.push({
				avatar: userTag.avatar,
				username: userTag.username,
				discriminator: userTag.discriminator,
				points: element.points,
				position: element.position
			});
		}
		return payload;
	}

}

interface Payload {
	avatar: string | null;
	username: string;
	discriminator: string;
	points: number;
	position: number;
}
