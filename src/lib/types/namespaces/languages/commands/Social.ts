import type { ScheduleEntity } from '#lib/database';
import { FT, T } from '#lib/types';
import type { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';
import type { Role, User } from 'discord.js';

export interface LevelTitles {
	experience: string;
	nextIn: string;
	level: string;
}

export interface ProfileTitles {
	globalRank: string;
	credits: string;
	reputation: string;
	experience: string;
	level: string;
}

export const AutoRoleAdd = FT<{ role: Role; points: number }, string>('commands/social:autoRoleAdd');
export const AutoRoleDescription = T<string>('commands/social:autoRoleDescription');
export const AutoRoleExtended = T<LanguageHelpDisplayOptions>('commands/social:autoRoleExtended');
export const AutoRoleListEmpty = T<string>('commands/social:autoRoleListEmpty');
export const AutoRolePointsRequired = T<string>('commands/social:autoRolePointsRequired');
export const AutoRoleRemove = FT<{ role: Role; before: number }, string>('commands/social:autoRoleRemove');
export const AutoRoleUnknownRole = FT<{ role: string }, string>('commands/social:autoRoleUnknownRole');
export const AutoRoleUpdate = FT<{ role: Role; points: number; before: number }, string>('commands/social:autoRoleUpdate');
export const AutoRoleUpdateConfigured = T<string>('commands/social:autoRoleUpdateConfigured');
export const AutoRoleUpdateUnconfigured = T<string>('commands/social:autoRoleUpdateUnconfigured');
export const Balance = FT<{ user: string; amount: string }, string>('commands/social:balance');
export const BalanceBots = T<string>('commands/social:balanceBots');
export const BalanceDescription = T<string>('commands/social:balanceDescription');
export const BalanceExtended = T<LanguageHelpDisplayOptions>('commands/social:balanceExtended');
export const BalanceSelf = FT<{ amount: string }, string>('commands/social:balanceSelf');
export const BannerBought = FT<{ prefix: string; banner: string }, string>('commands/social:bannerBought');
export const BannerBuy = FT<{ banner: string }, string>('commands/social:bannerBuy');
export const BannerDescription = T<string>('commands/social:bannerDescription');
export const BannerExtended = T<LanguageHelpDisplayOptions>('commands/social:bannerExtended');
export const BannerMissing = FT<{ type: string }, string>('commands/social:bannerMissing');
export const BannerMoney = FT<{ money: number; cost: number }, string>('commands/social:bannerMoney');
export const BannerNotexists = FT<{ prefix: string }, string>('commands/social:bannerNotexists');
export const BannerPaymentCancelled = T<string>('commands/social:bannerPaymentCancelled');
export const BannerPrompt = T<string>('commands/social:bannerPrompt');
export const BannerReset = T<string>('commands/social:bannerReset');
export const BannerResetDefault = T<string>('commands/social:bannerResetDefault');
export const BannerSet = FT<{ banner: string }, string>('commands/social:bannerSet');
export const BannerSetNotBought = T<string>('commands/social:bannerSetNotBought');
export const BannerUserListEmpty = FT<{ prefix: string }, string>('commands/social:bannerUserlistEmpty');
export const DailyCollect = T<string>('commands/social:dailyCollect');
export const DailyDescription = T<string>('commands/social:dailyDescription');
export const DailyExtended = T<LanguageHelpDisplayOptions>('commands/social:dailyExtended');
export const DailyGrace = FT<{ remaining: number }, string[]>('commands/social:dailyGrace');
export const DailyGraceAccepted = FT<{ amount: number; remaining: number }, string>('commands/social:dailyGraceAccepted');
export const DailyGraceDenied = T<string>('commands/social:dailyGraceDenied');
export const DailyTime = FT<{ time: number }, string>('commands/social:dailyTime');
export const DailyTimeSuccess = FT<{ amount: number }, string>('commands/social:dailyTimeSuccess');
export const DivorceCancel = T<string>('commands/social:divorceCancel');
export const DivorceDescription = T<string>('commands/social:divorceDescription');
export const DivorceDm = FT<{ user: string }, string>('commands/social:divorceDm');
export const DivorceExtended = T<LanguageHelpDisplayOptions>('commands/social:divorceExtended');
export const DivorceSelf = T<string>('commands/social:divorceSelf');
export const DivorceNotTaken = T<string>('commands/social:divorceNotTaken');
export const DivorcePrompt = T<string>('commands/social:divorcePrompt');
export const DivorceSuccess = FT<{ user: string }, string>('commands/social:divorceSuccess');
export const LeaderboardDescription = T<string>('commands/social:leaderboardDescription');
export const LeaderboardExtended = T<LanguageHelpDisplayOptions>('commands/social:leaderboardExtended');
export const LeaderboardListifyPage = FT<{ page: number; pageCount: number; results: string }, string>(
	'commands/social:s/social:leaderboardListifyPage'
);
export const Level = T<LevelTitles>('commands/social:level');
export const LevelDescription = T<string>('commands/social:levelDescription');
export const LevelExtended = T<LanguageHelpDisplayOptions>('commands/social:levelExtended');
export const MarryAccepted = FT<{ author: User; user: User }, string>('commands/social:marryAccepted');
export const MarryAlreadyMarried = FT<{ user: User }, string>('commands/social:marryAlreadyMarried');
export const MarryAuthorMultipleCancel = FT<{ user: string }, string>('commands/social:marryAuthorMultipleCancel');
export const MarryAuthorTaken = FT<{ author: User }, string>('commands/social:marryAuthorTaken');
export const MarryAuthorTooMany = FT<{ limit: number }, string>('commands/social:marryAuthorTooMany');
export const MarryBots = T<string>('commands/social:marryBots');
export const MarryDenied = T<string>('commands/social:marryDenied');
export const MarryDescription = T<string>('commands/social:marryDescription');
export const MarryExtended = T<LanguageHelpDisplayOptions>('commands/social:marryExtended');
export const MarryMultipleCancel = T<string>('commands/social:marryMultipleCancel');
export const MarryNoreply = T<string>('commands/social:marryNoreply');
export const MarryNotTaken = T<string>('commands/social:marryNotTaken');
export const MarryPetition = FT<{ author: User; user: User }, string>('commands/social:marryPetition');
export const MarrySelf = T<string>('commands/social:marrySelf');
export const MarrySkyra = T<string>('commands/social:marrySkyra');
export const MarryAelia = T<string>('commands/social:marryAelia');
export const MarryTaken = FT<{ count: number }, string>('commands/social:marryTaken');
export const MarryTargetTooMany = FT<{ limit: number }, string>('commands/social:marryTargetTooMany');
export const MarryWith = FT<{ users: readonly string[] }, string>('commands/social:marryWith');
export const MarriedDescription = T<string>('commands/social:marriedDescription');
export const MarriedExtended = T<LanguageHelpDisplayOptions>('commands/social:marriedExtended');
export const Mylevel = FT<{ points: number; next: string; user: string }, string>('commands/social:mylevel');
export const MylevelDescription = T<string>('commands/social:mylevelDescription');
export const MylevelExtended = T<LanguageHelpDisplayOptions>('commands/social:mylevelExtended');
export const MylevelNext = FT<{ remaining: number; next: number }, string>('commands/social:mylevelNext');
export const MylevelSelf = FT<{ points: number; next: string }, string>('commands/social:mylevelSelf');
export const PayDescription = T<string>('commands/social:payDescription');
export const PayExtended = T<LanguageHelpDisplayOptions>('commands/social:payExtended');
export const PayMissingMoney = FT<{ needed: number; has: number }, string>('commands/social:payMissingMoney');
export const PayPrompt = FT<{ user: string; amount: number }, string>('commands/social:payPrompt');
export const PayPromptAccept = FT<{ user: string; amount: number }, string>('commands/social:payPromptAccept');
export const PayPromptDeny = T<string>('commands/social:payPromptDeny');
export const PaySelf = T<string>('commands/social:paySelf');
export const Profile = T<ProfileTitles>('commands/social:profile');
export const ProfileDescription = T<string>('commands/social:profileDescription');
export const ProfileExtended = T<LanguageHelpDisplayOptions>('commands/social:profileExtended');
export const RemindmeCreate = FT<{ id: string }, string>('commands/social:remindmeCreate');
export const RemindmeCreateNoDescription = T<string>('commands/social:remindmeCreateNoDescription');
export const RemindmeCreateNoDuration = T<string>('commands/social:remindmeCreateNoDuration');
export const RemindmeDelete = FT<{ task: ScheduleEntity; id: number }, string>('commands/social:remindmeDelete');
export const RemindmeDeleteNoId = T<string>('commands/social:remindmeDeleteNoId');
export const RemindmeDescription = T<string>('commands/social:remindmeDescription');
export const RemindmeExtended = T<LanguageHelpDisplayOptions>('commands/social:remindmeExtended');
export const RemindmeInvalidId = T<string>('commands/social:remindmeInvalidId');
export const RemindmeListEmpty = T<string>('commands/social:remindmeListEmpty');
export const RemindmeNotfound = T<string>('commands/social:remindmeNotfound');
export const RemindmeShowFooter = FT<{ id: number }, string>('commands/social:remindmeShowFooter');
export const Reputation = FT<{ count: number }, string>('commands/social:reputation');
export const ReputationBots = T<string>('commands/social:reputationBots');
export const ReputationDescription = T<string>('commands/social:reputationDescription');
export const ReputationExtended = T<LanguageHelpDisplayOptions>('commands/social:reputationExtended');
export const ReputationGive = FT<{ user: string }, string>('commands/social:reputationGive');
export const Reputations = FT<{ user: string; points: string }, string>('commands/social:reputations');
export const ReputationsBots = T<string>('commands/social:reputationsBots');
export const ReputationSelf = T<string>('commands/social:reputationSelf');
export const ReputationsSelf = FT<{ points: number }, string>('commands/social:reputationsSelf');
export const ReputationTime = FT<{ remaining: number }, string>('commands/social:reputationTime');
export const ReputationUsable = T<string>('commands/social:reputationUsable');
export const ReputationUserNotfound = T<string>('commands/social:reputationUserNotfound');
export const SetColor = FT<{ color: string }, string>('commands/social:setColor');
export const SetColorDescription = T<string>('commands/social:setColorDescription');
export const SetColorExtended = T<LanguageHelpDisplayOptions>('commands/social:setColorExtended');
export const SocialAdd = FT<{ user: string; amount: number; count: number }, string>('commands/social:socialAdd');
export const SocialDescription = T<string>('commands/social:socialDescription');
export const SocialExtended = T<LanguageHelpDisplayOptions>('commands/social:socialExtended');
export const SocialMemberNotexists = T<string>('commands/social:socialMemberNotexists');
export const SocialPayBot = T<string>('commands/social:socialPayBot');
export const SocialRemove = FT<{ user: string; amount: number; count: number }, string>('commands/social:socialRemove');
export const SocialReset = FT<{ user: string }, string>('commands/social:socialReset');
export const SocialUnchanged = FT<{ user: string }, string>('commands/social:socialUnchanged');
export const ToggleDarkModeDescription = T<string>('commands/social:toggleDarkModeDescription');
export const ToggleDarkModeDisabled = T<string>('commands/social:toggleDarkModeDisabled');
export const ToggleDarkModeEnabled = T<string>('commands/social:toggleDarkModeEnabled');
export const ToggleDarkModeExtended = T<LanguageHelpDisplayOptions>('commands/social:toggleDarkModeExtended');
export const VaultDescription = T<string>('commands/social:vaultDescription');
export const VaultEmbedData = FT<
	{
		coins?: number;
	},
	{
		depositedDescription: string;
		withdrewDescription: string;
		showDescription: string;
		accountMoney: string;
		accountVault: string;
	}
>('commands/social:vaultEmbedData');
export const VaultExtended = T<LanguageHelpDisplayOptions>('commands/social:vaultExtended');
export const VaultInvalidCoins = T<string>('commands/social:vaultInvalidCoins');
export const VaultNotEnoughInVault = FT<{ vault: number }, string>('commands/social:vaultNotEnoughInVault');
export const VaultNotEnoughMoney = FT<{ money: number }, string>('commands/social:vaultNotEnoughMoney');
