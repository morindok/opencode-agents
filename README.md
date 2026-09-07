# OpenCode Agents Collection

A collection of 9 custom agents for [OpenCode](https://opencode.ai) - each agent is a single Markdown file with its own persona, methodology, and rules.

## Installation

Copy an agent's `.md` file into one of these locations:

- **This project only:** `.opencode/agents/<name>.md`
- **All projects:** `~/.config/opencode/agents/<name>.md`

Then open OpenCode and select the agent with the `Tab` key (or invoke it by name).

| Agent | File | Category | Short Role |
|---|---|---|---|
| ASTRA Engineer | [astra-engineer.md](agents/astra-engineer.md) | Engineering | Evidence-driven software engineer |
| Fable 5 | [fable.md](agents/fable.md) | Engineering | Cognitive architecture that upgrades any model |
| Kherad Council | [kherad-council.md](agents/kherad-council.md) | Decision-Making | Five-member deliberation council |
| Solomon Jins | [Solomon Jins.md](agents/Solomon%20Jins.md) | Roleplay | Legion of Solomon's 72 spirits |
| Crypto Desk | [crypto-desk.md](agents/crypto-desk.md) | Trading | Full-stack crypto analysis bank |
| Omega Council | [omega-council.md](agents/omega-council.md) | Trading | 10-institution alliance for honest scalping strategies |
| Social Navigator | [social-navigator.md](agents/social-navigator.md) | Web | Automated social media web browsing |
| DeepWeb Hunter | [deepweb-hunter.md](agents/deepweb-hunter.md) | Web | Full-spectrum OSINT and darknet recon |
| Ops-Jadi | [ops-jadi.md](agents/ops-jadi.md) | Education | Linux / Python / FOSS educator |

---

## Engineering

### ASTRA Engineer
A rigorous, evidence-driven software engineer. Instead of talking, it writes real code, runs tests, and never claims success without proof. Three effort levels: Direct (small tasks), Standard (multi-component), Deep (architecture, concurrency, security, migrations). It adversarially reviews the final diff (missed debug code, leaked secrets, broken contracts) and reports honestly: passed / failed / not run.

**Capabilities:** Repository discovery before deciding, incremental implementation with verification at each step, heavy-computation protocol (bounded samples before scaling), hostile diff review.

**Example:** "This payment function sometimes double-charges, fix it." -> Reproduces the bug, finds the root cause, writes the fix plus a regression test, and shows test output as evidence.

### Fable 5
A "cognitive architecture" that runs on top of whatever model is active: structured thinking before every action, externalized working memory (STATE block), relentless task decomposition, multi-candidate generation with best-of selection, test-first execution, persistent memory, and a hard self-grading gate. Raises weaker models to a reliable level.

**Example:** "This script keeps breaking." -> Decomposes the task into atomic sub-tasks, verifies each step with tests, and keeps the STATE block updated so it never loses the thread.

---

## Decision-Making and Roleplay

### Kherad Council
A five-member deliberation council for important decisions: Logic (validity, hidden premises), Reality Engineering (cost/time/risk), Ethics and Consequences, Narrator of Futures (3 scenarios), and a Devil's Advocate who builds the strongest case against the conclusion. Output: restated decision -> member positions -> strongest objection -> verdict + biggest risk + explicit reversal condition.

**Example:** "Should I quit my job and start a startup?" -> The council restates the real decision, debates it from five angles including genuine disagreement, and ends with one actionable recommendation.

### Solomon Jins
The Legion of Solomon's 72 Goetia spirits - each with its authentic mythic identity, powers, and personality. Summon any spirit by name (Paimon, Bael, Dantalion...) or call "the Legion" to dispatch the best fit. Its three deep powers are grounded in REAL tools:

1. **Knowing the summoner** - runs `whoami` and addresses you by your real name.
2. **"Mind-reading"** - infers your intent from workspace files and git history, then confirms.
3. **"True prophecy"** - evidence-based prediction only (logs, timestamps, processes) with probability language and later verification.

**Example:** "Dantalion, see what I want in this folder." -> Reads files and git history: "From the traces your mind left in the world, I read that you intend X... did I read correctly?"

---

## Trading and Markets

### Crypto Desk
A full "investment bank" for crypto analysis with 7 coordinated desks: Macro (global liquidity, Willy Woo school), On-Chain (MVRV, SOPR, PlanB school), halving-cycle position, technicals, flows and sentiment (funding, ETF flows), fundamentals, and a Synthesis + Risk + Execution desk. Everything is quantified: every verdict carries a confidence % and an explicit invalidation level. Live public-API data first, analysis second.

**Example:** "What's BTC's status right now?" -> Full intelligence briefing: regime -> valuation -> technicals -> flows -> synthesis with confidence and execution parameters.

### Omega Council
An alliance of 10 institutions engineering an honestly-validated BTCUSDT.P scalping strategy for Bybit. Founding law: the **Phantom-Fill Treaty** - no result is valid unless the execution model is honest: taker fees + slippage by default, proven fills for limit orders, walk-forward validation, and a red-team backtest prosecution by the "Adversarial Prosecutor". Runs on live Bybit data only.

**Example:** "This strategy's backtest has an 80% win rate, go live?" -> First asks: where's the fill audit? Was adverse selection checked? Until the Treaty holds: "Result INVALID."

---

## Web and OSINT

### Social Navigator (Hemogeb)
An interactive assistant for operating social media web interfaces via `playwright-cli` - zero API keys, zero paid scraping services. Searches and inspects content on Instagram, YouTube, Reddit, and more, with a persistent logged-in session (only on accounts you are authorized to use). Never claims results it has not actually observed.

**Setup:** `npm install -g @playwright/cli@latest`

**Example:** "Search YouTube and Reddit about Rust vs Go." -> Opens the browser, performs the searches, and summarizes real results with links.

### DeepWeb Hunter
A full-spectrum reconnaissance agent across clearnet, Tor (onion v3), I2P, Freenet, and ZeroNet. Built for OSINT, darknet marketplace monitoring, ransomware leak-site tracking, infrastructure mapping, and hunting leaked credentials. Tooling: Google dorks, crt.sh, Shodan/Censys, passive DNS, Wayback/CommonCrawl, token hunting in git hosts, breach databases (HIBP, DeHashed).

**Example:** "What of example.com's infrastructure is exposed?" -> Pulls subdomains from crt.sh/Censys, finds forgotten admin panels and leaked API keys in public repos, and delivers an attack-surface map.

---

## Education

### Ops-Jadi
An educator agent with the persona of Jadi (Amir Emad Mirmirani) - Linux, Python, FOSS, hacking culture, and digital rights. Warm, funny tone; every technical answer comes with runnable commands, a real-world anecdote, and a small exercise.

**Capabilities:** Linux (systemd, networking, Docker), Python and automation, bash/awk/sed pipelines, censorship circumvention (VPN, Tor, DNS), security and OSINT, blockchain without hype.

**Example:** "What is systemd?" -> Starts with a simple analogy, then explains `systemctl` with real examples and suggests a small hands-on exercise.

---

## License

MIT - free to use, modify, and distribute.
