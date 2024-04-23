import { Worker, NearAccount } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first'); // temp fix for node >v17

// Global context
const test = anyTest as TestFn<{ worker: Worker; accounts: Record<string, NearAccount> }>;

test.beforeEach(async t => {
  // Create sandbox, accounts, deploy contracts, etc.
  const worker = (t.context.worker = await Worker.init());

  // Deploy contract
  const root = worker.rootAccount;

  const stakingPool = await root.createSubAccount('staking-pool');
  await stakingPool.deploy('./build/staking_pool.wasm');

  const tradingPlatform = await root.createSubAccount('trading-platform');
  await tradingPlatform.deploy('./build/trading_platform.wasm');

  const attack = await root.createSubAccount('attack');
  await attack.deploy('./build/attack.wasm');

  t.context.accounts = { root, exchangeRateOracle: stakingPool, tradingPlatform, attack };
});

test.afterEach.always(async t => {
  await t.context.worker.tearDown().catch(error => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('works', async t => {
  const { attack } = t.context.accounts;

  console.debug('attacker initial balance', (await attack.balance()).available.toHuman());

  await attack.call('attack.test.near', 'attack', {}, { gas: BigInt(300_000_000_000_000) });

  console.debug('attacker final balance', (await attack.balance()).available.toHuman());
});
