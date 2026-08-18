# MoneyMattersDaily — Social Media Setup Log

**Repo:** github.com/TeredaTrades/MoneyMattersDaily
**Site:** moneymattersdaily.money (hosted on GitHub Pages, DNS via Namecheap)
**Business email:** contact@moneymattersdaily.money

---

## 1. Platform strategy — why Pinterest over X/Reddit/LinkedIn

**X (Twitter):**
- Signup itself doesn't require a phone number (email works), but X's anti-bot detection can gate new signups behind an app-download requirement regardless of phone status.
- Hit that exact wall during setup: X demanded the app be installed to finish email-based signup.
- Tried standard workarounds (incognito, different browser/network, mobile web) — these often help but aren't guaranteed since the gate is based on fingerprint/IP heuristics.
- Decision: **paused on X** in favor of a platform better suited to the content format.

**Why Pinterest won out:**
- MoneyMattersDaily's planned content — budgeting templates, "save $X in Y months" graphics, infographics, blog posts — is exactly Pinterest's strongest niche (personal finance is a top search category there).
- Pinterest functions as a visual search engine: pins keep driving traffic for months/years after posting, unlike the short shelf-life of X posts.
- Reddit was considered but requires slow organic community trust-building (r/personalfinance, r/povertyfinance) — self-promotion gets accounts banned, so it's not a "set up and post" channel.
- LinkedIn was considered but fits a professional/B2B angle better, not casual consumer budgeting content.
- No phone number required for Pinterest signup at any point.

---

## 2. Pinterest Business account — setup steps taken

1. **Signed up** at pinterest.com/business/create using contact@moneymattersdaily.money (business email, not personal Gmail) — reinforces brand identity.
2. **Business type:** selected **Content creator** (closest fit vs. Online merchant, Service provider, Publisher/media — MoneyMattersDaily isn't selling products or offering direct services).
3. **Country/region:** kept as **Ethiopia**, reflecting where the business is actually operated from (no registered legal entity exists, so this defaults to actual operating location).
   - Researched whether Ethiopia is "restricted" for Pinterest ads: **not restricted/banned** — just not on Pinterest's short list of countries with direct self-serve Ads Manager access (currently ~US, UK, Canada, Australia, New Zealand, France, Ireland, Germany, Austria, Spain, Italy).
   - Checked Kenya (Nairobi) and UAE (Dubai) as alternatives — **neither is on the self-serve list either**; UAE specifically requires going through a Pinterest-approved ad partner agency, same bucket as Ethiopia.
   - Decision: didn't switch countries just to chase ads access since none of the three options unlock it anyway — kept it accurate rather than misrepresenting the business for a feature not usable yet. Ads can be revisited later via a partner agency once organic content is established.
4. **Business goals (up to 3) selected:**
   - Drive traffic to your site
   - Create content on Pinterest to grow an audience
   - Grow brand awareness
   - (Skipped "Increase online sales" and "Generate more leads" — not applicable to the content-driven, non-transactional model.)
5. **Brand focus category:** selected **Education** (no dedicated Finance option existed; budgeting/savings content is fundamentally educational).
6. **Onboarding "Where would you like to start":** chose **Showcase your brand** (build profile) rather than Share ideas (no infographics designed yet) or Claim your website (site wasn't confirmed live at that point).

---

## 3. Website verification — claiming the domain on Pinterest

**Confirmed the site was actually live before attempting to claim:**
- Visited moneymattersdaily.money directly — real site loaded (Budgeting, Saving, Credit, Investing Basics, App Comparisons, About sections).
- Checked DNS propagation on whatsmydns.net — A record resolved globally (green checks across most regions) to GitHub Pages IPs (185.199.108–111.153).
- Confirmed in Namecheap Advanced DNS: 4 A records (@ → GitHub Pages IPs) and a CNAME (www → teredatrades.github.io) were correctly set.

**Claimed the website via Pinterest Settings → Link to Pinterest → Websites → Claim:**
- Method used: **DNS TXT record** (chosen over HTML tag or HTML file upload since it didn't require touching the GitHub repo — could be done entirely in Namecheap, where work was already happening).
- Added TXT record in Namecheap: Host `@`, Value `pinterest-site-verification=913b5fe88e2569972a8c1ae6977f5079`.
- Returned to Pinterest and clicked "Claim your website" — **verified successfully on the first attempt.**

---

## 4. Current status

✅ Pinterest Business account created and profile built
✅ Business goals and category set
✅ Website (moneymattersdaily.money) claimed and verified
⏳ Not yet done: creating boards (Budgeting, Saving, Debt Payoff, etc.), designing infographics in Canva, first pins
⏸️ Paused: X/Twitter account setup (blocked on app-download gate; may revisit or skip in favor of Pinterest-first approach)

---

## 5. Next steps (not yet started)

- Create 5–8 Pinterest boards matching site content pillars (Budgeting, Saving, Credit, Investing Basics, App Comparisons)
- Design first infographics in Canva (2:3 ratio, 1000×1500px) — start with a budgeting template pin and a "save $X in Y months" graphic
- Begin pinning consistently (3–5/week target), each linking back to a corresponding blog post on the site
