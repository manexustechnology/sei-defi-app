#!/usr/bin/env ts-node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { AbiCoder, JsonRpcProvider, Log, getAddress, id, zeroPadValue } from 'ethers';

type TopicInput = Array<string | string[] | null>;

const DEFAULT_RPC = process.env.SEI_RPC ?? 'https://evm-rpc.sei.io';
const DEFAULT_BLOCK_CHUNK = Number(process.env.LOG_CHUNK_SIZE ?? '5000');

const DRAGON_FACTORY = getEnvAddress(
  'DRAGON_FACTORY',
  '0x179D9a5592Bc77050796F7be28058c51cA575df4',
);
const DRAGON_POSITION_MANAGER = getEnvAddress(
  'DRAGON_POSITION_MANAGER',
  '0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70',
);

const SAILOR_FACTORY = getEnvAddress(
  'SAILOR_FACTORY',
  '0xA51136931fdd3875902618bF6B3abe38Ab2D703b',
);
const SAILOR_POSITION_MANAGER = getEnvAddress(
  'SAILOR_POSITION_MANAGER',
  '0xe294d5Eb435807cD21017013Bef620ed1AeafbeB',
);

const SAILOR_API_BASE =
  process.env.SAILOR_API_BASE ??
  'https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_otherapi';

const abiCoder = AbiCoder.defaultAbiCoder();

const TOPIC_POOL_CREATED = id(
  'PoolCreated(address,address,uint24,int24,address)',
);
const TOPIC_ERC721_TRANSFER = id('Transfer(address,address,uint256)');
const TOPIC_INCREASE_LIQUIDITY = id(
  'IncreaseLiquidity(uint256,uint128,uint256,uint256)',
);
const TOPIC_DECREASE_LIQUIDITY = id(
  'DecreaseLiquidity(uint256,uint128,uint256,uint256)',
);
const TOPIC_COLLECT = id('Collect(uint256,address,uint256,uint256)');

main().catch((error) => {
  console.error('[liquidity] fatal error:\n', error);
  process.exit(1);
});

async function main() {
  const [, , command, ...argv] = process.argv;

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  switch (command) {
    case 'sailor:snapshot': {
      const snapshot = await fetchSailorSnapshot();
      console.log(JSON.stringify(snapshot, null, 2));
      return;
    }
    case 'sailor:query': {
      const query = await resolveQuery(argv);
      if (!query) {
        throw new Error('Missing GraphQL query. Provide --query or --file path.');
      }
      const variablesArg = getArgValue(argv, '--variables');
      const variables = variablesArg ? JSON.parse(variablesArg) : undefined;
      const response = await querySailorSubgraph(query, variables);
      console.log(JSON.stringify(response, null, 2));
      return;
    }
    case 'dex:pools': {
      const provider = createProvider();
      const factory = getArgAddress(argv, '--factory') ?? DRAGON_FACTORY;
      const from = await resolveBlockArg(provider, getArgValue(argv, '--from'), 0);
      const to = await resolveBlockArg(provider, getArgValue(argv, '--to'), 'latest');
      const pools = await fetchPoolCreations(provider, factory, from, to);
      console.log(JSON.stringify(pools, null, 2));
      return;
    }
    case 'clmm:positions': {
      const provider = createProvider();
      const wallet = getArgAddress(argv, '--wallet');
      if (!wallet) {
        throw new Error('Missing --wallet <address> argument');
      }
      const npm =
        getArgAddress(argv, '--position-manager') ??
        getArgAddress(argv, '--npm') ??
        DRAGON_POSITION_MANAGER;
      const from = await resolveBlockArg(provider, getArgValue(argv, '--from'), 0);
      const to = await resolveBlockArg(provider, getArgValue(argv, '--to'), 'latest');
      const positions = await fetchClmmPositionHistory(provider, npm, wallet, from, to);
      console.log(JSON.stringify(positions, null, 2));
      return;
    }
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
  }
}

