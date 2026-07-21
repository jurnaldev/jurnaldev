# Journal Paragraph Spacing Design

## Goal

Make consecutive Markdown paragraphs on journal and project detail pages display the same visible separation shown in the Strapi editor preview.

## Scope

- Add approximately one line (`1rem`) of space between consecutive paragraphs.
- Keep the existing spacing for headings, lists, blockquotes, callouts, images, tables, and code blocks.
- Keep the Markdown parsing and content data unchanged.

## Design

Mark paragraphs rendered by `ArticleBody` with a dedicated class and add a narrowly scoped adjacent-sibling rule. The rule applies top margin only when a rendered paragraph immediately follows another rendered paragraph. This avoids adding trailing space after every paragraph or changing unrelated Markdown elements.

Because portfolio details share `ArticleBody`, they will receive the same corrected Markdown paragraph behavior.

## Verification

Add a component-level regression test that renders two consecutive Markdown paragraphs and asserts that they receive the paragraph class used by the spacing rule. Also verify that the stylesheet contains the scoped adjacent-paragraph rule with the intended spacing. Run the focused test, then lint, type checking, and the existing test suite.
