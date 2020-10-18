import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import {
	requireDj,
	requireQueueNotEmpty,
	requireSameVoiceChannel,
	requireSkyraInVoiceChannel,
	requireUserInVoiceChannel
} from '@utils/Music/Decorators';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.PromoteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.PromoteExtended),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireDj()
	@requireQueueNotEmpty()
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	public async run(message: GuildMessage, [index]: [number]) {
		if (index <= 0) throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexInvalid);
		--index;

		const { audio } = message.guild;
		const length = await audio.length();
		if (index >= length) {
			throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: message.language.get(
					length === 1 ? LanguageKeys.Commands.Music.AddPlaylistSongs : LanguageKeys.Commands.Music.AddPlaylistSongsPlural,
					{
						count: length
					}
				)
			});
		}

		await audio.move(index, 0);

		// TODO(kyranet): add message reply.
	}
}
