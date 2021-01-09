import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes, IMAGE_EXTENSION } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: LanguageKeys.Commands.System.SetAvatarDescription,
	extendedHelp: LanguageKeys.Commands.System.SetAvatarExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '(attachment:attachment)'
})
@CreateResolvers([
	[
		'attachment',
		async (arg, possible, message) => {
			if (message.attachments.size) {
				const attachment = message.attachments.find((att) => IMAGE_EXTENSION.test(att.url));
				if (attachment) return fetch(attachment.url, FetchResultTypes.Buffer);
			}
			const url = ((res) => res.protocol && IMAGE_EXTENSION.test(res.pathname) && res.hostname && res.href)(new URL(arg));
			if (url) return fetch(url, FetchResultTypes.Buffer);
			throw await message.resolveKey(LanguageKeys.Resolvers.InvalidUrl, { name: possible.name });
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [avatar]: [string]) {
		await this.client.user!.setAvatar(avatar);
		return message.send(`Dear ${message.author}, I have changed my avatar for you.`);
	}
}
