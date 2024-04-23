import { NearBindgen, call, NearPromise, near } from 'near-sdk-js';

@NearBindgen({})
class StakingPool {
  @call({ payableFunction: true })
  deposit() {}

  @call({})
  withdraw({ amount }: { amount: string }) {
    const amountInt = BigInt(amount);
    return NearPromise.new(near.predecessorAccountId()).transfer(amountInt);
  }
}
