import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.RemoveDescription),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	public async run(message: KlasaMessage, [index]: [number]) {
		if (index <= 0) throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexInvalid);

		const { audio } = message.guild!;
		const count = await audio.length();
		if (index >= count)
			throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: message.language.get(
					count === 1 ? LanguageKeys.Commands.Music.AddPlaylistSongs : LanguageKeys.Commands.Music.AddPlaylistSongsPlural,
					{
						count
					}
				)
			});

		// Remove the song from the queue
		await audio.removeAt(index);
	}
}
