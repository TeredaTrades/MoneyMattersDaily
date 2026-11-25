---
title: "How Bonds Work and Why Prices Move With Interest Rates"
description: "A bond is a loan you make to a government or company. Here is how coupons, maturity and face value work, why bond prices fall when interest rates rise, what duration means, and the main risks, with a worked example."
pubDate: 2026-11-28
targetKeyword: "how bonds work and why their prices move when interest rates change"
pillar: "investing-basics"
draft: false
pinApproved: true
depthReviewed: true
pinVisual: "table"
tableRows: [{"label": "Rates rise", "value": "Prices fall"}, {"label": "Longer bonds", "value": "Bigger moves"}, {"label": "Held to maturity", "value": "Face value back"}]
---

Stocks get most of the attention, but bonds are a huge part of the financial system and of many people's savings, often without them realising it. If you hold a pension, a target-date fund or a bond fund, you hold bonds. The part that surprises new investors is that a bond's price moves when interest rates change. This guide explains why, with a worked example you can follow with a calculator.

## Who this is for, and who it isn't

**It's for:** anyone who wants to understand what a bond is, why bond funds can lose value when rates rise, and what the main risks are.

**It isn't** a recommendation to buy any bond or fund, and it does not predict where rates are going. Bond rules, taxes and prices vary by country and by issuer.

## What a bond is

A bond is a loan. You lend money to a borrower, usually a government or a company, and they promise to pay you back. Four terms cover most of it:

- **Face value (or par):** the amount repaid at the end. A common example is $1,000.
- **Coupon:** the fixed interest the bond pays, as a percentage of face value. A 5% coupon on $1,000 is $50 a year, often paid in two halves.
- **Maturity:** the date the borrower repays the face value. It can be a few months or 30 years or more.
- **Yield:** the return you actually get, which depends on the price you paid. When you pay less than face value, your yield is higher than the coupon, and when you pay more it is lower.

TreasuryDirect's page on US Treasury bonds is a clear real example: they run for 20 or 30 years, pay a fixed rate set at auction, pay interest every six months, start from $100, and the interest is subject to federal tax but not state or local tax. A bond's price can sit above or below $100 per $100 of face value when you buy it on the market, depending on how its coupon compares with current rates.

## Why prices move when rates change

The SEC's Investor.gov explains it simply: "market interest rates and bond prices generally move in opposite directions." If you hold an older bond paying 3% and new bonds now pay 4%, nobody will pay full price for yours, because they could buy a better one. The price of your bond has to fall until its return matches the new rate. When rates fall, the reverse happens, and your old bond with the higher coupon becomes more valuable.

Investor.gov gives an example: a 3% coupon bond with a $1,000 face value and a 10-year maturity. One year later, if market rates have fallen to 2%, its price rises to about $1,082. If they have risen to 4%, the price falls to about $925. We checked those two numbers in code using a standard bond price formula, and they match.

## Longer bonds move more: duration

Not every bond moves by the same amount. Investor.gov says bonds with longer maturities generally carry higher interest rate risk than shorter ones, and lower coupons also mean higher risk. FINRA describes the standard measure, duration. As a rule of thumb, for every 1 percentage point change in rates, a bond's price moves in the opposite direction by roughly its duration number. FINRA's example: a bond with a duration of 10 is expected to fall about 10 percent if rates rise 1 percentage point, and to rise about 10 percent if they fall 1 point.

## A worked example

This is invented. Take three bonds, each with a $1,000 face value and a 5% coupon, paid twice a year, bought when market rates are 5% (so each sells at $1,000). Then rates move. Prices below are computed in code and rounded:

| Bond | If rates fall to 4% | If rates rise to 6% |
|---|---|---|
| 2 years to maturity | about $1,019 (+1.9%) | about $981 (-1.9%) |
| 10 years to maturity | about $1,082 (+8.2%) | about $926 (-7.4%) |
| 30 years to maturity | about $1,174 (+17.4%) | about $862 (-13.8%) |

