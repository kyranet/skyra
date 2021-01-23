import { FT, T } from '#lib/types';

export const ChannelNotReadable = T<string>('errors:channelNotReadable');
export const CommandmessageMissing = T<string>('klasa:commandMessageMissing');
export const CommandmessageMissingRequired = FT<{ name: string }, string>('klasa:commandMessageMissingRequired');
export const CommandmessageNomatch = FT<{ possibles: string }, string>('klasa:commandMessageNoMatch');
export const ConfigurationEquals = T<string>('commands/management:configurationEquals');
export const ConfigurationTextChannelRequired = T<string>('commands/management:configurationTextChannelRequired');
export const JumpTo = T<string>('system:jumpTo');
export const MessagePromptTimeout = T<string>('klasa:messagePromptTimeout');
export const PrefixReminder = FT<{ prefix: string }, string>('system:prefixReminder');
export const RestrictionNotConfigured = T<string>('moderation:restrictionNotConfigured');
export const SystemTextTruncated = FT<{ definition: string; url: string }, string>('commands/tools:systemTextTruncated');
export const TextPromptAbortOptions = T<readonly string[]>('klasa:textPromptAbortOptions');
export const UnexpectedIssue = T<string>('errors:unexpectedIssue');
export const UnknownChannel = T<string>('resolvers:unknownChannel');
export const UnknownRole = T<string>('resolvers:unknownRole');
export const UnknownUser = T<string>('resolvers:unknownUser');
export const UserNotExistent = T<string>('errors:userNotExistent');
export const UserNotInGuild = T<string>('errors:userNotInGuild');
export const MonitorCommandHandlerReprompt = FT<{ tag: string; name: string; time: number; cancelOptions: string }, string>(
	'klasa:monitorCommandHandlerReprompt'
);
export const MonitorCommandHandlerRepeatingReprompt = FT<{ tag: string; name: string; time: number; cancelOptions: string }, string>(
	'klasa:monitorCommandHandlerRepeatingReprompt'
);
