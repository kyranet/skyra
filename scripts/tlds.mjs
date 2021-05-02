import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { writeFile } from 'node:fs/promises';
import { toUnicode } from 'node:punycode';

// Download entry from IANA, process the data as a string, and split it by new line
const text = await fetch('http://data.iana.org/TLD/tlds-alpha-by-domain.txt', FetchResultTypes.Text);
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

const outputFile = new URL('../typescript/src/lib/util/Links/TLDs.ts', import.meta.url);

void writeFile(outputFile, header + content + footer);
