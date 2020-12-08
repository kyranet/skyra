import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import { dirname, join } from 'path';
import { toUnicode } from 'punycode';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Download entry from IANA, process the data as a string, and split it by new line
const response = await fetch('http://data.iana.org/TLD/tlds-alpha-by-domain.txt');
const text = await response.text();
const source = text.trim().split('\n');

// Removes the comment from the start of the file
if (source[0].startsWith('#')) source.shift();

// Define header and footer, which will wrap the content
const header = '// Autogenerated file from ICANN, source:\n// http://data.iana.org/TLD/tlds-alpha-by-domain.txt\n\nexport const TLDs = [\n';
const footer = '\n];\n';
const content = source
	.map((line, index) => {
		const lLine = line.toLowerCase();
		const parsed = toUnicode(lLine);
		const delimiter = index === source.length - 1 ? '' : ',';
		return lLine === parsed ? `\t'${parsed}'${delimiter}` : `\t'${parsed}'${delimiter} // ${lLine}`;
	})
	.join('\n');

await writeFile(join(__dirname, '..', 'src', 'lib', 'util', 'Links', 'TLDs.ts'), header + content + footer);
