import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { codeBlock } from '@sapphire/utilities';
import { KlasaMessage } from 'klasa';
import { fetch, FetchMethods, FetchResultTypes } from './util';

export async function handleMessage<ED extends ExtraDataPartial>(
	message: KlasaMessage,
	options: HandleMessageData<ED>
): Promise<KlasaMessage | KlasaMessage[] | null> {
	switch (options.sendAs) {
		case 'file': {
			if (message.channel.attachable) {
				return message.channel.sendFile(
					Buffer.from(options.content ? options.content : options.result!),
					options.targetId ? `${options.targetId}.txt` : 'output.txt',
					await message.fetchLocale(
						options.time !== undefined && options.footer !== undefined
							? LanguageKeys.System.ExceededLengthOutputFileWithTypeAndTime
							: LanguageKeys.System.ExceededLengthOutputFile,
						{ time: options.time, type: options.footer }
					)
				);
			}

			await getTypeOutput(message, options);
			return handleMessage(message, options);
		}
		case 'haste':
		case 'hastebin': {
			if (!options.url)
				options.url = await getHaste(options.content ? options.content : options.result!, options.language ?? 'md').catch(() => null);
			if (options.url)
				return message.sendLocale(
					options.time !== undefined && options.footer !== undefined
						? LanguageKeys.System.ExceededLengthOutputHastebinWithTypeAndTime
						: LanguageKeys.System.ExceededLengthOutputHastebin,
					[{ url: options.url, time: options.time, type: options.footer }]
				) as Promise<KlasaMessage>;
			options.hastebinUnavailable = true;
			await getTypeOutput(message, options);
			return handleMessage(message, options);
		}
		case 'console':
		case 'log': {
			if (options.canLogToConsole) {
				message.client.emit(Events.Log, options.result);
				return message.sendLocale(
					options.time !== undefined && options.footer !== undefined
						? LanguageKeys.System.ExceededLengthOutputConsoleWithTypeAndTime
						: LanguageKeys.System.ExceededLengthOutputConsole,
					[{ time: options.time, type: options.footer }]
				) as Promise<KlasaMessage>;
			}
			await getTypeOutput(message, options);
			return handleMessage(message, options);
		}
		case 'abort':
		case 'none':
			return null;
		default: {
			if (options.content ? options.content.length > 1950 : options.result!.length > 1950) {
				await getTypeOutput(message, options);
				return handleMessage(message, options);
			}

			if (options.content) {
				return message.sendMessage(
					`${options.content}${
						options.content && options.attachments ? `\n\n\n=============\n${options.attachments}` : options.attachments
					}`,
					{ code: 'md' }
				);
			}
			return message.sendLocale(
				options.success
					? options.time !== undefined && options.footer !== undefined
						? LanguageKeys.System.ExceededLengthOutputWithTypeAndTime
						: LanguageKeys.System.ExceededLengthOutput
					: LanguageKeys.Commands.System.EvalError,
				[
					{
						output: codeBlock(options.language!, options.result!),
						time: options.time,
						type: options.footer
					}
				]
			) as Promise<KlasaMessage>;
		}
	}
}

async function getTypeOutput<ED extends ExtraDataPartial>(message: KlasaMessage, options: HandleMessageData<ED>) {
	const _options = ['none', 'abort'];
	if (options.canLogToConsole) _options.push('log');

	if (message.channel.attachable) _options.push('file');
	if (!options.hastebinUnavailable) _options.push('hastebin');
	let _choice: { content: string } | undefined = undefined;
	do {
		_choice = await message
			.prompt(await message.fetchLocale(LanguageKeys.System.ExceededLengthChooseOutput, { output: _options }))
			.catch(() => ({ content: 'none' }));
	} while (!_options.concat('none', 'abort').includes(_choice.content));
	options.sendAs = _choice.content.toLowerCase();
}

async function getHaste(result: string, language = 'js') {
	const { key } = await fetch<{ key: string }>('https://hasteb.in/documents', { method: FetchMethods.Post, body: result }, FetchResultTypes.JSON);
	return `https://hasteb.in/${key}.${language}`;
}

type HandleMessageData<ED extends ExtraDataPartial> = {
	sendAs: string | null;
	hastebinUnavailable: boolean;
	url: string | null;
	canLogToConsole: boolean;
} & ED;

export interface EvalExtraData {
	success: boolean;
	result: string;
	time: string;
	footer: string;
	language: string;
}

export interface ContentExtraData {
	content: string;
	targetId: string;
	attachments: string;
}

type ExtraDataPartial = Partial<EvalExtraData> & Partial<ContentExtraData>;
