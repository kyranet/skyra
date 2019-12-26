import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '../../lib/structures/music/MusicHandler';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler, context: MusicHandlerRequestContext | null) {
		if (!manager.systemPaused) {
			const channel = context ? context.channel : manager.channel;

			if (channel) {
				floatPromise(this, channel.sendLocale('COMMAND_PAUSE_SUCCESS'));
			}
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
