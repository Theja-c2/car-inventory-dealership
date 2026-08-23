# PROMPTS.md

Raw, unedited log of the prompts used to build this project. This project was
built end-to-end in a single chat session with Claude (Anthropic), operating
as an agentic coding assistant with a sandboxed Linux environment (bash,
file read/write, and the ability to run tests/servers directly). Rather than
copy-pasting snippets between a chat window and an editor, the human directed
the AI conversationally and the AI wrote, ran, and tested the code directly.

The prompts below are the verbatim user turns from that session, in order.
Everything else in the repository (code, tests, commit messages, this
README) was produced by the AI in response to these prompts, with the AI
making and stating its own implementation decisions along the way (stack
choice, schema design, route structure, TDD sequencing, visual design
system, etc.) rather than being told what to write line by line.

---

## Prompt 1

*(Uploaded document: the kata brief, "TDD Kata: Car Dealership Inventory
System" — full text omitted here since it is reproduced verbatim as
`KATA-BRIEF.md` / the original assignment PDF/doc in this repo's root, not
authored by the AI.)*

No additional text accompanied the upload — the document itself was the
first prompt.

## Prompt 2

> What would you like help with right now? Build the full project (backend + frontend) from scratch
> Which stack do you want to use? Node.js/TypeScript (Express or NestJS)

*(These were the user's answers to clarifying questions the AI asked via an
interactive option-select tool before starting work — reproduced here as
the plain-text equivalent of the selections made.)*

## Prompt 3

> Continue

## Prompt 4

> continue the execution

## Prompt 5

> i need a best and some what different from others

---

## Notes on this log

- No prompts were edited, summarized, or removed from this list.
- Clarifying questions the AI asked (stack choice, scope) were answered via
  a button/option UI rather than free text; the selections are transcribed
  above as their label text.
- All commit messages in `git log` additionally document, per-commit, what
  the AI drafted versus what a human reviewer would need to check/adjust —
  see the "My AI Usage" section of the root `README.md` for the aggregate
  reflection.
