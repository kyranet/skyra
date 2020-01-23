export interface RawRpgItem {
	id: number;
	name: string;
	maximum_durability: string;
	attack: number;
	defense: number;
	health: number;
	required_energy: number;
	maximum_cooldown: number;
	rarity: string;
	accuracy: number;
	effects: string[];
}

export interface RawRpgClass {
	id: number;
	name: string;
	attack_multiplier: number;
	defense_multiplier: number;
	energy_multiplier: number;
	luck_multiplier: number;
}

export interface RawRpgGuildRank {
	id: number;
	name: string;
}

export interface RawRpgGuild {
	id: number;
	name: string;
	description: string | null;
	leader: string;
	member_limit: number;
	win_count: string;
	lose_count: string;
	money_count: string;
	bank_limit: string;
	upgrade: number;
}

export interface RawRpgUser {
	id: string;
	name: string;
	win_count: string;
	death_count: string;
	guild_id: number;
	guild_rank_id: number;
	class_id: number;
	crate_common_count: number;
	crate_uncommon_count: number;
	crate_rare_count: number;
	crate_legendary_count: number;
	energy: string;
	luck: string;
}

export interface RawRpgUserItem {
	id: string;
	user_id: string;
	item_id: number;
	durability: string;
}

export interface RawRpgBattle {
	id: string;
	challenger_turn: boolean;
	challenger: string;
	challenger_cooldown: number;
	challenger_health: number;
	challenger_energy: number;
	challenger_effects: string[];
	challenged: string;
	challenged_cooldown: number;
	challenged_health: number;
	challenged_energy: number;
	challenged_effects: string[];
}