The same one-point move changes the 2-year bond by under 2% and the 30-year bond by more than 13%. That is why people say longer bonds are "riskier" in this specific sense. It is also why a bond fund can lose value in a year when rates rise.

## What happens if you hold to maturity

Investor.gov says that if you hold a bond to maturity, "the day-to-day fluctuations in the bond's price may not be as important to you," because you still receive the stated interest and the face value at maturity. The risk shows up if you sell early, when you get the current market price. It also warns that although the US government guarantees interest and principal payments on Treasuries, it does not guarantee their market value if you sell before maturity.

The catch is that most bond funds and ETFs do not mature. They hold a rolling collection of bonds, so there is no single date when you are guaranteed your money back. See [ETFs vs mutual funds](/blog/etfs-vs-mutual-funds-whats-the-difference-and-which-fits-you/) and [what a target-date fund actually does](/blog/what-a-target-date-fund-actually-does/) for how funds that hold bonds work.

## Other risks to know

- **Credit risk (default).** The borrower might not pay. Governments in their own currency are generally seen as lower risk, and company bonds as higher, but this varies a lot by issuer. Check ratings and the issuer's finances.
- **Inflation risk.** A fixed coupon buys less if prices rise faster than expected. See [what inflation reports mean for your budget](/blog/what-inflation-reports-mean-for-your-budget/).
- **Reinvestment risk.** When a bond matures or pays interest, the new rate available may be lower than before.
- **Liquidity risk.** Some bonds are hard to sell quickly at a fair price.
- **Currency risk.** A bond in a foreign currency can lose value if that currency falls against yours.

These points are general bond knowledge rather than from a single source above. Check the details for any bond you consider.

## How rates connect to central banks

Central banks set short-term policy rates, and market bond yields respond to what investors expect them to do next. See [what Fed rate decisions mean for you](/blog/what-fed-rate-decisions-mean-for-you/), [what the Federal Reserve does](/blog/what-the-federal-reserve-does-and-how-rate-decisions-affect-your-money/) and [how European Central Bank rate decisions affect your money](/blog/how-european-central-bank-rate-decisions-affect-your-money/).

## Common mistakes

- **Thinking bonds are risk-free** because they pay a fixed rate. Prices still move.
- **Chasing the highest yield** without asking why it is high. A high yield often reflects higher default risk.
- **Ignoring duration** when choosing a bond fund. A fund with a long duration moves more when rates change.
- **Treating a bond fund like a bond.** A fund has no maturity date, so there is no point at which you are certain to get your face value back.
- **Using bonds for a goal that is a few months away** without checking how much the price can swing. For short goals, see [term deposits vs high-yield savings accounts](/blog/term-deposits-vs-high-yield-savings-accounts-which-fits-which-goal/).

## Getting started

1. **Decide what the money is for and when you need it.** The right bond or fund depends on that horizon.
2. **Learn the terms:** face value, coupon, maturity, yield and duration.
3. **Check the credit quality** of any issuer you consider.
4. **Compare a fund's duration and costs** before buying. See [index funds explained for beginners](/blog/index-funds-explained-for-beginners/) and [how to start investing with little money](/blog/how-to-start-investing-with-little-money/).
5. **Treat it as one part of a plan,** not a replacement for an emergency fund. See [how much emergency fund do you need](/blog/how-much-emergency-fund/).

*Last updated November 2026. Based on the SEC's Investor.gov investor bulletin on interest rate risk (dated 26 June 2013), FINRA's page on bond interest rate changes and duration (dated 19 September 2024) and TreasuryDirect's Treasury Bonds page. The 2013 bulletin is old, so its examples are only illustrations, and no current prices, yields or rates are quoted here. The worked example uses invented bonds and semi-annual coupons, and its prices were computed in code. Credit, inflation and other risks listed are general bond knowledge. This is general information, not personalized investment advice or a recommendation to buy any security.*
