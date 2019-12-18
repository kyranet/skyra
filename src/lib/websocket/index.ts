import WebSocket, { Server, Data } from 'ws';
import * as http from 'http';
import { SkyraClient } from '../SkyraClient';
import Collection from '@discordjs/collection';
import { enumerable } from '../util/util';
import { Util } from 'klasa-dashboard-hooks';
import { CLIENT_SECRET } from '../../../config';
import { KlasaUser } from 'klasa';
import { Events } from '../types/Enums';


// TODO - should we timeout connections? disconnect after X period?
// TODO - after the connection of a DashboardWebsocketUser is closed, is that class instance GC'd? should be

export const enum IncomingWebsocketAction {
	Authenticate = 'AUTHENTICATE',
	MusicQueueUpdate = 'MUSIC_QUEUE_UPDATE',
	SubscriptionUpdate = 'SUBSCRIPTION_UPDATE'
}

export const enum OutgoingWebsocketAction {
	Authenticate = 'AUTHENTICATE',
	MusicSync = 'MUSIC_SYNC'
}

const enum MusicAction {
	SkipSong = 'SKIP_SONG',
	AddSong = 'ADD_SONG',
	DeleteSong = 'DELETE_SONG',
	PauseSong = 'PAUSE_SONG',
	ResumePlaying = 'RESUME_PLAYING'
}

const enum SubscriptionAction {
	Subscribe = 'SUBSCRIBE',
	Unsubscribe = 'UNSUBSCRIBE'
}

export const enum SubscriptionName {
	Music = 'MUSIC',
	Something = 'SOMETHING'
}

interface MusicSubscription {
	type: SubscriptionName.Music;
	guild_id: string;
}

interface ExampleSubscription {
	type: SubscriptionName.Something;
	something: string;
}

type Subscription = MusicSubscription | ExampleSubscription;

export const enum CloseCodes {
	ProtocolError = 1002,
	PolicyViolation = 1008,
	InternalError = 1011,
	Unauthorized = 4301,
}

interface IncomingDataObject {
	token?: string;
	user_id?: string;
	music_action?: MusicAction;
	subscription_action?: SubscriptionAction;
	subscription_name?: SubscriptionName;
	guild_id?: string;
}

export interface IncomingWebsocketMessage {
	action: IncomingWebsocketAction;
	data: IncomingDataObject;
}

export interface OutgoingWebsocketMessage {
	action?: OutgoingWebsocketAction;
	data?: unknown;
	error?: string;
	success?: boolean;
}

export interface UserAuthObject {
	user_id: number;
	token: string;
}

export class DashboardWebsocketUser {

	public IP: string;
	public authenticated = false;
	public auth?: UserAuthObject;
	public wss: Server;
	public client: SkyraClient;
	public user?: KlasaUser | null;
	public subscriptions: Subscription[] = [];

	@enumerable(false)
	private _connection: WebSocket;

	public constructor(client: SkyraClient, wss: Server, connection: WebSocket, IP: string) {
		this._connection = connection;
		this.wss = wss;
		this.IP = IP;
		this.client = client;
		this.user = null;

		// When the connection for this user receives a Raw Websocket message...
		this._connection.on('message', this.handleIncomingRawMessage.bind(this));
	}

	public send(message: OutgoingWebsocketMessage | unknown) {
		this._connection.send(JSON.stringify(message));
	}

	public error(message: string) {
		this.send({ error: message });
	}

	public async canManageMusic(guildID: string) {
		if (!this.user) return false;

		const guild = this.client.guilds.get(guildID);
		if (!guild) return false;

		const member = await guild.members.fetch(this.user.id);
		if (!member) return false;

		return member.isDj;
	}

	public syncMusic() {
		for (const musicSubscription of this.subscriptions.filter(sub => sub.type === SubscriptionName.Music) as MusicSubscription[]) {
			const guild = this.client.guilds.get(musicSubscription.guild_id);
			if (!guild) continue;

			this.send({ action: OutgoingWebsocketAction.MusicSync, data: guild.music });
		}
	}

