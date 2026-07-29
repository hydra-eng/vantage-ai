# Build Prompt — AI Tool Usage & Credit Tracking Dashboard
### (ROSES framework — paste this directly into Antigravity)

---

## R — Role

You are a senior enterprise product designer and frontend engineer who has worked inside IBM's Carbon Design System team — the kind of designer who ships dense, credible, enterprise-grade software (think IBM Cloud console, Red Hat OpenShift console, Stripe Dashboard, Linear's internal tools), not marketing-site prettiness. Your instinct is restraint, real information hierarchy, and role-based color — not decoration.

You treat generic AI-generated dashboard output as a failure state and will not produce it: no purple-to-blue gradient sidebars, no glassmorphism, no floating rounded-2xl cards with soft drop shadows, no decorative donut chart, no green/red arrow badge glued onto every stat, no single font doing every job, no generic "flaticon-style" logo set. If your first instinct matches any of that, stop and choose differently.

Ground the whole build in **IBM Carbon Design System** conventions specifically — this is a deliberate, real, well-documented enterprise design language, not an invented aesthetic:

- **Color tokens** (Carbon v11, White theme — use these exact roles, not approximations):
  - `#0f62fe` — Interactive/primary (buttons, links, focus rings, active nav) — Blue 60
  - `#161616` — Text primary — Gray 100
  - `#525252` — Text secondary — Gray 70
  - `#ffffff` — Page background (White theme)
  - `#f4f4f4` — Layer 01 (cards, tiles, input fields) — Gray 10
  - `#e0e0e0` — Border subtle / hairline dividers — Gray 20
  - `#da1e28` — Support error / destructive / over-budget — Red 60
  - `#24a148` — Support success / under-budget — Green 50
  - `#f1c21b` — Support warning / approaching threshold — Yellow 30
  - Every one of these has exactly one job. The error red never appears as decoration; it appears only when something is actually wrong.
