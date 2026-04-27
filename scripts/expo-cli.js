const { spawn } = require('child_process');

const DEFAULT_PROXY = 'http://127.0.0.1:7897';
const DEFAULT_NO_PROXY = 'localhost,127.0.0.1,::1';
const OUTPUT_BUFFER_SIZE = 20000;

function buildEnv() {
  const proxy =
    process.env.CLASH_HTTP_PROXY ||
    process.env.clash_http_proxy ||
    process.env.QZZ_PROXY_URL ||
    DEFAULT_PROXY;

  const noProxy = process.env.NO_PROXY || process.env.no_proxy || DEFAULT_NO_PROXY;

  return {
    ...process.env,
    HTTP_PROXY: proxy,
    HTTPS_PROXY: proxy,
    ALL_PROXY: proxy,
    http_proxy: proxy,
    https_proxy: proxy,
    all_proxy: proxy,
    NO_PROXY: noProxy,
    no_proxy: noProxy,
  };
}

function runExpo(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [require.resolve('expo/bin/cli'), ...args], {
      env: buildEnv(),
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    let output = '';

    const forward = (stream, target) => {
      stream.on('data', (chunk) => {
        const text = chunk.toString();
        output = (output + text).slice(-OUTPUT_BUFFER_SIZE);
        target.write(chunk);
      });
    };

    forward(child.stdout, process.stdout);
    forward(child.stderr, process.stderr);

    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 0, output }));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const shouldRetryOffline = args[0] === 'start' && !args.includes('--offline');

  const firstRun = await runExpo(args);
  if (firstRun.code === 0) {
    process.exit(0);
  }

  if (shouldRetryOffline && /fetch failed/i.test(firstRun.output)) {
    console.warn('\nExpo online check failed. Retrying in offline mode with normalized proxy settings...');
    const retryRun = await runExpo([...args, '--offline']);
    process.exit(retryRun.code);
  }

  process.exit(firstRun.code);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
