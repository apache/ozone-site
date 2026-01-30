# Spelling Check Failed

Spelling can be checked locally by running the script _.github/scripts/spelling.sh_. This requires you to have pnpm's dev dependencies installed on your machine for cspell to work (run `pnpm install --dev`).

**If spell check fails for words that are correct but not recognized:**

- Option 1: If the word is relevant for the whole Ozone project, add it to the `words` list in _cspell.yaml_ so that it is considered valid.
- Option 2: If the word is only relevant for one specific page, add an [inline directive](https://cspell.org/configuration/document-settings/) as a comment in the markdown front matter of that page only.
