import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { SelfModerationCommand } from '#lib/structures/SelfModerationCommand';
import { SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { KeyOfType } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['attachment-mode', 'attachments-mode', 'att-mode', 'manageAttachment', 'manageattachment'],
	description: LanguageKeys.Commands.Management.AttachmentsModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.AttachmentsModeExtended
})
export default class extends SelfModerationCommand {
	protected $adder: AdderKey = 'attachments';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Attachments.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Attachments.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.ThresholdDuration;
}
