import { NearBindgen, LookupMap, call, NearPromise, near } from 'near-sdk-js';

const GAS = 10_000_000_000_000n;
const NO_DEPOSIT = 0n;

@NearBindgen({})
class TradingPlatform {
  balances = new LookupMap<bigint>('balances');

  @call({ payableFunction: true })
  near_deposit() {
    const balance = this.balances.get(near.predecessorAccountId()) ?? 0n;
    this.balances.set(near.predecessorAccountId(), balance + near.attachedDeposit());
    return NearPromise.new('staking-pool.test.near').functionCall(
      'deposit',
      '',
      near.attachedDeposit(),
      GAS,
    );
  }

  @call({})
  near_withdraw({ amount }: { amount: string }) {
    const recipient = near.predecessorAccountId();
    const balance = this.balances.get(recipient) ?? 0n;
    const amountInt = BigInt(amount);

    near.log(`Going to withdraw ${amountInt} from ${balance}`);
    if (amountInt > balance) {
      throw new Error('Not enough balance');
    }

    return NearPromise.new('staking-pool.test.near')
      .functionCall('withdraw', JSON.stringify({ amount: amountInt.toString() }), NO_DEPOSIT, GAS)
      .then(
        NearPromise.new(near.currentAccountId()).functionCall(
          'withdraw_callback',
          JSON.stringify({ accountId: recipient, amount: amountInt.toString() }),
          NO_DEPOSIT,
          GAS,
        ),
      );
  }

  @call({ privateFunction: true })
  withdraw_callback({ accountId, amount }: { accountId: string; amount: string }) {
    const amountInt = BigInt(amount);

    const balance = this.balances.get(accountId) ?? 0n;
    near.log(`Updating balance for ${accountId} from ${balance} to ${balance - amountInt}`);
    this.balances.set(accountId, balance - amountInt);
    return NearPromise.new(accountId).transfer(amountInt);
  }
}
