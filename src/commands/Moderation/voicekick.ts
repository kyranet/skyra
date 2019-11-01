import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { Moderation } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_VOICEKICK_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VOICEKICK_EXTENDED'),
			modType: Moderation.TypeCodes.VoiceKick,
			permissionLevel: 5,
			requiredMember: true,
			requiredPermissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS']
		});
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, _member: GuildMember, reason: string | null) {
		return message.guild!.security.actions.voiceKick({
			user_id: target.id,
			moderator_id: message.author.id,
			reason
		});
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: unknown) {
		const member = await super.checkModeratable(message, target, prehandled);
		if (member && !member.voice.channelID) throw message.language.tget('GUILD_MEMBER_NOT_VOICECHANNEL');
		return member;
	}

}
