# Case Study — AI-Ethics-Education-Framework

**Repository:** [AI-Ethics-Education-Framework](https://github.com/Freddricklogan/AI-Ethics-Education-Framework) · **Live demo:** [freddricklogan.github.io/AI-Ethics-Education-Framework](https://freddricklogan.github.io/AI-Ethics-Education-Framework/) · **Author:** Freddrick Logan

---

## 1. Who has this problem

Anyone who has to say yes or no to an AI tool that will touch students: a district technology director asked to approve an early-warning system, a campus governance committee reviewing an automated feedback product, a privacy officer handed a vendor's data sheet and a deadline. They need principles they can cite, a bias-assessment method, a deployment lifecycle and, at the moment of decision, an impact assessment that ends in a recommendation they can defend.

## 2. The problem, as a scenario

A committee opens the impact-assessment template. Section 5.2 asks for six risks, each with a likelihood and an impact rated High, Medium or Low, and a mitigation. Section 7 offers five recommendations: Approve, Approve with conditions, Pilot required, Deny, Defer. The members rate privacy breach as High likelihood and High impact and write nothing under mitigation, because the vendor has not answered the data-residency question yet. Then they reach Section 7. Nothing on the page connects what they just wrote to the box they are about to tick. Two members argue for "Approve with conditions", one for "Defer"; the chair ticks "Pilot required" as a compromise, and the unmitigated High-High risk enters the record as a footnote.

## 3. What it costs to leave it alone

A template that asks for ratings and then asks for a decision without a rule between them produces decisions that look considered and are not. The cost is inconsistency across tools — the same risk profile gets a pilot in March and an approval in October — and a record that cannot explain itself when a parent, a board or a regulator asks why. The lesser cost is that five long documents readable only as raw Markdown on GitHub could not be handed to a committee and expected to be read.

## 4. The approach, and the alternative I rejected

The tempting fix was to write the missing rule into the framework and present it as if it had always been there. I rejected that. The framework does not state how likelihood and impact combine, and pretending otherwise would put words in a document people may already have adopted. Instead the worksheet keeps the framework's text and its own conventions visibly separate: the six risks, the H/M/L scales, the fourteen vendor red flags and the five recommendations are transcribed; the 3×3 rating matrix and the five-rung recommendation ladder are labelled as the worksheet's convention, printed on the page above the form, and pinned by tests so that changing them is a deliberate act.

I also rejected an application with saved assessments: a committee wants a record in its own minutes, not another system of record. The worksheet exports Markdown; nothing leaves the browser.

## 5. What the code does today

`docs/assets/lib/risk.js` holds the six risks from template §5.2, the fourteen red flags from the deployment guidelines §1.2 (nine technical, five pedagogical) and the five §7 recommendations. `rate()` maps a likelihood and an impact to Low, Medium, High or Critical on the 3×3 matrix. `assess()` validates the entries, rates each risk, counts the red flags, and walks the ladder: any unrated risk gives Defer; a Critical risk with no written mitigation gives Deny; a Critical risk with a mitigation, or a High risk without one, gives Pilot required; a High risk with a mitigation, or any red flag, gives Approve with conditions; otherwise Approve. Every recommendation other than Approve comes with its reasons. `toMarkdown()` writes the recommendation, the reasons, the six-row risk table and the flagged items.

`docs/assets/risk-page.js` builds the form — twelve selects, six mitigation fields, fourteen checkboxes — re-assesses on every keystroke, and offers a copy button. `docs/assets/site.js` mounts the Executive Shell on every page. CI lints, tests with coverage, builds with `mkdocs build --strict`, runs npm audit and Trivy, and deploys to GitHub Pages.

## 6. Evidence

Seven Vitest tests pass and cover 100 percent of statements in the module. They pin the scenario above: a High-High risk with an empty mitigation is a Deny, with a whitespace-only mitigation still a Deny, with a real mitigation a Pilot; a single unrated risk gives Defer regardless of everything else; a Medium-Medium profile approves on its own and a single red flag turns it into Approve with conditions with the flag named in the reasons. `mkdocs build --strict` completes without warnings. A headless-Chrome smoke of the built site found the shell, 12 selects and 14 checkboxes, watched the recommendation move Defer → Approve → Deny → Pilot required → Approve with conditions as I entered ratings, a mitigation and a red flag, logged no console messages, and showed no horizontal overflow at 1280 or 400 pixels.

## 7. What it would take to run this in production

It runs as a static site now. Adoption is a governance act: the committee reads the matrix and the ladder, ratifies or changes them, and a change is a two-file edit the tests will notice. If an institution wants multi-rater aggregation or an archive of assessments, the module is the piece to keep and a form backend is the piece to add.

## 8. Limits and next steps

The worksheet covers §5.2 and the vendor red flags; the template's data, equity, accessibility and governance sections still have to be filled in by hand. The ladder is one convention, not the only one, and the page says so. The site sets no Content-Security-Policy because Material for MkDocs relies on inline scripts. The next step is the bias-assessment framework's metric tables, which could become a calculator the same way.

## 9. Who should look at this

Governance committees and technology leaders who need an AI approval process that explains itself, and anyone judging whether I can add structure to a policy document without misrepresenting it.