	public async handleMusicMessage(message: IncomingWebsocketMessage) {
		if (!message.data.music_action
			|| !message.data.guild_id
			|| !this.user
			|| !this.canManageMusic(message.data.guild_id)) return;

		const guild = this.client.guilds.get(message.data.guild_id);
		if (!guild) return;

		switch (message.data.music_action) {
			case MusicAction.SkipSong: {
				await guild.music.skip().catch(null);
				break;
			}
			case MusicAction.PauseSong: {
				await guild.music.pause().catch(null);
				break;
			}
			case MusicAction.ResumePlaying: {
				await guild.music.resume().catch(null);
				break;
			}
		}
	}

	public async handleAuthenticationMessage(message: IncomingWebsocketMessage) {
		// If they're already authenticated, or didn't send a id/token, close.
		if (this.authenticated || !message.data || !message.data.token || !message.data.user_id) {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		let decryptedAuth;
		try {
			decryptedAuth = Util.decrypt(message.data.token, CLIENT_SECRET);
		} catch {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		if (!decryptedAuth.user_id || !decryptedAuth.token || decryptedAuth.user_id !== message.data.user_id) {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		let user;
		try {
			user = await this.client.users.fetch(decryptedAuth.user_id);
			if (!user) throw null;
		} catch {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		this.user = user;
		this.auth = decryptedAuth;
		this.authenticated = true;

		this.send({ success: true, action: OutgoingWebsocketAction.Authenticate });
	}

	public subscribeToMusic(guild_id: string) {
		const guild = this.client.guilds.get(guild_id);
		if (!guild) return;

		const subscription: Subscription = {
			type: SubscriptionName.Music,
			guild_id
		};

		this.subscriptions.push(subscription);
		this.syncMusic();
	}

	public handleSubscriptionUpdate(message: IncomingWebsocketMessage) {
		if (!message.data.subscription_name || !message.data.subscription_action) return;


		switch (message.data.subscription_action) {
			case SubscriptionAction.Subscribe: {
				if (message.data.subscription_name === SubscriptionName.Music) {
					if (!message.data.guild_id) return;
					this.subscribeToMusic(message.data.guild_id);
				}
			}
		}
	}

	private handleMessage(message: IncomingWebsocketMessage) {

		switch (message.action) {
			case IncomingWebsocketAction.Authenticate: {
				this.handleAuthenticationMessage(message).catch(err => this.client.emit(Events.Wtf, err));
				break;
			}

			case IncomingWebsocketAction.MusicQueueUpdate: {
				this.handleMusicMessage(message).catch(err => this.client.emit(Events.Wtf, err));
				break;
			}

			case IncomingWebsocketAction.SubscriptionUpdate: {
				this.handleSubscriptionUpdate(message);
				break;
			}
		}
	}

	private handleIncomingRawMessage(rawMessage: Data) {
		try {
			const parsedMessage: IncomingWebsocketMessage = JSON.parse(rawMessage as string);
			this.handleMessage(parsedMessage);
		} catch {
			// They've sent invalid JSON, close the connection.
			this._connection.close(CloseCodes.ProtocolError);
		}

	}

}

export class WebsocketHandler {

	public wss: Server;
	public users = new Collection<string, DashboardWebsocketUser>();

	@enumerable(false)
	private client: SkyraClient;

	public constructor(client: SkyraClient) {
		this.client = client;
		this.wss = new Server({ port: 565 });

		this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
			// We've just gotten a new Websocket Connection
			const ip = req.connection.remoteAddress;

			// If they don't have a IP for some reason, close.
			if (!ip) return ws.close(CloseCodes.InternalError);

			// If they already have a connection with this IP, close.
			if (this.users.has(ip)) return ws.close(CloseCodes.PolicyViolation);

			// We have a new "user", add them to this.users
			const websocketUser = new DashboardWebsocketUser(this.client, this.wss, ws, ip);
			this.users.set(ip, websocketUser);


			ws.on('close', () => {
				ws.removeAllListeners('message');
				this.users.delete(ip);
			});
		});
	}

}
