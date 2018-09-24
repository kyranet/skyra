// @ts-nocheck
const { Extendable, GuildMember } = require('../index');

module.exports = class extends Extendable {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: [GuildMember] });
	}

	public async fetchRank() {
		const list = await this.client.leaderboard.getMembers(this.guild.id);

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.user.username;
		return rank.position;
	}

};
