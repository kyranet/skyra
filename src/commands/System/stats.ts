import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { roundNumber } from '@sapphire/utilities';
import { MessageEmbed, version } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { cpus, uptime } from 'os';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['stats', 'sts'],
			bucket: 2,
			cooldown: 15,
			description: (language) => language.get('COMMAND_STATS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_STATS_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage) {
		return message.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: KlasaMessage) {
		const TITLES = message.language.get('COMMAND_STATS_TITLES');
		const FIELDS = message.language.get('COMMAND_STATS_FIELDS', {
			stats: this.generalStatistics,
			uptime: this.uptimeStatistics,
			usage: this.usageStatistics
		});
		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.addField(TITLES.STATS, FIELDS.STATS)
			.addField(TITLES.UPTIME, FIELDS.UPTIME)
			.addField(TITLES.SERVER_USAGE, FIELDS.SERVER_USAGE);
	}

	private get generalStatistics(): StatsGeneral {
		return {
			CHANNELS: this.client.channels.size.toLocaleString(),
			GUILDS: this.client.guilds.size.toLocaleString(),
			NODE_JS: process.version,
			USERS: this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString(),
			VERSION: `v${version}`
		};
	}

	private get uptimeStatistics(): StatsUptime {
		return {
			CLIENT: this.client.uptime!,
			HOST: uptime() * 1000,
			TOTAL: process.uptime() * 1000
		};
	}

	private get usageStatistics(): StatsUsage {
		const usage = process.memoryUsage();
		return {
			CPU_LOAD: cpus().map(({ times }) => roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100),
			RAM_TOTAL: `${Math.round(100 * (usage.heapTotal / 1048576)) / 100}MB`,
			RAM_USED: `${Math.round(100 * (usage.heapUsed / 1048576)) / 100}MB`
		};
	}
}

export interface StatsGeneral {
	CHANNELS: string;
	GUILDS: string;
	NODE_JS: string;
	USERS: string;
	VERSION: string;
}

export interface StatsUptime {
	CLIENT: number;
	HOST: number;
	TOTAL: number;
}

export interface StatsUsage {
	CPU_LOAD: number[];
	RAM_TOTAL: string;
	RAM_USED: string;
}