function printHelp() {
  console.log(`Liquidity tooling

Commands:
  sailor:snapshot                Fetch Sailor REST snapshot (cmc/c1)
  sailor:query [--query | --file] Run Sailor GraphQL query against hosted subgraph
  dex:pools [--factory addr] [--from block] [--to block]
                                  Enumerate pool creations for a factory
  clmm:positions --wallet addr [--npm addr] [--from block] [--to block]
                                  Fetch CLMM position events for a wallet

Environment overrides:
  SEI_RPC                      RPC endpoint (default ${DEFAULT_RPC})
  DRAGON_FACTORY               DragonSwap factory address
  DRAGON_POSITION_MANAGER      DragonSwap position manager address
  SAILOR_FACTORY               Sailor factory address
  SAILOR_POSITION_MANAGER      Sailor position manager address
  SAILOR_API_BASE              Sailor API base URL
`);
}

function createProvider() {
  return new JsonRpcProvider(DEFAULT_RPC);
}

async function fetchSailorSnapshot() {
  const res = await fetch(`${SAILOR_API_BASE}/cmc/c1`);
  if (!res.ok) {
    throw new Error(`Snapshot request failed with ${res.status}`);
  }
  return res.json();
}

async function querySailorSubgraph(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(`${SAILOR_API_BASE}/sailor/subgraph`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Subgraph query failed with ${res.status}`);
  }
  return res.json();
}

async function fetchPoolCreations(
  provider: JsonRpcProvider,
  factory: string,
  fromBlock: number,
  toBlock: number,
) {
  const logs = await getLogsChunked(provider, factory, [TOPIC_POOL_CREATED], fromBlock, toBlock);

  const pools = await Promise.all(
    logs.map(async (log) => {
      const tx = await provider.getTransaction(log.transactionHash);
      const decoded = abiCoder.decode(
        ['uint24', 'int24', 'address'],
        log.data,
      );
      const fee = Number(decoded[0]);
      const tickSpacing = Number(decoded[1]);
      const poolAddr = getAddress(decoded[2]);

      const token0 = topicAddress(log.topics[1]);
      const token1 = topicAddress(log.topics[2]);

      return {
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        creator: tx?.from ? getAddress(tx.from) : undefined,
        token0,
        token1,
        fee,
        tickSpacing,
        pool: poolAddr,
      };
    }),
  );

  return pools;
}

async function fetchClmmPositionHistory(
  provider: JsonRpcProvider,
  positionManager: string,
  wallet: string,
  fromBlock: number,
  toBlock: number,
) {
  const walletTopic = normalizeTopicAddress(wallet);

  const received = await getLogsChunked(
    provider,
    positionManager,
    [TOPIC_ERC721_TRANSFER, null, walletTopic],
    fromBlock,
    toBlock,
  );
  const sent = await getLogsChunked(
    provider,
    positionManager,
    [TOPIC_ERC721_TRANSFER, walletTopic, null],
    fromBlock,
    toBlock,
  );

  const tokenIds = new Set<string>();
  for (const log of [...received, ...sent]) {
    tokenIds.add(topicUint(log.topics[3]));
  }

  const actions = await getLogsChunked(
    provider,
    positionManager,
    [[TOPIC_INCREASE_LIQUIDITY, TOPIC_DECREASE_LIQUIDITY, TOPIC_COLLECT]],
    fromBlock,
    toBlock,
  );

  const grouped: Record<string, Array<Record<string, unknown>>> = {};

  for (const log of actions) {
    const tokenTopic = log.topics[1];
    const tokenId = topicUint(tokenTopic);
    if (!tokenIds.has(tokenId)) continue;

    if (!grouped[tokenId]) {
      grouped[tokenId] = [];
    }

    if (log.topics[0] === TOPIC_INCREASE_LIQUIDITY) {
      const decoded = abiCoder.decode(
        ['uint128', 'uint256', 'uint256'],
        log.data,
      );
      const liquidity = decoded[0] as bigint;
      const amount0 = decoded[1] as bigint;
      const amount1 = decoded[2] as bigint;
      grouped[tokenId].push({
        event: 'IncreaseLiquidity',
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        liquidity: liquidity.toString(),
        amount0: amount0.toString(),
        amount1: amount1.toString(),
      });
    } else if (log.topics[0] === TOPIC_DECREASE_LIQUIDITY) {
      const decoded = abiCoder.decode(
        ['uint128', 'uint256', 'uint256'],
        log.data,
      );
      const liquidity = decoded[0] as bigint;
      const amount0 = decoded[1] as bigint;
      const amount1 = decoded[2] as bigint;
      grouped[tokenId].push({
        event: 'DecreaseLiquidity',
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        liquidity: liquidity.toString(),
        amount0: amount0.toString(),
        amount1: amount1.toString(),
      });
    } else if (log.topics[0] === TOPIC_COLLECT) {
      const decoded = abiCoder.decode(
        ['address', 'uint256', 'uint256'],
        log.data,
      );
      const recipient = getAddress(decoded[0]);
      const amount0 = decoded[1] as bigint;
      const amount1 = decoded[2] as bigint;
      grouped[tokenId].push({
        event: 'Collect',
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        recipient,
        amount0: amount0.toString(),
        amount1: amount1.toString(),
      });
    }
  }

  return {
    wallet,
    positionManager,
    tokenIds: Array.from(tokenIds),
    events: grouped,
  };
}

async function getLogsChunked(
  provider: JsonRpcProvider,
  address: string,
  topics: TopicInput,
  fromBlock: number,
  toBlock: number,
) {
  if (toBlock < fromBlock) {
    return [];
  }
  const step = DEFAULT_BLOCK_CHUNK;
  const logs: Log[] = [];
  for (let start = fromBlock; start <= toBlock; start += step) {
    const end = Math.min(start + step - 1, toBlock);
    const chunk = await provider.getLogs({
      address,
      topics,
      fromBlock: start,
      toBlock: end,
    });
    logs.push(...chunk);
  }
  return logs;
}

async function resolveQuery(argv: string[]) {
  const filePath = getArgValue(argv, '--file');
  if (filePath) {
    const resolved = resolve(process.cwd(), filePath);
    return readFileSync(resolved, 'utf-8');
  }
  const query = getArgValue(argv, '--query');
  if (query) return query;
  if (argv.length > 0) {
    return argv.join(' ');
  }
  return undefined;
}

async function resolveBlockArg(
  provider: JsonRpcProvider,
  value: string | undefined,
  fallback: number | 'latest',
): Promise<number> {
  if (!value) {
    if (fallback === 'latest') {
      return await provider.getBlockNumber();
    }
    return fallback;
  }

  if (value === 'latest') {
    return provider.getBlockNumber();
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid block number: ${value}`);
  }
  return parsed;
}

function getArgValue(args: string[], key: string): string | undefined {
  const index = args.findIndex((arg) => arg === key || arg.startsWith(`${key}=`));
  if (index === -1) return undefined;
  const arg = args[index];
  if (arg.includes('=')) {
    return arg.substring(arg.indexOf('=') + 1);
  }
  return args[index + 1];
}

function getArgAddress(args: string[], key: string): string | undefined {
  const value = getArgValue(args, key);
  if (!value) return undefined;
  return getAddress(value);
}

function topicAddress(topic: string): string {
  return getAddress(`0x${topic.slice(26)}`);
}

function topicUint(topic: string): string {
  return BigInt(topic).toString();
}

function normalizeTopicAddress(address: string): string {
  return zeroPadValue(getAddress(address), 32);
}

function getEnvAddress(key: string, fallback: string): string {
  const value = process.env[key];
  return value ? getAddress(value) : getAddress(fallback);
}
