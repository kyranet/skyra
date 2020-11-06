/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { StickyRole } from '@lib/database';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { Guild } from 'discord.js';

export interface StickyRoleManagerExtraContext {
	author: string;
}

export class StickyRoleManager {
	#guild: Guild;

	public constructor(guild: Guild) {
		this.#guild = guild;
	}

	public async get(userID: string): Promise<readonly string[]> {
		const entries = await this.getEntries();
		return entries.find((entry) => entry.user === userID)?.roles ?? [];
	}

	public async fetch(userID: string): Promise<readonly string[]> {
		// 1.0. If the entry does not exist, return empty array
		const arrayIndex = await this.getRaw(userID);
		if (arrayIndex === -1) return [];

		// 2.0. Read the entry and clean the roles:
		const entry = this.entries[arrayIndex];
		const roles = [...this.cleanRoles(entry.roles)];

		// 2.1. If the roles are unchanged (have the same size), return them:
		if (entry.roles.length === roles.length) return entry.roles;

		// 2.2. If the roles are changed and leds to an empty array:
		if (roles.length === 0) {
			// 3.0.a. Then delete the entry from the settings:
			const clean: StickyRole = { user: userID, roles };
			await this.#guild.settings.update(GuildSettings.StickyRoles, clean, {
				arrayAction: ArrayActions.Remove,
				arrayIndex,
				extraContext
			});
			return roles;
		}

		// 3.0.b. Make a clone with the userID and the fixed roles array:
		const clone: StickyRole = { user: userID, roles };
		await this.#guild.settings.update(GuildSettings.StickyRoles, clone, {
			arrayIndex,
			extraContext
		});

		// 4.0. Return the updated roles:
		return roles;
	}

	public async add(userID: string, roleID: string): Promise<readonly string[]> {
		return this.#guild.writeSettings((settings) => {
			// 0.0 Get all the entries
			const entries = settings[GuildSettings.StickyRoles];

			// 1.0. Get the index for the entry:
			const index = entries.findIndex((entry) => entry.user === userID);

			// 2.0. If the entry does not exist:
			if (index === -1) {
				// 3.0.a. Proceed to create a new sticky roles entry:
				const entry: StickyRole = { user: userID, roles: [roleID] };
				entries.push(entry);
				return entry.roles;
			}

			// 3.0.b. Otherwise read the previous entry and patch it by adding the role:
			const entry = entries[index];
			const roles = [...this.addRole(roleID, entry.roles)];

			// 3.1.b. Otherwise patch it:
			entries[index] = { user: entry.user, roles };

			// 4.0. Return the updated roles:
			return entry.roles;
		});
	}

	public async remove(userID: string, roleID: string): Promise<readonly string[]> {
		return this.#guild.writeSettings((settings) => {
			// 0.0 Get all the entries
			const entries = settings[GuildSettings.StickyRoles];

			// 1.0. Get the index for the entry:
			const index = entries.findIndex((entry) => entry.user === userID);

			// 1.1. If the index is negative, return empty array, as the entry does not exist:
			if (index === -1) return [];

			// 2.0. Read the previous entry and patch it by removing the role:
			const entry = entries[index];
			const roles = [...this.removeRole(roleID, entry.roles)];

			if (roles.length === 0) {
				// 3.1.a. Then delete the entry from the settings:
				entries.splice(index, 1);
			} else {
				// 3.1.b. Otherwise patch it:
				entries[index] = { user: entry.user, roles };
			}

			// 4.0. Return the updated roles:
			return entry.roles;
		});
	}

	public clear(userID: string): Promise<readonly string[]> {
		return this.#guild.writeSettings((settings) => {
			// 0.0 Get all the entries
			const entries = settings[GuildSettings.StickyRoles];

			// 1.0. Get the index for the entry:
			const index = entries.findIndex((entry) => entry.user === userID);

			// 1.1. If the index is negative, return empty array, as the entry does not exist:
			if (index === -1) return [];

			// 2.0. Read the previous entry:
			const entry = entries[index];

			// 3.0. Remove the entry from the settings:
			entries.splice(index, 1);

			// 4.0. Return the previous roles:
			return entry.roles;
		});
	}

	private getEntries() {
		return this.#guild.readSettings(GuildSettings.StickyRoles);
	}

	private async getRaw(userID: string) {
		const entries = await this.getEntries();
		return entries.find((entry) => entry.user === userID);
	}

	private *addRole(roleID: string, roleIDs: readonly string[]) {
		const emitted = new Set<string>();
		for (const role of this.cleanRoles(roleIDs)) {
			if (emitted.has(role)) continue;

			emitted.add(role);
			yield role;
		}

		if (!emitted.has(roleID)) yield roleID;
	}

	private *removeRole(roleID: string, roleIDs: readonly string[]) {
		const emitted = new Set<string>();
		for (const role of this.cleanRoles(roleIDs)) {
			if (role === roleID) continue;
			if (emitted.has(role)) continue;

			emitted.add(role);
			yield role;
		}
	}

	private *cleanRoles(roleIDs: readonly string[]) {
		const { roles } = this.#guild;
		for (const roleID of roleIDs) {
			if (roles.cache.has(roleID)) yield roleID;
		}
	}
}
