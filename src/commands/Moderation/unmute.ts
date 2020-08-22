import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';
import { KlasaMessage } from 'klasa';
import { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['um'],
	description: (language) => language.get('COMMAND_UNMUTE_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_UNMUTE_EXTENDED'),
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	private readonly kPath = GuildSettings.Roles.Muted;

	public inhibit(message: KlasaMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const id = message.guild.settings.get(this.kPath);
		if (id && message.guild.roles.has(id)) return false;
		throw message.language.get('GUILD_SETTINGS_ROLES_RESTRICTED', { prefix: message.guild.settings.get(GuildSettings.Prefix), path: this.kPath });
	}

	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.unMute(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}
}
