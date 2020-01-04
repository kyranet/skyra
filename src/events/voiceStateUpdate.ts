import { Event } from 'klasa';
import { VoiceState } from 'discord.js';
import { CLIENT_ID } from '../../config';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public async run(oldState: VoiceState, newState: VoiceState) {
		const { music } = newState.guild;

		if (newState.id === CLIENT_ID) {
			// If both channels were the same, skip
			if (oldState.channelID === newState.channelID) return;

			if (newState.channel === null) {
				this.client.emit(Events.MusicVoiceChannelLeave, music, oldState.channel);
			} else {
				this.client.emit(Events.MusicVoiceChannelJoin, music, newState.channel);
			}
		} else if (music.voiceChannel !== null) {
			if (music.playing) {
				if (music.listeners.length === 0) await music.pause(true);
			} else if (music.paused && music.systemPaused) {
				if (music.listeners.length !== 0) await music.resume();
			}
		}
	}

}
