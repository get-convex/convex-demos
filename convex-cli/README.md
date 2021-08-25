# convex-cli

Command-line interface for Convex cloud backend.

## Usage

This package provides the `convex` command. It requires Node.js version 14 or
higher to run, and it is written in TypeScript.

### Installation

Eventually, we will publish this as a public package on NPM, and users will be
able to install the packaged version with `npm install -D convex-cli` within
their project folder (or globally, if they want). However, for now, you can use
the CLI tool from source using `npm install` to get dependencies. The example
apps all list `convex-cli` as a local file system dependency.

### Bootstrapping a project

To add Convex to your web application, a user should run the following commands:

```sh-session
$ npm install -D convex-cli
$ npx convex init
```

The first adds the CLI as a development dependency, and the second initializes
the package, asks for information such as project ID and credentials, installs
the `convex-sdk` package, and creates a `convex.json` configuration file.

### Registering UDFs

To register UDFs defined as JavaScript files in a folder to a running convex
HTTP server, you can use the `convex register` command.

```bash
npx convex register
```

### Miscellaneous commands

Running `convex help` prints out detailed help information, while
`convex version` prints out the current version of the CLI. You can get help
for a subcommand by running `convex <subcommand> --help`.
