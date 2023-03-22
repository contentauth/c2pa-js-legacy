import fg from 'fast-glob';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import pReduce from 'p-reduce';
import { packageDirectory } from 'pkg-dir';
import prettier from 'prettier';
import rimraf from 'rimraf';
import ssri from 'ssri';

const INTEGRITY_ALGORITHM = 'sha512';

/**
 * Runs a process using the `spawn` command.
 * @param {string} cmd Command to run
 * @param {string} args Arguments to pass to the command
 * @param {*} opts Options for this script invocation
 */
async function runProcess(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args.split(' '), {
      cwd: opts.packageDir,
      shell: opts.shell,
    });

    proc.stdout.on('data', (data) => {
      opts.verbose && console.log(`[${cmd}] ${data}`);
    });

    proc.stderr.on('data', (data) => {
      opts.verbose && console.error(`[${cmd}] ${data}`);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject({ msg: `${cmd} exited with non-zero status code` });
      }
    });
  });
}

async function buildWasm(opts) {
  const cmd = `wasm-pack`;
  const mode = opts.dev ? 'dev' : 'release';
  const verbosity = opts.verbose ? 'verbose' : 'quiet';
  const args = `build --weak-refs --${verbosity} --out-name toolkit --${mode} --target web`;

  opts.verbose && console.log(`Building in ${mode.toUpperCase()} mode`);

  await runProcess(cmd, args, opts);
}

/**
 * Builds TypeScript types for export
 * @param {*} opts Options for this script invocation
 */
async function buildTypes(opts) {
  // We need to the full path to `tsc` for Windows for it to resolve correctly.
  const tscPath = join(opts.packageDir, './node_modules/.bin/tsc');
  const tsconfigPath = join(opts.packageDir, './tsconfig.json');
  opts = {
    ...opts,
    // Since the `tsc` command is either a CMD or PS1 file on
    // Windows, we must use the shell context for executing.
    shell: true,
  };

  await runProcess(tscPath, `--project ${tsconfigPath}`, opts);
}

/**
 * Generates an `integrity.json` file that other modules can access, most notably for the `c2pa` package
 * @param {*} opts Options for this script invocation
 */
async function generateIntegrity(opts) {
  const distDir = join(opts.packageDir, 'pkg');
  const integrityPath = join(distDir, 'integrity.json');
  const files = await fg(['toolkit*'], {
    absolute: true,
    cwd: distDir,
  });

  const mapping = await pReduce(
    files,
    async (acc, file) => {
      const name = basename(file);
      const stream = createReadStream(file);
      const integrity = await ssri.fromStream(stream, {
        algorithms: [INTEGRITY_ALGORITHM],
      });
      return { ...acc, [name]: integrity.toJSON() };
    },
    {},
  );

  const json = prettier.format(JSON.stringify(mapping), { parser: 'json' });

  opts.verbose && console.log(`Writing integrity.json with:\n%s`, json);

  await writeFile(integrityPath, json);
}

/**
 * Main entry point - this does the following:
 * - uses wasm-pack to build the Wasm from c2pa-rs
 * - Removes unneeded files
 * - Builds any TypeScript types for export
 * - Generates an `integrity.json` file to be used by the main c2pa package
 */
async function build() {
  const opts = {
    dev: !!process.argv.find((x) => x === '--dev'),
    verbose: !!process.argv.find((x) => x === '--verbose'),
    packageDir: await packageDirectory(),
  };

  try {
    const toDelete = ['./pkg/.gitignore', './pkg/package.json'];
    await buildWasm(opts);
    await rimraf(toDelete);
    await buildTypes(opts);
    await generateIntegrity(opts);
  } catch (err) {
    console.error('Error building release:', err);
    process.exit(1);
  }
}

// Kick it off
build();
