import { chunk } from '@klasa/utils';
import { MusicCommand } from '@lib/structures/MusicCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { getColor, showSeconds } from '@utils/util';
import { MessageEmbed, Util } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { BrandingColors } from '@utils/constants';
import { Song } from '@lib/structures/music/Song';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['q'],
			description: language => language.tget('COMMAND_QUEUE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY'],
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage) {
		const { queue, song } = message.guild!.music;
		if (!queue.length || !song) throw message.language.tget(song ? 'COMMAND_QUEUE_LAST' : 'COMMAND_QUEUE_EMPTY');

		// Send the loading message
		const response = await message.send(new MessageEmbed()
			.setColor(BrandingColors.Secondary)
			.setDescription(message.language.tget('SYSTEM_LOADING')));

		// Format the song entries
		const songFields = await Promise.all(queue.map((song, position) => this.generateSongField(message, position, song)));
		const totalDuration = this.calculateTotalDuration(queue);
		const nowPlayingDescription = message.language.tget('COMMAND_QUEUE_NOWPLAYING', song.friendlyDuration, song.safeTitle, song.url, await this.displayUsername(song));
		const totalDescription = message.language.tget('COMMAND_QUEUE_TOTAL', queue.length, showSeconds(totalDuration));

		// Generate the pages with 5 songs each
		const queueDisplay = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(message.language.tget('COMMAND_QUEUE_TITLE', message.guild!.name))
			.addField(message.language.tget('COMMAND_QUEUE_NOWPLAYING_TITLE'), nowPlayingDescription)
			.addField(message.language.tget('COMMAND_QUEUE_TOTAL_TITLE'), totalDescription));

		for (const page of chunk(songFields, 5)) {
			queueDisplay.addPage((embed: MessageEmbed) => embed.setDescription(page.join('\n\n')));
		}

		// Run the display
		await queueDisplay.start(response, message.author.id);
		return response;
	}

	private async generateSongField(message: KlasaMessage, position: number, song: Song) {
		const username = await this.displayUsername(song);
		return message.language.tget('COMMAND_QUEUE_LINE', position + 1, song.friendlyDuration, song.safeTitle, song.url, username);
	}

	private async displayUsername(song: Song) {
		const user = await song.fetchRequester();
		return user === null ? 'Anonymous' : Util.escapeMarkdown(user.username);
	}

	private calculateTotalDuration(songs: Song[]) {
		let accumulator = 0;
		for (const song of songs) {
			if (song.stream) return -1;
			accumulator += song.duration;
		}

		return accumulator;
	}

}
