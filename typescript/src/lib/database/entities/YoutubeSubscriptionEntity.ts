import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('youtube_stream_subscription', { schema: 'public' })
export class YoutubeSubscriptionEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 16 })
	public id!: string;

	@Column('timestamp without time zone')
	public expiresAt!: Date;

	@Column('varchar', { array: true, length: 19, default: () => 'ARRAY[]::VARCHAR[]' })
	public guildIds: string[] = [];
}
