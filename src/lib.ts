import debugLib from 'debug';
import path from 'node:path';
import fse from 'fs-extra';
import {Command} from 'commander';
import {z} from 'zod';
import oracledb from 'oracledb';

const debug = debugLib('export_objects');

/** Maps Oracle object types from USER_SOURCE to file extensions. */
export const OBJECT_TYPE_EXT: Record<string, string> = {
	PACKAGE: '.pks',
	'PACKAGE BODY': '.pkb',
	PROCEDURE: '.prc',
	FUNCTION: '.fnc',
	TYPE: '.tps',
	'TYPE BODY': '.tpb',
	'JAVA SOURCE': '.sjp', // stored java — no reliable way to distinguish proc vs func at source level
	TRIGGER: '.trg',
} as const;

export const SourceRowSchema = z.strictObject({
	NAME: z.string(),
	TYPE: z.string(),
	LINE: z.number(),
	TEXT: z.string().nullable(),
});

export type SourceRow = z.infer<typeof SourceRowSchema>;

/**
 * Resolves file extension for a given Oracle object type.
 * Falls back to `.pls` for unknown PL/SQL types.
 * @param objectType
 */
export const resolveExt = (objectType: string): string => OBJECT_TYPE_EXT[objectType.toUpperCase()] ?? '.pls';

/**
 * Queries USER_SOURCE, groups by (name, type), writes one file per object.
 * @param connection
 * @param directory
 * @param filterType
 * @param filterName
 */
export const exportObjects = async (
	connection: oracledb.Connection,
	directory: string,
	filterType: string | null,
	filterName: string | null,
): Promise<void> => {
	debug('exportObjects: filterType=%s filterName=%s', filterType, filterName);

	const conditions: string[] = [];
	const binds: Record<string, string> = {};

	if (filterType !== null) {
		conditions.push('UPPER(type) = UPPER(:type)');
		binds.type = filterType;
	}
	if (filterName !== null) {
		conditions.push('UPPER(name) = UPPER(:name)');
		binds.name = filterName;
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	const sql = `
		SELECT name, type, line, text
		FROM user_source
		${where}
		ORDER BY name, type, line
	`;

	debug('exportObjects: sql=%s binds=%o', sql, binds);

	const result = await connection.execute(sql, binds, {outFormat: oracledb.OUT_FORMAT_OBJECT});

	const rows = z.array(SourceRowSchema).parse(result.rows);
	debug('exportObjects: total rows=%d', rows.length);

	// Group rows by composite key "NAME||TYPE"
	const grouped = new Map<string, {name: string; type: string; lines: SourceRow[]}>();
	for (const row of rows) {
		const key = `${row.NAME}||${row.TYPE}`;
		let entry = grouped.get(key);
		if (!entry) {
			entry = {name: row.NAME, type: row.TYPE, lines: []};
			grouped.set(key, entry);
		}
		entry.lines.push(row);
	}

	let count = 0;
	for (const {name, type, lines} of grouped.values()) {
		const ext = resolveExt(type);
		const filename = path.join(directory, `${name}${ext}`.toLowerCase());

		// USER_SOURCE.TEXT already includes line terminators in most Oracle versions,
		// but may be null for blank lines — normalise to empty string.
		// Prefix with CREATE OR REPLACE and append / terminator for SQL*Plus/SQLcl compatibility.
		const body = lines.map((r) => r.TEXT ?? '').join('');
		const source = `CREATE OR REPLACE\n${body}\n/\n`;

		fse.writeFileSync(filename, source, 'utf8');
		console.log(`Exported [${type}] "${name}" → "${filename}" (${source.length} bytes)`);
		count++;
	}

	console.log(`\nDone. Exported ${count} object(s).`);
};

export const getEnv = (key: string, defaultValue: string): string => process.env[key] ?? defaultValue;

export const main = async (): Promise<void> => {
	const program = new Command();

	program
		.name('oracle-export-ddl.ts')
		.description('Export Oracle procedural objects from USER_SOURCE to files')
		.option('--connection <string>', 'Oracle connection string', getEnv('ORACLE_SERVER', '127.0.0.1:1521/TEST'))
		.option('--username <string>', 'Oracle username', getEnv('ORACLE_USER', ''))
		.option('--password <string>', 'Oracle password', getEnv('ORACLE_PASSWORD', ''))
		.option('--directory <string>', 'Output directory', './output')
		.option('--type <string>', 'Filter by object type (e.g. PACKAGE, PROCEDURE). Omit for all.')
		.option('--name <string>', 'Filter by object name. Omit for all.')
		.option('-h, --help', 'Show help', () => {
			program.help();
		});

	program.parse(process.argv);

	const opts = program.opts<{
		connection: string;
		username: string;
		password: string;
		directory: string;
		type?: string;
		name?: string;
	}>();

	debug('options: %o', opts);

	// Validate required string options
	for (const key of ['connection', 'username', 'password', 'directory'] as const) {
		if (typeof opts[key] !== 'string') {
			throw new Error(`Invalid option "${key}": ${String(opts[key])}`);
		}
	}
	if (!opts.username) {
		throw new Error('--username is required (or set ORACLE_USER)');
	}

	const directory = path.resolve(opts.directory);
	await fse.ensureDir(directory);

	console.log(`Connecting to "${opts.connection}" as "${opts.username}"`);
	const connection = await oracledb.getConnection({
		connectionString: opts.connection,
		user: opts.username,
		password: opts.password,
	});

	try {
		await exportObjects(connection, directory, opts.type ?? null, opts.name ?? null);
	} finally {
		await connection.close();
	}
};
