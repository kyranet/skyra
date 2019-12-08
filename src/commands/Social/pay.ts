import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { Events } from '../../lib/types/Enums';
import { EconomyTransactionAction, EconomyTransactionReason } from '../../lib/types/influxSchema/Economy';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_PAY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_PAY_EXTENDED'),
			runIn: ['text'],
			spam: true,
			usage: '<amount:integer> <user:user>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [money, user]: [number, KlasaUser]) {
		if (message.author === user) throw message.language.tget('COMMAND_PAY_SELF');
		if (user.bot) return message.sendLocale('COMMAND_SOCIAL_PAY_BOT');

		if (money <= 0) throw message.language.tget('RESOLVER_POSITIVE_AMOUNT');

		await message.author.settings.sync();
		const currencyBeforePrompt = message.author.settings.get(UserSettings.Money);
		if (currencyBeforePrompt < money) throw message.language.tget('COMMAND_PAY_MISSING_MONEY', money, currencyBeforePrompt);

		const accepted = await message.ask(message.language.tget('COMMAND_PAY_PROMPT', user.username, money));

		const currencyAfterPrompt = message.author.settings.get(UserSettings.Money);
		if (currencyAfterPrompt < money) throw message.language.tget('COMMAND_PAY_MISSING_MONEY', money, currencyAfterPrompt);

		return accepted ? this.acceptPayment(message, user, money) : this.denyPayment(message);
	}

	private async acceptPayment(message: KlasaMessage, user: KlasaUser, money: number) {
		await user.settings.sync();

		const authorBeforeDecrease = await message.author.settings.get(UserSettings.Money);
		await message.author.settings.decrease(UserSettings.Money, money);
		this.client.emit(Events.MoneyTransaction, message.author, money, authorBeforeDecrease, EconomyTransactionAction.Remove, EconomyTransactionReason.Payment);

		const userBeforeIncrease = await user.settings.get(UserSettings.Money);
		await user.settings.increase(UserSettings.Money, money);
		this.client.emit(Events.MoneyTransaction, user, money, userBeforeIncrease, EconomyTransactionAction.Add, EconomyTransactionReason.Payment);

		this.client.emit(Events.MoneyPayment, message, message.author, user, money);
		return message.alert(message.language.tget('COMMAND_PAY_PROMPT_ACCEPT', user.username, money));
	}

	private denyPayment(message: KlasaMessage) {
		return message.alert(message.language.tget('COMMAND_PAY_PROMPT_DENY'));
	}

}
