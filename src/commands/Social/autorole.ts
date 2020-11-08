import { GuildSettings, RolesAuto } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { deepClone } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Role } from 'discord.js';

const SORT = (x: RolesAuto, y: RolesAuto) => Number(x.points > y.points) || Number(x.points === y.points) - 1;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['autoroles', 'levelrole', 'lvlrole'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Social.AutoRoleDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.AutoRoleExtended),
	permissionLevel: PermissionLevels.Administrator,
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|update|show:default> (role:rolename) (points:points{0,1000000})',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'rolename',
		(arg, possible, message, [type]) => {
			if (type === 'show') return undefined;
			return message.client.arguments.get('rolename')!.run(arg, possible, message);
		}
	],
	[
		'points',
		(arg, possible, message, [type]) => {
			if (type === 'show' || type === 'remove') return undefined;
			return message.client.arguments.get('integer')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async init() {
		this.customizeResponse('role', async (message) => message.fetchLocale(LanguageKeys.Misc.CommandRequireRole)) //
			.customizeResponse('points', async (message) => message.fetchLocale(LanguageKeys.Commands.Social.AutoRolePointsRequired)); //
	}

	public async show(message: GuildMessage) {
		const output = await message.guild.writeSettings((settings) => {
			const autoRoles = settings[GuildSettings.Roles.Auto];
			if (!autoRoles.length) throw settings.getLanguage().get(LanguageKeys.Commands.Social.AutoRoleListEmpty);

			const filtered = new Set(autoRoles);
			const output: string[] = [];
			for (const obj of autoRoles) {
				const role = message.guild!.roles.cache.get(obj.id);
				if (role) output.push(`${obj.points.toString().padStart(6, ' ')} : ${role.name}`);
				else filtered.delete(obj);
			}

			if (filtered.size !== autoRoles.length) {
				settings[GuildSettings.Roles.Auto] = [...filtered];
			}

			if (!output.length) throw settings.getLanguage().get(LanguageKeys.Commands.Social.AutoRoleListEmpty);

			return output;
		});

		return message.sendMessage(output.join('\n'), { code: 'http' });
	}

	public async add(message: GuildMessage, [role, points]: [Role, number]) {
		await message.guild.writeSettings((settings) => {
			const autoRoles = settings[GuildSettings.Roles.Auto];

			if (autoRoles.length && autoRoles.some((entry) => entry.id === role.id)) {
				throw settings.getLanguage().get(LanguageKeys.Commands.Social.AutoRoleUpdateConfigured);
			}

			const sorted = [...autoRoles, { id: role.id, points }].sort(SORT);

			settings[GuildSettings.Roles.Auto] = sorted;
		});

		return message.sendLocale(LanguageKeys.Commands.Social.AutoRoleAdd, [{ role, points }]);
	}

	public async remove(message: GuildMessage, [role]: [Role]) {
		const roleEntry = await message.guild.writeSettings((settings) => {
			const roleIndex = settings[GuildSettings.Roles.Auto].findIndex((entry) => entry.id === role.id);

			if (roleIndex === -1) {
				throw settings.getLanguage().get(LanguageKeys.Commands.Social.AutoRoleUpdateConfigured);
			}

			const roleEntry = settings[GuildSettings.Roles.Auto][roleIndex];
			settings[GuildSettings.Roles.Auto].splice(roleIndex, 1);

			return roleEntry;
		});

		return message.sendLocale(LanguageKeys.Commands.Social.AutoRoleRemove, [{ role, before: roleEntry.points }]);
	}

	public async update(message: GuildMessage, [role, points]: [Role, number]) {
		const autoRole = await message.guild.writeSettings((settings) => {
			const roleIndex = settings[GuildSettings.Roles.Auto].findIndex((entry) => entry.id === role.id);

			if (roleIndex === -1) {
				throw settings.getLanguage().get(LanguageKeys.Commands.Social.AutoRoleUpdateUnconfigured);
			}

			const autoRole = settings[GuildSettings.Roles.Auto][roleIndex];
			const clone = deepClone(settings[GuildSettings.Roles.Auto]);

			settings[GuildSettings.Roles.Auto] = clone.sort(SORT);
			return autoRole;
		});

		return message.sendLocale(LanguageKeys.Commands.Social.AutoRoleUpdate, [{ role, points, before: autoRole.points }]);
	}
}
