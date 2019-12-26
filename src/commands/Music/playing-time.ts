import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';
import { showSeconds } from '../../lib/util/util';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pt'],
			description: language => language.tget('COMMAND_PLAYING_TIME_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'VOICE_PLAYING']
		});
	}

	public async run(message: KlasaMessage) {
		if (message.guild!.music.song === null) throw `Uhm... I think I missed something... oh yeah, I'm not playing anything.`;
		return (message.guild!.music.song.stream
			? message.sendLocale('COMMAND_TIME_STREAM')
			: message.sendLocale('COMMAND_TIME_REMAINING', [showSeconds(message.guild!.music.trackRemaining)]));
	}

}
