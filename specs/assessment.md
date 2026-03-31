# Principal Engineer Assessment: AI-Native Portfolio Companion

# 8FIGURES | Principal Software Engineer & Agent Orchestrator (Frontend Specialization)

---

### The Philosophy

**This is not a coding test.**

At 8FIGURES, our engineers don't write most code by hand. They architect systems, create development pipelines, and orchestrate AI agents to implement features end-to-end. They then review every line of output, because AI is powerful but imperfect — and engineering judgment is the difference between shipping something great and shipping something broken.

This assessment has **two equal deliverables**:

1. **A working application** — demonstrates your frontend architecture, mobile development, and product sensibility
2. **Your AI development pipeline** — demonstrates how you think, plan, decompose problems, and orchestrate AI agents

Both carry **equal weight** in our evaluation. We care as much about HOW you built it as WHAT you built.

**Time Expectation:** 2-3 days. A principal engineer with a well-crafted AI pipeline should produce both deliverables in this timeframe. If your pipeline is good, the code writes itself — and that's exactly what we want to see.

**AI Tooling:** We recommend [Claude Code](https://docs.anthropic.com/en/docs/build-with-claude/claude-code/overview) since it's our primary development tool, but we accept any AI development environment (Cursor, Copilot Workspace, Codex, etc.). What matters is not which tool you use, but what you build with it.

---

### The Challenge

Build a mobile-first AI portfolio companion app using **Angular 20+, Capacitor, and Ionic** that demonstrates your ability to architect financial interfaces, integrate AI capabilities, and — critically — orchestrate AI agents to do the building.

Users should be able to:

1. View their investment portfolio with key financial metrics
2. Chat with an AI assistant about their holdings and investment questions (with streaming responses)
3. Receive contextual AI insights about their portfolio

---

### Deliverable 1: The Application (50%)

#### A. Portfolio Dashboard

Build a portfolio overview screen that displays:

- **Total portfolio value** with daily change ($ and %)
- **Holdings list** showing each position with: asset name/ticker, quantity, current value, gain/loss
- Financial data presented with appropriate precision, formatting, and visual hierarchy

**Data source:** Design your own data model and mock data. This is an architectural decision — we're evaluating your data modeling choices, not your ability to copy-paste a JSON blob.

#### B. AI Chat Interface

Implement a conversational AI interface where users can ask questions about their portfolio and receive contextual responses that reference their actual holdings.

**AI Implementation — choose one:**

1. **Mock Implementation:** Create a service interface with a mock implementation that returns realistic contextual responses. This demonstrates your architecture without requiring API keys.
2. **Real Implementation:** Integrate with OpenAI, Anthropic, or another provider. Include clear documentation for configuration.

Either approach is acceptable. **Streaming responses are required** — character-by-character or chunk-by-chunk display for a polished chat experience. This is table-stakes for a principal engineer.

#### C. Mobile Deployment

- Run on **at least one platform** (iOS or Android)
- Demonstrate proper Capacitor build and deployment
- Include clear documentation for running locally and on a device/simulator

#### D. Lightweight API Layer

Include a simple backend service (Node/Express, FastAPI, or similar) that:

- Serves portfolio data
- Proxies AI requests (if using a real provider)

This doesn't need to be sophisticated — a few endpoints are sufficient. We want to see that you think full-stack, even with a frontend specialization.

#### E. Beyond the Core

We've intentionally left room for you to make product decisions. What additional features you choose to build — or skip — tells us as much as how you build them. There is no checklist of bonus features. Prioritize like an owner.

---

### Deliverable 2: The Pipeline (50%)

This is what separates a principal engineer from a senior developer. We want to see the **system you built to build the application**.

#### A. Pipeline Configuration (in your repo)

Include your complete AI development setup in the repository. If using Claude Code, this means your `.claude/` directory with:

- **Project configuration** ([CLAUDE.md](http://CLAUDE.md) or equivalent) — How did you onboard AI to this project? What architectural decisions, conventions, constraints, and patterns did you encode?
- **Skills, rules, or workflows** — Any reusable automation artifacts you created. Examples: component generation patterns, code review checklists, testing workflows, build verification.
- **Architecture documentation** — How you decomposed the problem before building. Not just a README — a document showing alternatives you considered and decisions you made.

If using Cursor, Codex, or another tool, include the equivalent configuration files (`.cursor/rules/`, `agents.md`, [AGENTS.md](http://AGENTS.md), etc.).

**What we're looking for:** Evidence that you TAUGHT the AI how to work on this project, not just USED it to write code. Your pipeline should encode your engineering judgment in a way that makes AI agents effective.

#### B. Narrated Walkthrough (Loom video, 5-10 minutes)

Record a video covering three areas:

1. **Pipeline walkthrough** — Walk through your AI development setup. Show your project config, skills, and workflows. Explain: How did you structure AI assistance? What conventions did you encode? How does this differ from just "chatting with an AI"?
2. **Development process** — How did you decompose the problem? What did you delegate to AI vs. do yourself? Show a real example of reviewing AI output — what did you catch and change? How did you think about the architecture before writing code?
3. **Application demo** — Demo the running application on a device/simulator. Walk through the key features and your design decisions. What would you improve with more time?

---

### Technical Specifications

#### Required Stack

- **Angular 20+** (latest stable)
- **Capacitor 6+**
- **Ionic Framework** (recommended for mobile UI components)
- **TypeScript** (strict mode preferred)

#### Architecture Expectations

- Clean separation of concerns (services, components, models)
- Dependency injection patterns
- Reactive patterns where appropriate (Signals, RxJS)
- Type-safe implementations
- Mobile-first responsive design

---

### Evaluation Criteria

| Area                        | Weight | What We're Evaluating                                                                                                              |
| --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| AI Pipeline & Orchestration | 25%    | Quality of project config, skills/workflows created, evidence of multi-step orchestration, pipeline sophistication and reusability |
| Architectural Thinking      | 25%    | Problem decomposition, alternatives considered, data model design, clean separation of concerns, TypeScript strictness             |
| User Experience & Design    | 20%    | Mobile-appropriate patterns, financial data presentation, intuitive navigation, Ionic usage, attention to detail                   |
| Development Process         | 15%    | Loom video: chain of thought, delegation vs. review, evidence of AI output improvement, git history                                |
| Technical Execution         | 15%    | Working Capacitor deployment, AI chat quality, streaming implementation, code quality                                              |

#### Pipeline Maturity Scale

We use this scale to evaluate your AI development pipeline:

| Level                 | What It Looks Like                                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Level 1: User         | Used AI as autocomplete. No configuration files. No evidence of structured workflow.                                                                                  |
| Level 2: Prompter     | Basic project context file. Manual prompting for each task. No reusable artifacts.                                                                                    |
| Level 3: Builder      | Well-structured project config. Created 1-2 custom skills or rules. Some evidence of problem decomposition.                                                           |
| Level 4: Orchestrator | Comprehensive pipeline with skills, review workflows, and testing automation. Clear evidence of multi-agent thinking. Architecture docs show alternatives considered. |
| Level 5: Architect    | Pipeline that could onboard another engineer to the project. Reusable patterns across projects. Evidence of pipeline iteration and improvement.                       |

**We're hiring for Level 4-5.** If your pipeline is at Level 1-2, this role likely isn't the right fit — and that's okay. We'd rather you know that upfront.

---

### Submission

1. **GitHub repository** (public or private with access granted) containing:
   - Complete application source code
   - AI pipeline configuration (`.claude/`, `.cursor/`, or equivalent)
   - Architecture documentation
   - README with setup, build, and deployment instructions
2. **Loom video** (5-10 minutes) covering:
   - Pipeline walkthrough
   - Development process and decision-making
   - Application demo on device/simulator
3. Email both links to [roman@8figures.com](mailto:roman@8figures.com)

---

### Notes

**On Your Pipeline:** We're not looking for a specific tool or format. Claude Code skills, Cursor rules, custom scripts — use whatever you're best at. What matters: Can you create reusable development artifacts that make AI agents effective? Can you teach an AI your architectural standards? Can you show us HOW you think, not just WHAT you built?

**On Scope:** We intentionally left room for product decisions. What you choose to build, skip, and prioritize tells us as much as how you build it. Document your trade-offs.

**On the Loom Video:** This is where you differentiate yourself. Walking us through your THINKING is more valuable than showing polished code. Show us: How did you decompose the problem? What did AI get wrong and how did you catch it? How does your pipeline compare to just "chatting with an AI"?

**On Time:** 2-3 days. If you need to cut scope, cut app features — not pipeline quality. We'd rather see a simpler app with an exceptional pipeline than a feature-rich app built with no discernible process.

**Questions?** Reach out to [vv@vami.info](mailto:vv@vami.info)

---

### Why This Assessment?

At 8FIGURES, you'll build exactly this kind of experience: mobile-first financial interfaces with AI-powered features. But more importantly, you'll build the **pipelines that build the features**. Our engineers run 5-10+ concurrent AI sessions, orchestrate multi-phase development workflows with scouts, architects, and specialized reviewers, and review every line of AI output.

This assessment lets us see both: can you build great software, and can you build the system that builds great software?
