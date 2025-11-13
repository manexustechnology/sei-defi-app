# Liquidity Analysis Toolkit

This document explains how to use the `tools/liquidity` CLI to collect historical pool data from Sailor and DragonSwap on the Sei EVM network.

## Prerequisites

- Node.js 20+
- Installed project dependencies (`npm install`)
- Network access to a Sei EVM RPC endpoint (defaults to `https://evm-rpc.sei.io`)

Optional (for faster historical reads): an archive-grade Sei RPC such as BlockPI.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `SEI_RPC` | RPC endpoint used for on-chain log queries | `https://evm-rpc.sei.io` |
| `DRAGON_FACTORY` | DragonSwap V2 factory contract | `0x179D9a5592Bc77050796F7be28058c51cA575df4` |
| `DRAGON_POSITION_MANAGER` | DragonSwap `NonfungiblePositionManager` | `0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70` |
| `SAILOR_FACTORY` | Sailor factory contract | `0xA51136931fdd3875902618bF6B3abe38Ab2D703b` |
| `SAILOR_POSITION_MANAGER` | Sailor `NonfungiblePositionManager` | `0xe294d5Eb435807cD21017013Bef620ed1AeafbeB` |
| `SAILOR_API_BASE` | Base URL for Sailor’s public API | `https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_otherapi` |
| `LOG_CHUNK_SIZE` | Block span per `eth_getLogs` batch | `5000` |

Set variables inline when running commands if you need overrides:

```sh
SAILOR_API_BASE=https://custom.example/navigator \
  npm run liquidity -- sailor:snapshot
```

## Available commands

Invoke all subcommands via `npm run liquidity -- <command> [options]`.

### 1. `sailor:snapshot`

Fetches Sailor’s aggregated market snapshot (`cmc/c1`). Useful for quick TVL/volume ingestion.

```sh
npm run liquidity -- sailor:snapshot > data/sailor-snapshot.json
```

### 2. `sailor:query`

Runs arbitrary GraphQL queries through Sailor’s hosted subgraph proxy.

Options:

- `--query "<graphql>"` – inline query string
- `--file path/to/query.gql` – load from file
- `--variables '{"poolId":"..."}'` – JSON-encoded variables

Example:

```sh
npm run liquidity -- sailor:query --query '{ pools(first: 5, orderBy: totalValueLockedUSD, orderDirection: desc) { id feeTier totalValueLockedUSD volumeUSD token0 { symbol } token1 { symbol } } }'
```

### 3. `dex:pools`

Enumerates historical pool deployments by reading `PoolCreated` events from a factory contract.

Options:

- `--factory <address>` – defaults to DragonSwap V2 factory
- `--from <block>` / `--to <block|latest>` – inclusive block range

Example (DragonSwap + Sailor):

```sh
# DragonSwap
npm run liquidity -- dex:pools --from 0 --to latest

# Sailor
npm run liquidity -- dex:pools --factory 0xA51136931fdd3875902618bF6B3abe38Ab2D703b --from 0 --to latest
```

Output includes creator wallet, tokens, fee tier, and pool address per deployment.

### 4. `clmm:positions`

Retrieves concentrated liquidity NFT events (`Transfer`, `IncreaseLiquidity`, `DecreaseLiquidity`, `Collect`) affecting a wallet.

Options:

- `--wallet <address>` (required)
- `--npm <address>` / `--position-manager <address>` – override default position manager
- `--from <block>` / `--to <block|latest>` – block range

Example:

```sh
npm run liquidity -- clmm:positions --wallet 0xabc123... --from 18000000 --to latest
```

## Automating ingestion

1. Schedule the CLI via cron/CI to export JSON to S3/Blob/FS.
2. Load snapshots and log-derived events into your warehouse (Postgres, BigQuery, DuckDB, etc.).
3. Build dashboards/notebooks that combine Sailor’s hosted totals with on-chain truth from DragonSwap and Sailor factories.

Tip: when backfilling large ranges, prefer archive RPC providers and reduce `LOG_CHUNK_SIZE` if requests time out.

## Sample subgraph queries

```graphql
# Latest 20 swaps on Sailor
{
  swaps(first: 20, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    amount0
    amount1
    sqrtPriceX96
    pool {
      id
      token0 { symbol }
      token1 { symbol }
    }
  }
}

# Pools with historical TVL snapshots
{
  poolDayDatas(first: 30, orderBy: date, orderDirection: desc, where: { pool: "0xPOOLADDRESS" }) {
    date
    liquidity
    tvlUSD: totalValueLockedUSD
    volumeUSD
    feesUSD
  }
}
```

Save moving parts (e.g., GraphQL queries) in version control to keep pipelines reproducible.
