# Graphite Tutorial

> A hands-on walkthrough of stacked PRs with [Graphite](https://graphite.dev).

This repo is a self-contained demo. By the end, you'll have created your first stack of branches, seen how they relate to each other, and understood why stacked diffs make code review better.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [What is Graphite?](#2-what-is-graphite)
3. [Core Concepts](#3-core-concepts)
4. [Setup](#4-setup)
5. [Hands-on: Your First Stack](#5-hands-on-your-first-stack)
6. [Navigating Your Stack](#6-navigating-your-stack)
7. [Submitting for Review](#7-submitting-for-review)
8. [Graphite AI Reviewer (Diamond)](#8-graphite-ai-reviewer-diamond)
9. [The Merge Queue](#9-the-merge-queue)
10. [Syncing After a Merge](#10-syncing-after-a-merge)
11. [Cheatsheet](#11-cheatsheet)

---

## 1. The Problem

Imagine you're building a feature: a user profile page. It needs:

- A data model (`User` type)
- An API route (`GET /users/:id`)
- A UI component (`<ProfilePage>`)

The naive approach is to do it all in one branch and open one giant PR.

**What happens:**

```
main
 └── feature/user-profile   ← 47 files changed, 1,200 lines
```

Your reviewer now has to understand everything at once. They don't know where to start. They leave vague comments. The PR sits for days.

**The better approach:** break it into three small, focused PRs — each building on the last.

```
main
 └── add-user-model          ← 3 files, 40 lines  ✓ easy to review
      └── add-user-api       ← 2 files, 60 lines  ✓ easy to review
           └── add-user-ui   ← 4 files, 80 lines  ✓ easy to review
```

This is a **stack**. Graphite is the tool that makes working with stacks not painful.

---

## 2. What is Graphite?

Graphite is a CLI + web app that wraps Git to make stacked PRs first-class.

- **`gt`** is the CLI — you use it instead of most `git` commands
- It tracks the parent/child relationships between your branches
- It keeps your stack in sync automatically when branches rebase or merge
- It opens PRs on GitHub with the correct base branch (not always `main`)

Graphite does **not** replace GitHub. Your PRs still live there. Graphite just makes the workflow of creating and managing a chain of them not miserable.

---

## 3. Core Concepts

### Trunk

Your main branch (`main` or `master`). The base of all stacks.

### Branch

Same as a Git branch. One focused change. One PR.

### Stack

A chain of branches, each depending on the one below it.

```
main  ← trunk
  └── branch-a   (PR #1)
        └── branch-b   (PR #2)
              └── branch-c   (PR #3)
```

When PR #1 merges, Graphite rebases `branch-b` directly onto `main`, so PR #2's base is always correct.

### `gt log` — your best friend

At any point, run `gt log` to see the shape of your stack:

```
◉ main
│
◯ add-user-model       ← you are here
│
◯ add-user-api
│
◯ add-user-ui
```

---

## 4. Setup

### Install Graphite

```bash
npm install -g @withgraphite/graphite-cli
```

### Authenticate

```bash
gt auth
```

This opens a browser to link your GitHub account. Only needed once.

### Initialize in a repo

```bash
gt init
```

Run this once per repo. It writes a small config to `.git` — nothing committed.

> **This repo is already initialized.** Skip `gt init` and jump straight to the exercises.

---

## 5. Hands-on: Your First Stack

This repo has a tiny fake app in `app/`. You'll build a "notes" feature on top of it, split into three stacked branches:

1. **`add-notes-model`** — the data structure
2. **`add-notes-api`** — the backend route
3. **`add-notes-ui`** — the frontend component

Look at `app/` before you start to get a feel for the codebase.

---

### Exercise A — Create the first branch

```bash
gt branch create add-notes-model
```

This creates a new branch stacked on `main` and checks it out.

Open `app/models/index.js` and add the Note model at the bottom:

```js
export const Note = {
  id: 'string',
  userId: 'string',
  body: 'string',
  createdAt: 'Date',
};
```

Commit it:

```bash
gt modify -m "add Note model"
```

---

### Exercise B — Stack a second branch on top

Without switching back to `main`, create the next branch:

```bash
gt branch create add-notes-api
```

Graphite stacks this on top of `add-notes-model` automatically — you're still "above" it.

Open `app/api/index.js` and add the route at the bottom:

```js
app.get('/notes/:userId', (req, res) => {
  res.json({ notes: [], userId: req.params.userId });
});
```

Commit:

```bash
gt modify -m "add GET /notes/:userId route"
```

---

### Exercise C — Stack a third branch

```bash
gt branch create add-notes-ui
```

Open `app/ui/index.js` and add the component at the bottom:

```js
export function NotesList({ userId }) {
  return `<ul id="notes-${userId}"></ul>`;
}
```

Commit:

```bash
gt modify -m "add NotesList component"
```

---

### Check your stack

```bash
gt log
```

You should see:

```
◉ main
│
◯ add-notes-model
│
◯ add-notes-api
│
◯ add-notes-ui  ← current
```

Three branches. Each one only contains its own change. 

---

## 6. Navigating Your Stack

### Move up and down

```bash
gt up      # move to the child branch
gt down    # move to the parent branch
gt bottom  # jump to the bottom of the stack
gt top     # jump to the top of the stack
```

Try it:

```bash
gt bottom   # lands on add-notes-model
gt log      # notice the ← current arrow moved
gt top      # back to add-notes-ui
```

### Modify a branch in the middle

Let's say you realize the Note model needs a `title` field.

```bash
gt checkout add-notes-model
```

Edit `app/models/index.js` and add `title: 'string'` to the Note object. Then:

```bash
gt modify -m "add title field to Note model"
```

Now rebase the rest of the stack on top of your fix:

```bash
gt stack restack
```

All branches above `add-notes-model` are automatically rebased. No manual `git rebase`. The whole stack stays clean.

> **Tip:** If you want to fold the fix into the existing commit instead of adding a new one, drop the `-m` flag — `gt modify` without a message amends the current commit in place, keeping the original message.

---

## 7. Submitting for Review

When you're ready, submit the entire stack as PRs on GitHub:

```bash
gt stack submit
```

Graphite will:
- Push all three branches
- Open PRs with the correct base branches (`add-notes-model` targets `main`, `add-notes-api` targets `add-notes-model`, etc.)
- Print links to all the PRs

Reviewers can review each PR independently and in parallel. You don't have to wait for PR #1 to merge before PR #2 gets reviewed.

To submit only the current branch (useful for a WIP stack):

```bash
gt branch submit
```

### Updating after review feedback

Make your changes, commit (or amend), then:

```bash
gt stack submit
```

Graphite pushes the updated branches and updates the open PRs.

---

## 8. Graphite AI Reviewer (Diamond)

Graphite ships an AI code reviewer called **Diamond**. Once enabled for your repo on graphite.dev, it automatically reviews every PR you open and posts inline comments — usually within a minute of pushing.

### What it actually does

- **Bug detection** — null derefs, off-by-ones, missed error paths, race conditions
- **Codebase-aware suggestions** — Diamond indexes your repo, so it can flag "you have a helper for this in `app/utils/`" or "this pattern is inconsistent with the rest of `app/api/`"
- **Style + correctness** — uses your existing conventions, not generic lint rules
- **Severity tags** — each comment is marked as a blocker, suggestion, or nit, so you know what to act on

It's designed as a *first-pass* reviewer. The goal is that your human reviewer never has to leave a comment like "you forgot to handle the empty array case" — Diamond catches those before they see it.

### Workflow

1. You run `gt submit` → Diamond reviews automatically
2. Read its comments on GitHub or in the Graphite web app
3. Fix what's worth fixing, mark the rest as ignored
4. Request human review when Diamond's pass is clean

### Custom rules

Diamond's behavior is configured at `app.graphite.com/ai-reviews` under the **Rules & exclusions** tab. Two approaches:

- **Custom prompts (recommended)** — write rules directly in the Graphite UI. Best for most teams.
- **File-based rules** — point Diamond at existing repo docs via glob patterns (e.g. `CONTRIBUTING.md`, `docs/coding-standards.md`, `docs/architecture/*.md`). Best when you already maintain living documentation.

Example rules a team might add:

- "All API responses must include a `requestId` field."
- "Never use `console.log` outside of `app/scripts/`."
- "Prefer `Result<T, E>` over throwing exceptions in `app/core/`."

Org admin permissions are required to edit these.

### Re-triggering a review

Diamond runs automatically on every push. To re-run on the same commit, use the **Re-review** button in the Graphite PR view — there's no CLI equivalent.

---

## 9. The Merge Queue

The merge queue is Graphite's answer to "PRs that passed CI in isolation but broke `main` when they merged." It serializes merges so `main` is always green.

### The problem it solves

Without a queue, two PRs can both pass CI against an old `main`, both get approved, and both merge — even though their combined diff breaks the build. With many engineers, this happens constantly.

### How it works

1. You click **"Merge when ready"** in the Graphite web app (or run `gt merge`)
2. The PR enters the queue instead of merging immediately
3. Graphite rebases it onto the latest `main`
4. CI runs against the rebased version
5. **Only if CI passes**, the PR merges
6. The next PR in the queue is rebased onto this new `main` and tested

`main` is never broken because nothing merges without a green CI run on the exact code that's about to land.

### Stacks + merge queue

This is where stacks shine. When you queue the *top* of a stack, Graphite queues the whole chain — bottom-up:

```
main
 │
 ◯ add-notes-model    ← merges first
 │
 ◯ add-notes-api      ← merges second (rebased onto new main)
 │
 ◯ add-notes-ui       ← merges third
```

You don't have to babysit each PR. Submit the stack, queue it, walk away.

### Parallel optimization

For independent PRs (or sufficiently separated stacks), Graphite tests them in parallel against speculatively-rebased branches. If both pass, both merge in order. If one fails, only the failed one is bounced — the rest continue. This keeps queue throughput high on busy repos.

### Configuring the queue

In the Graphite web app, under **Settings → Merge queue**:

- Required checks (which CI jobs must pass)
- Merge method (squash, rebase, merge commit)
- Max parallelism
- Auto-dequeue rules (e.g. drop PRs that fail twice)

### Useful commands

```bash
gt merge                       # merge the PRs from trunk up to the current branch
gt merge --dry-run             # preview what would be merged without doing it
gt submit --merge-when-ready   # submit and mark as "merge when ready" in one shot
```

---

## 10. Syncing After a Merge

Once PR #1 (`add-notes-model`) is merged into `main`:

```bash
gt sync
```

Graphite will:
1. Pull the latest `main`
2. Detect that `add-notes-model` was merged and is gone
3. Rebase `add-notes-api` directly onto `main`
4. Rebase `add-notes-ui` on top of that

Your stack shrinks by one and stays clean:

```
◉ main
│
◯ add-notes-api  ← now targets main directly
│
◯ add-notes-ui
```

Repeat after each merge until the stack is empty.

---

## 11. Cheatsheet

| Task | Command |
|---|---|
| Create a new stacked branch | `gt branch create <name>` |
| Stage all changes + create/amend commit | `gt modify -m "message"` |
| Amend current commit (keep message) | `gt modify` |
| See the stack | `gt log` |
| Move up one branch | `gt up` |
| Move down one branch | `gt down` |
| Jump to a specific branch | `gt checkout <name>` |
| Rebase the stack after a mid-stack edit | `gt stack restack` |
| Open PRs for the whole stack | `gt stack submit` |
| Submit + mark as "merge when ready" | `gt submit --merge-when-ready` |
| Merge PRs from trunk up to current branch | `gt merge` |
| Pull latest + rebase after merges | `gt sync` |
| Delete a branch and restack | `gt branch delete <name>` |
| Rename current branch | `gt branch rename <new-name>` |

---

## Further reading

- [Graphite docs](https://graphite.dev/docs)
- [Why stack?](https://graphite.dev/blog/stacked-prs)
