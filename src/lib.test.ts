import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {resolveExt, getEnv, exportObjects} from './lib.js';
import oracledb from 'oracledb';
import fse from 'fs-extra';
import path from 'node:path';

vi.mock('fs-extra');

describe('resolveExt', () => {
	it('should return the correct extension for known object types', () => {
		expect(resolveExt('PACKAGE')).toBe('.pks');
		expect(resolveExt('PACKAGE BODY')).toBe('.pkb');
		expect(resolveExt('PROCEDURE')).toBe('.prc');
		expect(resolveExt('FUNCTION')).toBe('.fnc');
		expect(resolveExt('TYPE')).toBe('.tps');
		expect(resolveExt('TYPE BODY')).toBe('.tpb');
		expect(resolveExt('JAVA SOURCE')).toBe('.sjp');
		expect(resolveExt('TRIGGER')).toBe('.trg');
	});

	it('should be case-insensitive', () => {
		expect(resolveExt('package')).toBe('.pks');
		expect(resolveExt('Procedure')).toBe('.prc');
	});

	it('should return .pls for unknown object types', () => {
		expect(resolveExt('UNKNOWN')).toBe('.pls');
		expect(resolveExt('')).toBe('.pls');
	});
});

describe('getEnv', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.stubGlobal('process', {
			...process,
			env: {...originalEnv},
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should return the environment variable if it exists', () => {
		process.env.TEST_VAR = 'hello';
		expect(getEnv('TEST_VAR', 'default')).toBe('hello');
	});

	it('should return the default value if the environment variable does not exist', () => {
		delete process.env.TEST_VAR;
		expect(getEnv('TEST_VAR', 'default')).toBe('default');
	});
});

describe('exportObjects', () => {
	it('should query objects and write them to files', async () => {
		const mockExecute = vi.fn().mockResolvedValue({
			rows: [
				{NAME: 'MY_PROC', TYPE: 'PROCEDURE', LINE: 1, TEXT: 'procedure my_proc as\n'},
				{NAME: 'MY_PROC', TYPE: 'PROCEDURE', LINE: 2, TEXT: 'begin null; end;'},
				{NAME: 'MY_PKG', TYPE: 'PACKAGE', LINE: 1, TEXT: 'package my_pkg as end;'},
			],
		});

		const mockConnection = {
			execute: mockExecute,
		} as unknown as oracledb.Connection;

		const directory = '/tmp/export';
		await exportObjects(mockConnection, directory, null, null);

		expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT'), {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});

		expect(fse.writeFileSync).toHaveBeenCalledTimes(2);

		expect(fse.writeFileSync).toHaveBeenCalledWith(
			path.join(directory, 'my_proc.prc'),
			'CREATE OR REPLACE\nprocedure my_proc as\nbegin null; end;\n/\n',
			'utf8',
		);

		expect(fse.writeFileSync).toHaveBeenCalledWith(path.join(directory, 'my_pkg.pks'), 'CREATE OR REPLACE\npackage my_pkg as end;\n/\n', 'utf8');
	});

	it('should apply filters if provided', async () => {
		const mockExecute = vi.fn().mockResolvedValue({rows: []});
		const mockConnection = {
			execute: mockExecute,
		} as unknown as oracledb.Connection;

		await exportObjects(mockConnection, '/tmp', 'PROCEDURE', 'MY_PROC');

		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('UPPER(type) = UPPER(:type) AND UPPER(name) = UPPER(:name)'),
			{type: 'PROCEDURE', name: 'MY_PROC'},
			{outFormat: oracledb.OUT_FORMAT_OBJECT},
		);
	});
});
