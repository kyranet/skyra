export const enum Events {
	AnalyticsSync = 'analyticsSync',
	ApiError = 'apiError',
	CommandError = 'commandError',
	CommandInhibited = 'commandInhibited',
	CommandSuccess = 'commandSuccess',
	CommandUnknown = 'commandUnknown',
	CoreSettingsDelete = 'coreSettingsDelete',
	CoreSettingsUpdate = 'coreSettingsUpdate',
	Database = 'database',
	Debug = 'debug',
	Disconnect = 'disconnect',
	Error = 'error',
	EventError = 'eventError',
	FinalizerError = 'finalizerError',
	GuildAnnouncementEdit = 'guildAnnouncementEdit',
	GuildAnnouncementError = 'guildAnnouncementError',
	GuildAnnouncementSend = 'guildAnnouncementSend',
	GuildBanAdd = 'guildBanAdd',
	GuildBanRemove = 'guildBanRemove',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	GuildMessageLog = 'guildMessageLog',
	KlasaReady = 'klasaReady',
	LavalinkClose = 'lavalinkClose',
	LavalinkStart = 'lavalinkStart',
	LavalinkEnd = 'lavalinkEnd',
	LavalinkException = 'lavalinkException',
	LavalinkPlayerUpdate = 'lavalinkPlayerUpdate',
	LavalinkStuck = 'lavalinkStuck',
	LavalinkWebsocketClosed = 'lavalinkWebsocketClosed',
	Log = 'log',
	MentionSpamExceeded = 'mentionSpamExceeded',
	MentionSpamWarning = 'mentionSpamWarning',
	Message = 'message',
	MessageDelete = 'messageDelete',
	MessageDeleteBulk = 'messageDeleteBulk',
	MessageUpdate = 'messageUpdate',
	MoneyPayment = 'moneyPayment',
	MoneyTransaction = 'moneyTransaction',
	MonitorError = 'monitorError',
	ModerationEntryAdd = 'moderationEntryAdd',
	ModerationEntryEdit = 'moderationEntryEdit',
	MusicAdd = 'musicAdd',
	MusicConnect = 'musicConnect',
	MusicSwitch = 'musicSwitch',
	MusicLeave = 'musicLeave',
	MusicPrune = 'musicPrune',
	MusicRemove = 'musicRemove',
	MusicReplayUpdate = 'musicReplayUpdate',
	MusicShuffleQueue = 'musicShuffleQueue',
	MusicSongFinish = 'musicSongFinish',
	MusicSongPause = 'musicSongPause',
	MusicSongPlay = 'musicSongPlay',
	MusicSongReplay = 'musicSongReplay',
	MusicSongResume = 'musicSongResume',
	MusicSongSeekUpdate = 'musicSongSeekUpdate',
	MusicSongSkip = 'musicSongSkip',
	MusicSongVolumeUpdate = 'musicSongVolumeUpdate',
	MusicVoiceChannelJoin = 'musicVoiceChannelJoin',
	MusicVoiceChannelLeave = 'musicVoiceChannelLeave',
	Raw = 'raw',
	ReactionBlacklist = 'reactionBlacklist',
	Reconnecting = 'reconnecting',
	RoleReactionAdd = 'roleReactionAdd',
	RoleReactionRemove = 'roleReactionRemove',
	SettingsUpdate = 'settingsUpdate',
	TaskError = 'taskError',
	TwitchStreamOffline = 'twitchStreamOffline',
	TwitchStreamOnline = 'twitchStreamOnline',
	UnhandledRejection = 'unhandledRejection',
	Verbose = 'verbose',
	Warn = 'warn',
	Wtf = 'wtf'
}

export const enum PermissionLevels {
	Everyone = 0,
	Moderator = 5,
	Administrator = 6,
	ServerOwner = 7,
	BotOwner = 10
}

export const enum Schedules {
	DelayedGiveawayCreate = 'delayedGiveawayCreate',
	Poststats = 'poststats',
	Cleanup = 'cleanup',
	TwitchRefreshSubscriptions = 'twitchRefreshSubscriptions'
}
