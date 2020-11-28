import { FT, T } from '#lib/types';

export const BoolFalseOptions = T<readonly string[]>('resolverBoolFalseOptions');
export const BoolTrueOptions = T<readonly string[]>('resolverBoolTrueOptions');
export const BoolEnabled = T<string>('resolverBoolEnabled');
export const BoolDisabled = T<string>('resolverBoolDisabled');
export const MultiTooFew = FT<{ name: string; min?: number; conjunctionWord: string }, string>('resolverMultiTooFew');
export const InvalidBool = FT<{ name: string }, string>('resolverInvalidBool');
export const InvalidChannel = FT<{ name: string }, string>('resolverInvalidChannel');
export const InvalidCustom = FT<{ name: string; type: string }, string>('resolverInvalidCustom');
export const InvalidDate = FT<{ name: string }, string>('resolverInvalidDate');
export const InvalidDuration = FT<{ name: string }, string>('resolverInvalidDuration');
export const InvalidEmoji = FT<{ name: string }, string>('resolverInvalidEmoji');
export const InvalidFloat = FT<{ name: string }, string>('resolverInvalidFloat');
export const InvalidGuild = FT<{ name: string }, string>('resolverInvalidGuild');
export const InvalidInt = FT<{ name: string }, string>('resolverInvalidInt');
export const InvalidInvite = FT<{ name: string }, string>('resolverInvalidInvite');
export const InvalidWager = FT<{ bet: number; validAmounts: string }, string>('resolverInvalidWager');
export const InvalidLiteral = FT<{ name: string }, string>('resolverInvalidLiteral');
export const InvalidMember = FT<{ name: string }, string>('resolverInvalidMember');
export const InvalidMessage = FT<{ name: string }, string>('resolverInvalidMessage');
export const InvalidPiece = FT<{ name: string; piece: string }, string>('resolverInvalidPiece');
export const InvalidRegexMatch = FT<{ name: string; pattern: string }, string>('resolverInvalidRegexMatch');
export const InvalidRole = FT<{ name: string }, string>('resolverInvalidRole');
export const InvalidString = FT<{ name: string }, string>('resolverInvalidString');
export const InvalidTime = FT<{ name: string }, string>('resolverInvalidTime');
export const InvalidUrl = FT<{ name: string }, string>('resolverInvalidUrl');
export const InvalidUser = FT<{ name: string }, string>('resolverInvalidUser');
export const InvalidSnowflake = FT<{ name: string }, string>('resolverInvalidSnowflake');
export const InvalidStore = FT<{ store: string }, string>('resolverInvalidStore');
export const StringSuffix = T<string>('resolverStringSuffix');
export const MinmaxExactlyInclusive = FT<{ name: string; min: number }, string>('resolverMinmaxExactlyInclusive');
export const MinmaxExactlyExclusive = FT<{ name: string; min: number }, string>('resolverMinmaxExactlyExclusive');
export const MinmaxBothInclusive = FT<{ name: string; min: number; max: number }, string>('resolverMinmaxBothInclusive');
export const MinmaxBothExclusive = FT<{ name: string; min: number; max: number }, string>('resolverMinmaxBothExclusive');
export const MinmaxMinInclusive = FT<{ name: string; min: number }, string>('resolverMinmaxMinInclusive');
export const MinmaxMinExclusive = FT<{ name: string; min: number }, string>('resolverMinmaxMinExclusive');
export const MinmaxMaxInclusive = FT<{ name: string; max: number }, string>('resolverMinmaxMaxInclusive');
export const MinmaxMaxExclusive = FT<{ name: string; max: number }, string>('resolverMinmaxMaxExclusive');
export const DateSuffix = T<string>('resolverDateSuffix');
export const PositiveAmount = T<string>('resolverPositiveAmount');
export const InvalidChannelName = FT<{ name: string }, string>('resolverInvalidChannelName');
export const ChannelNotInGuild = T<string>('resolverChannelNotInGuild');
export const ChannelNotInGuildSubcommand = FT<{ command: string; subcommand: string }, string>('resolverChannelNotInGuildSubcommand');
export const InvalidRoleName = FT<{ name: string }, string>('resolverInvalidRoleName');
export const InvalidUsername = FT<{ name: string }, string>('resolverInvalidUsername');
export const MembernameUserLeftDuringPrompt = T<string>('resolverMembernameUserLeftDuringPrompt');
