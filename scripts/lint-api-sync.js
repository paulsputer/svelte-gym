import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const libPath = path.resolve(__dirname, '../src/lib');
const v4Path = path.resolve(__dirname, '../src/lib/v4');

const exclusions = {
	TestHarness: ['componentToTest', 'controls', 'children', 'logs'] // Snippets in v5 are slots in v4
};

function parseSvelte5Props(content) {
	const propsMatch = content.match(/interface\s+\w+Props\s*{([\s\S]*?)\n\s*}/);
	if (!propsMatch) return [];

	const interfaceBody = propsMatch[1];
	const props = [];
	const lines = interfaceBody.split('\n');
	for (const line of lines) {
		const m = line.match(/^\s*([\w_]+)[?]?\s*:/);
		if (m) {
			props.push(m[1]);
		}
	}
	return props;
}

function parseSvelte4Props(content) {
	const props = [];
	const regex = /export\s+let\s+([\w_]+)/g;
	let match;
	while ((match = regex.exec(content)) !== null) {
		props.push(match[1]);
	}
	return props;
}

function main() {
	console.log('Running Svelte v4 vs v5 API parity check...');
	const files = fs.readdirSync(libPath).filter((f) => f.endsWith('.svelte'));

	let hasErrors = false;

	for (const file of files) {
		const v5File = path.join(libPath, file);
		const v4File = path.join(v4Path, file);

		if (!fs.existsSync(v4File)) {
			console.error(`❌ [${file}] Missing v4 counterpart at ${v4File}`);
			hasErrors = true;
			continue;
		}

		const v5Content = fs.readFileSync(v5File, 'utf8');
		const v4Content = fs.readFileSync(v4File, 'utf8');

		const v5Props = parseSvelte5Props(v5Content);
		let v4Props = parseSvelte4Props(v4Content);

		const componentName = file.replace('.svelte', '');
		const componentExclusions = exclusions[componentName] || [];

		const missingInV4 = v5Props.filter(
			(p) => !v4Props.includes(p) && !componentExclusions.includes(p)
		);
		const missingInV5 = v4Props.filter(
			(p) => !v5Props.includes(p) && !componentExclusions.includes(p)
		);

		if (missingInV4.length > 0) {
			console.error(`❌ [${file}] Missing props in v4: ${missingInV4.join(', ')}`);
			hasErrors = true;
		}

		if (missingInV5.length > 0) {
			console.error(
				`❌ [${file}] Extraneous props in v4 (missing in v5): ${missingInV5.join(', ')}`
			);
			hasErrors = true;
		}

		if (missingInV4.length === 0 && missingInV5.length === 0) {
			console.log(`✅ [${file}] APIs match`);
		}
	}

	if (hasErrors) {
		process.exit(1);
	} else {
		console.log('🎉 All components have matching APIs!');
	}
}

main();
