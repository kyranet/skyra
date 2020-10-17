import { Queue } from '@lib/audio';
import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireSongPresent } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.SkipDescription),
	usage: '[force]'
})
export default class extends MusicCommand {
	@requireSongPresent()
	public async run(message: KlasaMessage, [force = false]: [boolean]) {
		const { audio } = message.guild!;

		if (audio.listeners.length >= 4) {
			if (force) {
				if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator))) {
					throw message.language.get(LanguageKeys.Commands.Music.SkipPermissions);
				}
			} else {
				const response = this.handleSkips(audio, message.author.id);
				if (response) return message.sendMessage(response);
			}
		}

		await audio.next();
	}

	public handleSkips(audio: Queue, user: string): string | false {
		const song = audio.song || audio.queue[0];
		if (song.skips.has(user)) return audio.guild.language.get(LanguageKeys.Commands.Music.SkipVotesVoted);
		song.skips.add(user);
		const members = audio.listeners.length;
		return this.shouldInhibit(audio, members, song.skips.size);
	}

	public shouldInhibit(musicManager: MusicHandler, total: number, size: number): false | string {
		if (total <= 3) return false;

		const needed = Math.ceil(total * 0.4);
		return size >= needed ? false : musicManager.guild.language.get(LanguageKeys.Commands.Music.SkipVotesTotal, { amount: size, needed });
	}
}
