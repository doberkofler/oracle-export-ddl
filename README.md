# oracle-export-ddl

A specialized CLI tool to export Oracle procedural objects (Packages, Procedures, Functions, Types, and Triggers) from the `USER_SOURCE` data dictionary view into individual, version-controllable physical files.

[![NPM Version](https://img.shields.io/npm/v/oracle-export-ddl.svg)](https://npmjs.org/package/oracle-export-ddl)
[![Node.js CI](https://github.com/doberkofler/oracle-export-ddl/actions/workflows/node.js.yml/badge.svg)](https://github.com/doberkofler/oracle-export-ddl/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/doberkofler/oracle-export-ddl/badge.svg?branch=main)](https://github.com/doberkofler/oracle-export-ddl?branch=main)

## Features

- **Object Support:** Exports `PACKAGE`, `PACKAGE BODY`, `PROCEDURE`, `FUNCTION`, `TYPE`, `TYPE BODY`, `JAVA SOURCE`, and `TRIGGER`.
- **Smart Extensions:** Automatically maps Oracle object types to standard file extensions (`.pks`, `.pkb`, `.prc`, `.fnc`, etc.).
- **SQL*Plus Compatible:** Wraps exported source code with `CREATE OR REPLACE` and the `/` terminator.
- **Filtering:** Filter by object type or specific object name.
- **Modern Stack:** Built with TypeScript, Node.js 22+, and `node-oracledb`.

## Installation

```bash
npm install -g oracle-export-ddl
```

## Usage

```bash
oracle-export-ddl --username MY_USER --password MY_PASSWORD --connection localhost:1521/XEPDB1 --directory ./src/db
```

### Options

- `--connection <string>`: Oracle connection string (Default: `127.0.0.1:1521/TEST` or `ORACLE_SERVER` env var).
- `--username <string>`: Oracle username (Required or `ORACLE_USER` env var).
- `--password <string>`: Oracle password (Required or `ORACLE_PASSWORD` env var).
- `--directory <string>`: Output directory (Default: `./output`).
- `--type <string>`: Filter by object type (e.g., `PACKAGE`, `PROCEDURE`).
- `--name <string>`: Filter by object name (e.g., `MY_COOL_PROCEDURE`).

## Environment Variables

The tool can also be configured using environment variables:

- `ORACLE_SERVER`: Database connection string.
- `ORACLE_USER`: Database username.
- `ORACLE_PASSWORD`: Database password.

## Development

See [AGENTS.md](./AGENTS.md) for detailed development guidelines, code style, and testing instructions.

### Quick Start

1. `npm install`
2. `npm run build`
3. `npm run test`

## License

MIT © [Dieter Oberkofler](https://github.com/doberkofler)
