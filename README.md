`trading-platform.ts` contains a vulnerability that allows for double spending attack.

The issue is, that balance is checked in `near_withdraw`, not in `withraw_callback`. If the attacker is able to make multiple `near_withdraw` calls in parallel, they can withdraw more than they deposited.

Attack is implemented in `attack.ts` contract.

To run the attack:

```
npm install
npm test
```
