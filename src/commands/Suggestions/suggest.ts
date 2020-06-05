import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_SUGGEST_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_SUGGEST_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<suggestion:string>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [suggestion]: [string]) {
		const suggestionsChannelID = message.guild!.settings.get(GuildSettings.Suggestions.SuggestionsChannel)!;

		const suggestionsChannel = this.client.channels.get(suggestionsChannelID) as TextChannel;
		// Get the next suggestion ID
		const suggestionID = message.guild!.settings.get(GuildSettings.Suggestions.AscendingID);

		// Post the suggestion
		const suggestionsMessage = await suggestionsChannel.send(new MessageEmbed()
			.setColor(BrandingColors.Primary)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ format: 'png', size: 128, dynamic: true }))
			.setTitle(message.language.tget('COMMAND_SUGGEST_TITLE', suggestionID))
			.setDescription(suggestion));

		// Add the upvote/downvote reactions
		const reactArray = [
			message.guild!.settings.get(GuildSettings.Suggestions.VotingEmojis.UpvoteEmoji),
			message.guild!.settings.get(GuildSettings.Suggestions.VotingEmojis.DownvoteEmoji)
		];
		for (const emoji of reactArray) {
			await suggestionsMessage.react(emoji);
		}

		// Commit the suggestion to the DB
		await this.client.queries.insertSuggestion({
			id: suggestionID,
			author_id: message.author.id,
			guild_id: message.guild!.id,
			message_id: suggestionsMessage.id
		});

		// Increase the next id
		await message.guild!.settings.increase(GuildSettings.Suggestions.AscendingID, 1);

		return message.sendLocale('COMMAND_SUGGEST_SUCCESS', [suggestionsChannel]);
	}

	public async inhibit(message: KlasaMessage): Promise<boolean> {
		// If the message that triggered this is not this command (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const suggestionID = message.guild.settings.get(GuildSettings.Suggestions.SuggestionsChannel);
		if (suggestionID !== null) return true;
		return this.setChannel(message);
	}

	private async setChannel(message: KlasaMessage) {
		const resMessage = await message.sendLocale('COMMAND_SUGGEST_NOSETUP', [message.author.username]);

		// If the user doesn't have the rights to change guild configuration, do not proceed
		const manageable = await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator);
		if (!manageable) return true;

		// Ask the user if they want to setup a channel
		const setup = await message.ask({ content: message.language.tget('COMMAND_SUGGEST_NOSETUP_ASK', message.author.username) });
		if (!setup) {
			await resMessage.edit(message.language.tget('COMMAND_SUGGEST_NOSETUP_ABORT'));
			return true;
		}

		// Get the channel
		const channel = (await message.prompt(message.language.tget('COMMAND_SUGGEST_CHANNEL_PROMPT'))).mentions.channels.first() || null;
		if (!channel || channel.guild.id !== message.guild!.id) {
			await resMessage.edit(message.language.tget('COMMAND_SUGGEST_CHANNEL_INVALID'));
			return true;
		}

		// Update settings
		await message.guild!.settings.update(GuildSettings.Suggestions.SuggestionsChannel, channel);
		await resMessage.nuke();
		await message.sendLocale('COMMAND_CONF_MENU_SAVED');

		return true;
	}

}
