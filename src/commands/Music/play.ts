import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import { Track } from 'lavalink';

@ApplyOptions<MusicCommandOptions>({
	description: language => language.tget('COMMAND_PLAY_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_PLAY_EXTENDED'),
	music: ['USER_VOICE_CHANNEL'],
	usage: '(song:song)',
	flagSupport: true
})
export default class extends MusicCommand {

	public async run(message: KlasaMessage, [songs]: [Track[]]) {
		const { music } = message.guild!;

		if (songs) {
			// If there are songs, add them
			await this.client.commands.get('add')!.run(message, [songs]);
			if (music.playing) return;
		} else if (!music.canPlay) {
			await message.sendLocale('COMMAND_QUEUE_EMPTY');
			return;
		}

		// If Skyra is not in a voice channel, join
		if (!music.voiceChannel) {
			await this.client.commands.get('join')!.run(message, []);
		}

		if (music.playing) {
			await message.sendLocale('COMMAND_PLAY_QUEUE_PLAYING');
		} else if (music.song) {
			await music.resume(this.getContext(message));
			await message.sendLocale('COMMAND_PLAY_QUEUE_PAUSED', [music.song]);
		} else {
			music.channelID = message.channel.id;
			await music.play();
		}
	}

}
