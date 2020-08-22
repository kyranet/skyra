import { PermissionsNode } from '@lib/types/settings/GuildSettings';
import { isObject } from '@sapphire/utilities';
import { GuildMember, Role } from 'discord.js';
import { Command, Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public async validate(data: PermissionsNode, { entry, language, guild }: SerializerUpdateContext) {
		if (guild === null) throw new TypeError('guild must not be null.');

		// Safe-guard checks against arbitrary data
		if (!isObject(data)) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID');
		if (Object.keys(data).length !== 3) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID');
		if (typeof data.id !== 'string') throw language.get('SERIALIZER_PERMISSION_NODE_INVALID');
		if (!Array.isArray(data.allow)) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID');
		if (!Array.isArray(data.deny)) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID');

		// Check for target validity
		let target: GuildMember | Role | undefined = undefined;
		if (entry.key === 'roles') {
			const role = guild.roles.get(data.id);
			if (!role) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID_TARGET');
			target = role;
		} else {
			target = await guild.members.fetch(data.id).catch(() => {
				throw language.get('SERIALIZER_PERMISSION_NODE_INVALID_TARGET');
			});
		}

		// The @everyone role should not have allows
		if (target.id === guild.id && data.allow.length !== 0) {
			throw language.get('SERIALIZER_PERMISSION_NODE_SECURITY_EVERYONE_ALLOWS');
		}

		// The owner cannot have allows nor denies
		if (target.id === guild.ownerID) {
			throw language.get('SERIALIZER_PERMISSION_NODE_SECURITY_OWNER');
		}

		// Check all commands
		const commands = new Map<string, Command>();
		for (const allowed of data.allow) {
			if (commands.has(allowed)) throw language.get('SERIALIZER_PERMISSION_NODE_DUPLICATED_COMMAND', { command: allowed });

			const command = this.client.commands.get(allowed);
			if (!command) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID_COMMAND', { command: allowed });
			if (command.permissionLevel >= 9) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID_COMMAND', { command: allowed });
			commands.set(allowed, command);
		}

		for (const denied of data.deny) {
			if (commands.has(denied)) throw language.get('SERIALIZER_PERMISSION_NODE_DUPLICATED_COMMAND', { command: denied });

			const command = this.client.commands.get(denied);
			if (!command) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID_COMMAND', { command: denied });
			if (command.permissionLevel >= 9) throw language.get('SERIALIZER_PERMISSION_NODE_INVALID_COMMAND', { command: denied });
			if (command.guarded) throw language.get('SERIALIZER_PERMISSION_NODE_SECURITY_GUARDED', { command: denied });
			commands.set(denied, command);
		}

		return data;
	}

	public stringify(value: PermissionsNode) {
		return `${value.id}(${value.allow.join(', ')} | ${value.deny.join(', ')})`;
	}
}
