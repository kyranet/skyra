import { FT, T } from '#lib/types';

export const BoolFalseOptions = T<readonly string[]>('resolvers:boolFalseOptions');
export const BoolTrueOptions = T<readonly string[]>('resolvers:boolTrueOptions');
export const BoolEnabled = T<string>('resolvers:boolEnabled');
export const BoolDisabled = T<string>('resolvers:boolDisabled');
export const MultiTooFew = FT<{ name: string; min?: number; conjunctionWord: string }, string>('resolvers:multiTooFew');
export const InvalidBool = FT<{ name: string }, string>('resolvers:invalidBool');
export const InvalidChannel = FT<{ name: string }, string>('resolvers:invalidChannel');
export const InvalidCustom = FT<{ name: string; type: string }, string>('resolvers:invalidCustom');
export const InvalidDate = FT<{ name: string }, string>('resolvers:invalidDate');
export const InvalidDuration = FT<{ name: string }, string>('resolvers:invalidDuration');
export const InvalidEmoji = FT<{ name: string }, string>('resolvers:invalidEmoji');
export const InvalidFloat = FT<{ name: string }, string>('resolvers:invalidFloat');
export const InvalidGuild = FT<{ name: string }, string>('resolvers:invalidGuild');
export const InvalidInt = FT<{ name: string }, string>('resolvers:invalidInt');
export const InvalidInvite = FT<{ name: string }, string>('resolvers:invalidInvite');
export const InvalidWager = FT<{ bet: number; validAmounts: string }, string>('resolvers:invalidWager');
export const InvalidLiteral = FT<{ name: string }, string>('resolvers:invalidLiteral');
export const InvalidMember = FT<{ name: string }, string>('resolvers:invalidMember');
export const InvalidMessage = FT<{ name: string }, string>('resolvers:invalidMessage');
export const InvalidPiece = FT<{ name: string; piece: string }, string>('resolvers:invalidPiece');
export const InvalidRegexMatch = FT<{ name: string; pattern: string }, string>('resolvers:invalidRegexMatch');
export const InvalidRole = FT<{ name: string }, string>('resolvers:invalidRole');
export const InvalidString = FT<{ name: string }, string>('resolvers:invalidString');
export const InvalidTime = FT<{ name: string }, string>('resolvers:invalidTime');
export const InvalidUrl = FT<{ name: string }, string>('resolvers:invalidUrl');
export const InvalidUser = FT<{ name: string }, string>('resolvers:invalidUser');
export const InvalidSnowflake = FT<{ name: string }, string>('resolvers:invalidSnowflake');
export const InvalidStore = FT<{ store: string }, string>('resolvers:invalidStore');
export const StringSuffix = T<string>('resolvers:stringSuffix');
export const MinmaxExactlyInclusive = FT<{ name: string; min: number }, string>('resolvers:minmaxExactlyInclusive');
export const MinmaxExactlyExclusive = FT<{ name: string; min: number }, string>('resolvers:minmaxExactlyExclusive');
export const MinmaxBothInclusive = FT<{ name: string; min: number; max: number }, string>('resolvers:minmaxBothInclusive');
export const MinmaxBothExclusive = FT<{ name: string; min: number; max: number }, string>('resolvers:minmaxBothExclusive');
export const MinmaxMinInclusive = FT<{ name: string; min: number }, string>('resolvers:minmaxMinInclusive');
export const MinmaxMinExclusive = FT<{ name: string; min: number }, string>('resolvers:minmaxMinExclusive');
export const MinmaxMaxInclusive = FT<{ name: string; max: number }, string>('resolvers:minmaxMaxInclusive');
export const MinmaxMaxExclusive = FT<{ name: string; max: number }, string>('resolvers:minmaxMaxExclusive');
export const DateSuffix = T<string>('resolvers:dateSuffix');
export const PositiveAmount = T<string>('resolvers:positiveAmount');
export const InvalidChannelName = FT<{ name: string }, string>('resolvers:invalidChannelName');
export const ChannelNotInGuild = T<string>('resolvers:channelNotInGuild');
export const ChannelNotInGuildSubCommand = FT<{ command: string; subcommand: string }, string>('resolvers:channelNotInGuildSubCommand');
export const InvalidRoleName = FT<{ name: string }, string>('resolvers:invalidRoleName');
export const InvalidUsername = FT<{ name: string }, string>('resolvers:invalidUsername');
export const MemberNameUserLeftDuringPrompt = T<string>('resolvers:memberNameUserLeftDuringPrompt');
