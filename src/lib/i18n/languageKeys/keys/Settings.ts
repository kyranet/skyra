import { T } from '#lib/types';

export const Prefix = T<string>('settings:prefix');
export const Language = T<string>('settings:language');
export const DisabledCommands = T<string>('settings:disabledCommands');
export const DisableNaturalPrefix = T<string>('settings:disableNaturalPrefix');
export const BirthdayChannel = T<string>('settings:birthdayChannel');
export const BirthdayMessage = T<string>('settings:birthdayMessage');
export const BirthdayRole = T<string>('settings:birthdayRole');
export const ChannelsAnnouncements = T<string>('settings:channelsAnnouncements');
export const ChannelsFarewell = T<string>('settings:channelsFarewell');
export const ChannelsGreeting = T<string>('settings:channelsGreeting');
export const ChannelsImageLogs = T<string>('settings:channelsImageLogs');
export const ChannelsMemberLogs = T<string>('settings:channelsMemberLogs');
export const ChannelsMessageLogs = T<string>('settings:channelsMessageLogs');
export const ChannelsModerationLogs = T<string>('settings:channelsModerationLogs');
export const ChannelsNsfwMessageLogs = T<string>('settings:channelsNsfwMessageLogs');
export const ChannelsPruneLogs = T<string>('settings:channelsPruneLogs');
export const ChannelsReactionLogs = T<string>('settings:channelsReactionLogs');
export const ChannelsSpam = T<string>('settings:channelsSpam');
export const ChannelsIgnoreMessageDelete = T<string>('settings:channelsIgnoreMessageDelete');
export const ChannelsIgnoreMessageEdit = T<string>('settings:channelsIgnoreMessageEdit');
export const ChannelsIgnoreReactionAdd = T<string>('settings:channelsIgnoreReactionAdd');
export const ChannelsIgnoreAll = T<string>('settings:channelsIgnoreAll');
export const DisabledChannels = T<string>('settings:disabledChannels');
export const EventsBanAdd = T<string>('settings:eventsBanAdd');
export const EventsBanRemove = T<string>('settings:eventsBanRemove');
export const EventsMemberAdd = T<string>('settings:eventsMemberAdd');
export const EventsMemberNickNameUpdate = T<string>('settings:eventsMemberNickNameUpdate');
export const EventsMemberUserNameUpdate = T<string>('settings:eventsMemberUserNameUpdate');
export const EventsMemberRoleUpdate = T<string>('settings:eventsMemberRoleUpdate');
export const EventsMemberRemove = T<string>('settings:eventsMemberRemove');
export const EventsMessageDelete = T<string>('settings:eventsMessageDelete');
export const EventsMessageEdit = T<string>('settings:eventsMessageEdit');
export const EventsTwemojiReactions = T<string>('settings:eventsTwemojiReactions');
export const MessagesFarewell = T<string>('settings:messagesFarewell');
export const MessagesGreeting = T<string>('settings:messagesGreeting');
export const MessagesIgnoreChannels = T<string>('settings:messagesIgnoreChannels');
export const MessagesJoinDM = T<string>('settings:messagesJoinDm');
export const MessagesModerationAutoDelete = T<string>('settings:messagesModerationAutoDelete');
export const MessagesModerationDM = T<string>('settings:messagesModerationDm');
export const MessagesModerationMessageDisplay = T<string>('settings:messagesModerationMessageDisplay');
export const MessagesModerationReasonDisplay = T<string>('settings:messagesModerationReasonDisplay');
export const MessagesModeratorNameDisplay = T<string>('settings:messagesModeratorNameDisplay');
export const MessagesAnnouncementEmbed = T<string>('settings:messagesAnnouncementEmbed');
export const MusicAllowStreams = T<string>('settings:musicAllowStreams');
export const MusicAllowedVoiceChannels = T<string>('settings:musicAllowedVoiceChannels');
export const MusicAllowedRoles = T<string>('settings:musicAllowedRoles');
export const MusicDefaultVolume = T<string>('settings:musicDefaultVolume');
export const MusicMaximumDuration = T<string>('settings:musicMaximumDuration');
export const MusicMaximumEntriesPerUser = T<string>('settings:musicMaximumEntriesPerUser');
export const NoMentionSpamAlerts = T<string>('settings:noMentionSpamAlerts');
export const NoMentionSpamEnabled = T<string>('settings:noMentionSpamEnabled');
export const NoMentionSpamMentionsAllowed = T<string>('settings:noMentionSpamMentionsAllowed');
export const NoMentionSpamTimePeriod = T<string>('settings:noMentionSpamTimePeriod');
export const RolesAdmin = T<string>('settings:rolesAdmin');
export const RolesDj = T<string>('settings:rolesDj');
export const RolesInitial = T<string>('settings:rolesInitial');
export const RolesModerator = T<string>('settings:rolesModerator');
export const RolesMuted = T<string>('settings:rolesMuted');
export const RolesPublic = T<string>('settings:rolesPublic');
export const RolesRemoveInitial = T<string>('settings:rolesRemoveInitial');
export const RolesRestrictedAttachment = T<string>('settings:rolesRestrictedAttachment');
export const RolesRestrictedEmbed = T<string>('settings:rolesRestrictedEmbed');
export const RolesRestrictedEmoji = T<string>('settings:rolesRestrictedEmoji');
export const RolesRestrictedReaction = T<string>('settings:rolesRestrictedReaction');
export const RolesRestrictedVoice = T<string>('settings:rolesRestrictedVoice');
export const RolesSubscriber = T<string>('settings:rolesSubscriber');
export const SelfmodAttachmentsEnabled = T<string>('settings:selfmodAttachmentsEnabled');
export const SelfmodAttachmentsIgnoredChannels = T<string>('settings:selfmodAttachmentsIgnoredChannels');
export const SelfmodAttachmentsIgnoredRoles = T<string>('settings:selfmodAttachmentsIgnoredRoles');
export const SelfmodCapitalsEnabled = T<string>('settings:selfmodCapitalsEnabled');
export const SelfmodCapitalsIgnoredChannels = T<string>('settings:selfmodCapitalsIgnoredChannels');
export const SelfmodCapitalsIgnoredRoles = T<string>('settings:selfmodCapitalsIgnoredRoles');
export const SelfmodCapitalsMaximum = T<string>('settings:selfmodCapitalsMaximum');
export const SelfmodCapitalsMinimum = T<string>('settings:selfmodCapitalsMinimum');
export const SelfmodFilterEnabled = T<string>('settings:selfmodFilterEnabled');
export const SelfmodFilterIgnoredChannels = T<string>('settings:selfmodFilterIgnoredChannels');
export const SelfmodFilterIgnoredRoles = T<string>('settings:selfmodFilterIgnoredRoles');
export const SelfmodIgnoreChannels = T<string>('settings:selfmodIgnoreChannels');
export const SelfmodInvitesEnabled = T<string>('settings:selfmodInvitesEnabled');
export const SelfmodInvitesIgnoredChannels = T<string>('settings:selfmodInvitesIgnoredChannels');
export const SelfmodInvitesIgnoredRoles = T<string>('settings:selfmodInvitesIgnoredRoles');
export const SelfmodInvitesIgnoredCodes = T<string>('settings:selfmodInvitesIgnoredCodes');
export const SelfmodInvitesIgnoredGuilds = T<string>('settings:selfmodInvitesIgnoredGuilds');
export const SelfmodLinksEnabled = T<string>('settings:selfmodLinksEnabled');
export const SelfmodLinksIgnoredChannels = T<string>('settings:selfmodLinksIgnoredChannels');
export const SelfmodLinksIgnoredRoles = T<string>('settings:selfmodLinksIgnoredRoles');
export const SelfmodLinksAllowed = T<string>('settings:selfmodLinksAllowed');
export const SelfmodMessagesEnabled = T<string>('settings:selfmodMessagesEnabled');
export const SelfmodMessagesIgnoredChannels = T<string>('settings:selfmodMessagesIgnoredChannels');
export const SelfmodMessagesIgnoredRoles = T<string>('settings:selfmodMessagesIgnoredRoles');
export const SelfmodMessagesMaximum = T<string>('settings:selfmodMessagesMaximum');
export const SelfmodMessagesQueueSize = T<string>('settings:selfmodMessagesQueueSize');
export const SelfmodNewlinesEnabled = T<string>('settings:selfmodNewlinesEnabled');
export const SelfmodNewlinesIgnoredChannels = T<string>('settings:selfmodNewlinesIgnoredChannels');
export const SelfmodNewlinesIgnoredRoles = T<string>('settings:selfmodNewlinesIgnoredRoles');
export const SelfmodNewlinesMaximum = T<string>('settings:selfmodNewlinesMaximum');
export const SelfmodReactionsMaximum = T<string>('settings:selfmodReactionsMaximum');
export const SelfmodReactionsBlocked = T<string>('settings:selfmodReactionsBlocked');
export const SelfmodReactionsEnabled = T<string>('settings:selfmodReactionsEnabled');
export const SelfmodReactionsIgnoredChannels = T<string>('settings:selfmodReactionsIgnoredChannels');
export const SelfmodReactionsIgnoredRoles = T<string>('settings:selfmodReactionsIgnoredRoles');
export const SelfmodReactionsAllowed = T<string>('settings:selfmodReactionsAllowed');
export const SocialEnabled = T<string>('settings:socialEnabled');
export const SocialMultiplier = T<string>('settings:socialMultiplier');
export const SocialAchieve = T<string>('settings:socialAchieve');
export const SocialAchieveMessage = T<string>('settings:socialAchieveMessage');
export const SocialIgnoredChannels = T<string>('settings:socialIgnoredChannels');
export const SocialIgnoredRoles = T<string>('settings:socialIgnoredRoles');
export const StarboardChannel = T<string>('settings:starboardChannel');
export const StarboardIgnoreChannels = T<string>('settings:starboardIgnoreChannels');
export const StarboardMinimum = T<string>('settings:starboardMinimum');
export const StarboardSelfStar = T<string>('settings:starboardSelfStar');
export const SuggestionsChannel = T<string>('settings:suggestionsChannel');
export const SuggestionsEmojisUpvote = T<string>('settings:suggestionsEmojisUpvote');
export const SuggestionsEmojisDownvote = T<string>('settings:suggestionsEmojisDownvote');
export const SuggestionsOnActionDM = T<string>('settings:suggestionsOnActionDm');
export const SuggestionsOnActionRepost = T<string>('settings:suggestionsOnActionRepost');
export const SuggestionsOnActionHideAuthor = T<string>('settings:suggestionsOnActionHideAuthor');
export const DashboardOnlyKey = T<string>('settings:dashboardOnlyKey');

export * as Gateway from './settings/Gateway';
