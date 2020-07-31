import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { cdnFolder } from '@utils/constants';
import { fetchAvatar } from '@utils/util';
import { loadImage, Image } from 'canvas';
import { Canvas, rgba } from 'canvas-constructor';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';

const THEMES_FOLDER = join(cdnFolder, 'skyra-assets', 'banners');

export default class extends SkyraCommand {

	private lightThemeTemplate: Image = null!;
	private darkThemeTemplate: Image = null!;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['lvl', 'rank'],
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_LEVEL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_LEVEL_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author]: [KlasaUser]) {
		const output = await this.showProfile(message, user);
		return message.channel.send({ files: [{ attachment: output, name: 'Level.png' }] });
	}

	public async showProfile(message: KlasaMessage, user: KlasaUser) {
		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(user.id);

		/* Calculate information from the user */
		const previousLevel = Math.floor((settings.level / 0.2) ** 2);
		const nextLevel = Math.floor(((settings.level + 1) / 0.2) ** 2);
		const progressBar = Math.max(Math.round(((settings.points - previousLevel) / (nextLevel - previousLevel)) * 265), 6);

		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			loadImage(join(THEMES_FOLDER, `${settings.profile.bannerLevel}.png`)),
			fetchAvatar(user, 256)
		]);

		const TITLE = message.language.retrieve('COMMAND_LEVEL');
		return new Canvas(640, 174)
			// Draw the background
			.save()
			.createBeveledClip(10, 10, 620, 154, 8)
			.printImage(themeImageSRC, 9, 9, 189, 157)
			.restore()
			.printImage(settings.profile.darkTheme ? this.darkThemeTemplate! : this.lightThemeTemplate!, 0, 0, 640, 174)

			// Draw the progress bar
			.setColor(`#${settings.profile.color.toString(16).padStart(6, '0') || 'FF239D'}`)
			.printRoundedRectangle(341, 86, progressBar, 9, 3)

			// Set styles
			.setColor(settings.profile.darkTheme ? '#F0F0F0' : '#171717')
			.setTextFont('28px RobotoLight')

			// Statistics Titles
			.printText(TITLE.EXPERIENCE, 340, 73)
			.printText(TITLE.NEXT_IN, 340, 128)

			// Draw the information
			.setTextAlign('right')
			.printText(settings.points.toString(), 606, 73)
			.printText((nextLevel - settings.points).toString(), 606, 131)

			// Draw the level
			.setTextAlign('center')
			.setTextFont('35px RobotoLight')
			.printText(TITLE.LEVEL, 268, 73)
			.setTextFont('45px RobotoRegular')
			.printText(settings.level.toString(), 268, 128)

			// Draw the avatar
			.save()
			.printCircularImage(imgAvatarSRC, 103, 87, 71)
			.restore()
			.toBufferAsync();
	}

	public async init() {
		[
			this.lightThemeTemplate,
			this.darkThemeTemplate
		] = await Promise.all([
			new Canvas(640, 174)
				.setAntialiasing('subpixel')
				.setShadowColor(rgba(0, 0, 0, 0.7))
				.setShadowBlur(7)
				.setColor('#FFFFFF')
				.createBeveledPath(10, 10, 620, 154, 8)
				.fill()
				.createBeveledClip(10, 10, 620, 154, 5)
				.clearRectangle(10, 10, 186, 154)
				.printCircle(103, 87, 70)
				.resetShadows()
				.setColor('#E8E8E8')
				.printRoundedRectangle(340, 85, 267, 11, 4)
				.toBufferAsync()
				.then(loadImage),
			new Canvas(640, 174)
				.setAntialiasing('subpixel')
				.setShadowColor(rgba(0, 0, 0, 0.7))
				.setShadowBlur(7)
				.setColor('#202225')
				.createBeveledPath(10, 10, 620, 154, 8)
				.fill()
				.createBeveledClip(10, 10, 620, 154, 5)
				.clearRectangle(10, 10, 186, 154)
				.printCircle(103, 87, 70)
				.resetShadows()
				.setColor('#2C2F33')
				.printRoundedRectangle(340, 85, 267, 11, 4)
				.toBufferAsync()
				.then(loadImage)
		]);
	}

}

export interface LevelTitles {
	EXPERIENCE: string;
	NEXT_IN: string;
	LEVEL: string;
}
