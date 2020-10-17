import { Queue } from '@lib/audio';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { OutgoingWebsocketAction } from '@lib/websocket/types';

export default class extends AudioEvent {
	public run(queue: Queue, voiceChannelID: string) {
		for (const subscription of this.getWebSocketListenersFor(queue.guildID)) {
			subscription.send({ action: OutgoingWebsocketAction.MusicConnect, data: { voiceChannel: voiceChannelID } });
		}
	}
}