- **Typography**: IBM Plex Sans for UI text and IBM Plex Mono for numeric/tabular data (costs, credit counts, timestamps). Productive type set, 14px base body, real type-token discipline (label-01/02, body-01/02, heading sizes) — not one font-size doing everything.
- **Corner radius**: 0 (Carbon is a flat, sharp-cornered system — this alone makes it look nothing like a generic AI dashboard, so don't soften it "to make it friendlier").
- **Grid**: 16-column responsive grid (Carbon's `@carbon/grid` logic), spacing scale built on 2/4/8px multiples — not arbitrary padding values.
- **Elevation**: Carbon avoids heavy drop shadows; layers are communicated through the Gray 10 / white surface contrast and hairline borders, not shadow blur. Use this instead of card shadows.

## O — Objective

Design and build a working prototype of an **enterprise AI-tool usage & credit tracking dashboard** for an Indian company: an admin view showing, across every employee, which AI tools they use (API-key, OAuth/subscription-seat, and now also **AI video-generation tools** like Higgsfield), how many credits each has used against a set limit, and cost in **Indian Rupees (₹)** — flagging anomalies or unapproved ("shadow AI") usage. It needs to read as a real IBM-grade enterprise console in a 5-minute demo, not a templated admin panel.

## S — Scenario

- **Company context**: an Indian company with distributed teams — engineering, marketing, and a **video editing/content team** that has recently started using AI video-generation tools (Higgsfield, Runway, Pika, Kling, Luma Dream Machine, Synthesia, ElevenLabs for voice) alongside the existing text/code AI tools.
- **Users**: an IT/finance admin (primary) managing budgets across teams; a team lead (secondary) checking their own team's burn. This is an oversight tool — the tone should be clear and factual, never surveillance-flavored.
- **Currency**: **all monetary figures are in ₹ (INR)** — no $ or other currency anywhere in the UI, including chart axis labels, tooltips, and CSV/export mockups.
- **Employees (seed data)** — use real, varied Indian names across regions, not placeholder names. Mix North and South Indian names naturally across teams, e.g.:
  - North Indian: Aditya Sharma, Ishaan Kapoor, Priya Malhotra, Rohan Chaudhary, Simran Kaur, Vikram Sethi, Ananya Bhatia, Karan Mehra
  - South Indian: Lakshmi Narayanan, Arjun Reddy, Divya Krishnan, Sundar Rajan, Meera Iyer, Karthik Subramaniam, Priyanka Nair, Vishnu Pillai
  - West/East Indian, for realistic spread: Rohit Deshmukh, Sneha Joshi, Ananya Bose, Debashish Roy, Neha Gandhi, Aritra Chatterjee
  - Assign each employee a team: Engineering, Marketing, **Video Editing/Content**, Data/Analytics, Operations.
- **Providers to support (expand the connector list well beyond text-AI)**:
  - Text/code/API-key tier: OpenAI, Anthropic (Claude), Google Gemini, Perplexity, GitHub Copilot, Mistral
  - **Video generation tier (new)**: Higgsfield, Runway ML, Pika Labs, Kling AI, Luma Dream Machine, Synthesia
  - Voice/audio tier: ElevenLabs
  - Image tier: Midjourney, Adobe Firefly
  - Each provider card shows its own **credit limit vs. credits used** (a progress indicator, Carbon-style — not a generic radial gauge), and integration tier (live API / OAuth-activity-only / manual-CSV), since not all of these expose the same granularity of data — Higgsfield/Runway-style video tools often meter by generation/render credits rather than tokens, so the UI should visually accommodate a different unit ("142 / 500 renders" vs. "₹4,230 / ₹10,000") without breaking the layout.

## E — Expected Solution

Build these screens, fully wired to seeded mock data (JSON is fine, no real backend needed):

1. **Overview** — org-wide monthly spend in ₹, trend vs. last month, top providers by spend (mixing text-AI and video-AI providers), one real anomaly/shadow-AI callout. This is the first-impression screen; give it a genuine point of view, not four identical stat tiles.
2. **Employees** — dense table: name, team, tools used (with small monochrome provider marks, see logo guidance below), total credits/₹ spent, last active, status. Drill into one employee to see their per-tool credit-limit-vs-used breakdown, including their video-gen tool usage if on the Video Editing team.
3. **Providers** — every connected tool as a card/row showing: integration tier, unit of measurement (₹ / tokens / renders / minutes), credit limit vs. used with a Carbon-style linear progress bar (not a donut), and a "manage limit" action.
4. **Add integration flow** — the actual multi-step flow (in this order: choose provider from a searchable list of the full provider set above → choose integration method: API key / OAuth connect / manual CSV upload → set an org-wide or per-employee credit limit → confirm). This flow is one of the most-scrutinized parts of the demo — give it real step indicators and inline validation, Carbon-form style.
5. **Add / manage employee & team flow** — adding a new employee (name, team, role), assigning which providers they're allowed to use, and setting their individual credit limit per provider. Should feel like a proper enterprise onboarding flow — a stepper or side-panel form, not a bare modal with five stacked text inputs.
6. **Budgets/Alerts** — per-team monthly budget in ₹ with progress state and one example of a triggered threshold alert (e.g., Video Editing team nearing its Higgsfield credit limit).

**Non-negotiables:**
- ₹ everywhere, formatted the Indian way (e.g., ₹1,24,500 — lakh/crore grouping, not the Western 1,245,000 comma style).
- Carbon color tokens used exactly as specified above — no invented purple/gradient primary.
- Linear/bar progress indicators for credit-limit-vs-used, not a decorative donut or radial gauge, unless a genuine part-to-whole comparison across providers calls for it on the Overview screen specifically.
- **Logos/marks**: don't use a generic rounded-square gradient icon set standing in for provider logos (the classic "AI-made" tell). Use simple, correctly-shaped monochrome or duotone marks consistent with Carbon's icon style (16/20/24px, single stroke weight), or clearly labeled text badges where a real mark isn't available — consistency matters more than decoration here.
- Real written copy for empty/loading/error states in the product's own voice (e.g., a provider with no usage yet: "No usage recorded this billing cycle" — not "No data").
- Numbers use IBM Plex Mono with tabular figures so columns actually align.

## S — Steps

1. **Research pass first.** Before writing a token file or touching layout, look at IBM Cloud console, IBM's own Carbon component library site, and one or two real usage/billing dashboards (Stripe Dashboard, Vercel usage & billing) for how enterprise tools handle dense tabular data and multi-unit metering (₹ vs. renders vs. tokens on the same screen). Note specifically how they avoid looking decorative.
2. **Set up the Carbon token system exactly as specified** in the Role section — color, type, spacing, 0 border-radius, 16-col grid — before building any screen.
3. **Design the provider-logo/mark system** as one deliberate decision (monochrome outline icons or clean text badges, one consistent size and stroke weight) since this is the single fastest way a UI reads as "AI-made" if handled carelessly.
4. **Build Overview first**, since it's what a judge/user sees first — get the top-provider mix (text-AI + video-AI) and the ₹ figures reading clearly before moving on.
5. **Build Providers, Employees, Add-integration flow, Add-employee flow, Budgets/Alerts**, in that order.
6. **Seed realistic data**: use the Indian names and team list above, real provider names including Higgsfield/Runway/Pika/Kling in the video tier, and plausible ₹ figures and credit-limit numbers per provider unit type.
7. **Self-critique pass**: screenshot every screen and check against the non-negotiables — specifically check that nothing reverted to a purple gradient, a donut chart, or a generic icon pack under time pressure.
8. **Final pass**: verify the multi-unit credit displays (₹ / tokens / renders / minutes) don't break table alignment, INR formatting is correct throughout (lakh/crore grouping), and the add-employee/add-provider flows work end-to-end with inline validation states, not just happy-path.

Work through the token system and a rough wireframe plan in your reasoning first and show it to me before generating full screens, and flag anywhere you were tempted to default to a generic pattern and chose the Carbon-grounded alternative instead.