export const SQL_TABLE_SCHEMA = /* sql */`
	BEGIN;

	CREATE TABLE IF NOT EXISTS rpg_items (
		"id"                 SERIAL,
		"name"               VARCHAR(50)                            NOT NULL,
		"maximum_durability" BIGINT                                 NOT NULL,
		"attack"             FLOAT       DEFAULT 0.0                NOT NULL,
		"defense"            FLOAT       DEFAULT 0.0                NOT NULL,
		"health"             FLOAT       DEFAULT 0.0                NOT NULL,
		"required_energy"    FLOAT       DEFAULT 0.0                NOT NULL,
		"maximum_cooldown"   SMALLINT    DEFAULT 0                  NOT NULL,
		"rarity"             BIGINT                                 NOT NULL,
		"accuracy"           SMALLINT    DEFAULT 100                NOT NULL,
		"effects"            VARCHAR(50) DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		UNIQUE ("name", "rarity"),
		PRIMARY KEY ("id"),
		CHECK ("name"               <> ''),
		CHECK ("maximum_durability" >= 0),
		CHECK ("attack"             >= 0),
		CHECK ("defense"            >= 0),
		CHECK ("health"             >= 0),
		CHECK ("required_energy"    >= 0),
		CHECK ("maximum_cooldown"   >= 0),
		CHECK ("rarity"             >= 1),
		CHECK ("accuracy"           >= 0),
		CHECK ("accuracy"           <= 100)
	);

	CREATE TABLE IF NOT EXISTS rpg_class (
		"id"                 SERIAL,
		"name"               VARCHAR(20)             NOT NULL,
		"attack_multiplier"  FLOAT       DEFAULT 1.0 NOT NULL,
		"defense_multiplier" FLOAT       DEFAULT 1.0 NOT NULL,
		"energy_multiplier"  FLOAT       DEFAULT 1.0 NOT NULL,
		"luck_multiplier"    FLOAT       DEFAULT 1.0 NOT NULL,
		UNIQUE ("name"),
		PRIMARY KEY ("id"),
		CHECK ("name"               <> ''),
		CHECK ("attack_multiplier"  >= 0),
		CHECK ("defense_multiplier" >= 0),
		CHECK ("energy_multiplier"  >= 0),
		CHECK ("luck_multiplier"    >= 0)
	);

	CREATE TABLE IF NOT EXISTS rpg_guild_rank (
		"id"   SERIAL      NOT NULL,
		"name" VARCHAR(50) NOT NULL,
		UNIQUE ("name"),
		PRIMARY KEY ("id"),
		CHECK ("name" <> '')
	);

	CREATE TABLE IF NOT EXISTS rpg_guilds (
		"id"           SERIAL,
		"name"         VARCHAR(50)                NOT NULL,
		"description"  VARCHAR(200),
		"leader"       VARCHAR(19)                NOT NULL,
		"member_limit" SMALLINT     DEFAULT 5     NOT NULL,
		"win_count"    BIGINT       DEFAULT 0     NOT NULL,
		"lose_count"   BIGINT       DEFAULT 0     NOT NULL,
		"money_count"  BIGINT       DEFAULT 0     NOT NULL,
		"bank_limit"   BIGINT       DEFAULT 50000 NOT NULL,
		"upgrade"      SMALLINT     DEFAULT 0     NOT NULL,
		UNIQUE ("leader"),
		PRIMARY KEY ("id"),
		CHECK ("member_limit" >= 5),
		CHECK ("win_count"    >= 0),
		CHECK ("lose_count"   >= 0),
		CHECK ("money_count"  >= 0),
		CHECK ("bank_limit"   >= 0),
		CHECK ("upgrade"      >= 0)
	);

	CREATE TABLE IF NOT EXISTS rpg_users (
		"id"                    VARCHAR(19)             NOT NULL,
		"name"                  VARCHAR(32)             NOT NULL,
		"win_count"             BIGINT      DEFAULT 0   NOT NULL,
		"death_count"           BIGINT      DEFAULT 0   NOT NULL,
		"guild_id"              INTEGER,
		"guild_rank_id"         INTEGER,
		"class_id"              INTEGER,
		"crate_common_count"    INTEGER     DEFAULT 0   NOT NULL,
		"crate_uncommon_count"  INTEGER     DEFAULT 0   NOT NULL,
		"crate_rare_count"      INTEGER     DEFAULT 0   NOT NULL,
		"crate_legendary_count" INTEGER     DEFAULT 0   NOT NULL,
		"energy"                BIGINT      DEFAULT 0   NOT NULL,
		"luck"                  NUMERIC     DEFAULT 1.0 NOT NULL,
		UNIQUE ("id"),
		FOREIGN KEY ("id")            REFERENCES users          ("id") ON DELETE CASCADE,
		FOREIGN KEY ("guild_id")      REFERENCES rpg_guilds     ("id") ON DELETE SET NULL,
		FOREIGN KEY ("guild_rank_id") REFERENCES rpg_guild_rank ("id") ON DELETE SET NULL,
		FOREIGN KEY ("class_id")      REFERENCES rpg_class      ("id") ON DELETE SET NULL,
		CHECK ("win_count"             >= 0),
		CHECK ("death_count"           >= 0),
		CHECK ("crate_common_count"    >= 0),
		CHECK ("crate_uncommon_count"  >= 0),
		CHECK ("crate_rare_count"      >= 0),
		CHECK ("crate_legendary_count" >= 0),
		CHECK ("energy"                >= 0),
		CHECK ("luck"                  >= 0)
	);

	ALTER TABLE rpg_guilds
		ADD FOREIGN KEY ("leader") REFERENCES rpg_users ("id") ON DELETE CASCADE;

	CREATE TABLE IF NOT EXISTS rpg_user_items (
		"id"         BIGSERIAL,
		"user_id"    VARCHAR(19) NOT NULL,
		"item_id"    INTEGER     NOT NULL,
		"durability" BIGINT      NOT NULL,
		PRIMARY KEY ("id"),
		FOREIGN KEY ("user_id") REFERENCES rpg_users ("id") ON DELETE CASCADE,
		FOREIGN KEY ("item_id") REFERENCES rpg_items ("id") ON DELETE CASCADE,
		CHECK ("durability" >= 0)
	);

	CREATE RULE rpg_user_items_durability_update_rule AS ON UPDATE
		TO rpg_user_items
		WHERE NEW.durability = 0
		DO INSTEAD
			DELETE FROM rpg_user_items
			WHERE id = OLD.id;

	CREATE TABLE IF NOT EXISTS rpg_battles
	(
		"id"                  BIGSERIAL,
		"challenger_turn"     BOOLEAN                                NOT NULL,
		"challenger"          VARCHAR(19)                            NOT NULL,
		"challenger_cooldown" SMALLINT    DEFAULT 0                  NOT NULL,
		"challenger_health"   INTEGER                                NOT NULL,
		"challenger_energy"   INTEGER                                NOT NULL,
		"challenger_effects"  VARCHAR(50) DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"challenged"          VARCHAR(19)                            NOT NULL,
		"challenged_cooldown" SMALLINT    DEFAULT 0                  NOT NULL,
		"challenged_health"   INTEGER                                NOT NULL,
		"challenged_energy"   INTEGER                                NOT NULL,
		"challenged_effects"  VARCHAR(50) DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		UNIQUE ("challenger"),
		UNIQUE ("challenged"),
		PRIMARY KEY ("id"),
		FOREIGN KEY ("challenger") REFERENCES rpg_users ("id"),
		FOREIGN KEY ("challenged") REFERENCES rpg_users ("id"),
		CHECK ("challenger_cooldown" >= 0),
		CHECK ("challenged_cooldown" >= 0),
		CHECK ("challenger_health"   >= 0),
		CHECK ("challenged_health"   >= 0),
		CHECK ("challenger_energy"   >= 0),
		CHECK ("challenged_energy"   >= 0)
	);

	CREATE RULE rpg_battles_health_update_rule AS ON UPDATE
		TO rpg_battles
		WHERE NEW.challenger_health = 0 OR NEW.challenged_health = 0
		DO INSTEAD
			DELETE FROM rpg_battles
			WHERE id = OLD.id;

	COMMIT;
`;
