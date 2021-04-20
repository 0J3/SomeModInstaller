import * as fs from 'fs';
import * as prompts from 'prompts';
import axios from 'axios';
import * as Path from 'path';

const config = {
	modsList:
		'https://raw.githubusercontent.com/0J3/SomeModInstaller/main/mods.json',
	defaultPath: process.env.APPDATA + '\\.minecraft\\mods',
};
(async () => {
	process.title = 'Mod Downloader by 0J3#0001';
	const { defaultPath } = config;

	const { userpath } = await prompts([
		{
			type: fs.existsSync(defaultPath) ? 'toggle' : null,
			name: 'useDefault',
			message: `Use the default installation path? (${defaultPath})`,
			initial: false,
			active: 'no',
			inactive: 'yes',
		},
		{
			type: prev => (prev == true ? 'text' : null),
			name: 'userpath',
			message: `Please enter a custom path`,
			initial: fs.existsSync(defaultPath) ? defaultPath : null,
			validate: path =>
				fs.existsSync(path) ? true : 'Please enter a valid path',
		},
	]);

	const dlpath = userpath || defaultPath;

	if (!fs.existsSync(dlpath)) {
		throw new Error('Cannot find path');
	}

	const download = (url: string, path: string) => {
		return new Promise(async (resolve, reject) => {
			try {
				// path = target
				path = Path.resolve(path);
				const writer = fs.createWriteStream(path);

				const response = await axios({
					url,
					method: 'GET',
					responseType: 'stream',
				});

				writer.on('finish', resolve);
				writer.on('error', reject);

				response.data.pipe(writer);
			} catch (error) {
				const errFile = Path.resolve(
					`./error-${new Date().getTime() / 1000}.log`
				);
				console.error(
					'Downloading',
					url,
					`errored! See ${errFile} for information`
				);
				fs.writeFileSync(errFile, error);
				resolve(1);
			}
		});
	};

	const downloadMod = (dat: { name: string; url: string }) => {
		const rpath = Path.resolve(dlpath + dat.name);
		console.log(`Downloader: Saving ${dat.name} to ${rpath}`);
		download(dat.url, rpath);
	};

	const mods = (await axios.get(config.modsList)).data;
	console.log(mods);

	mods.forEach(downloadMod);
})();
