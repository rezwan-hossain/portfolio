// module/event/components/rich-description/normalize.ts
//
// Gives admin-written event descriptions real structure without changing their
// words. The rich-text editor produces "headings" as bold paragraphs and lists
// as "•" lines joined by <br>, so we read each line by its shape:
//
//   ALL-CAPS bold line      → <h3>
//   "• item" lines          → <ul data-kind="bullets">
//   "📅 <b>Label:</b> value" → <ul data-kind="facts">
//   "*note" line            → <p data-kind="note">
//   multi-line list item    → card (<ul data-kind="cards">, title + body)
//   other lines             → <p>, line breaks kept
//
// Styled by RichDescription.module.css. Server-only (uses cheerio).

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

const BR = /<br\s*\/?>/i;
const BULLET = /^(?:\s|&nbsp;)*[•▪●◦]\s*/;
const FACT = /^[^\p{L}\p{N}<]*<(strong|b)>[^<]{1,40}:\s*<\/\1>/u;

const fragment = (html: string) => cheerio.load(html, null, false);

const textOf = (html: string) =>
  fragment(html).root().text().replace(/ /g, " ").replace(/\s+/g, " ").trim();

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A short line whose letters are all upper-case and all bold. */
function isHeading(html: string): boolean {
  const $ = fragment(html);
  const text = textOf(html);
  const letters = text.replace(/[^\p{L}]/gu, "");
  if (letters.length < 3 || text.length > 80) return false;
  if (letters !== letters.toUpperCase()) return false;
  const bold = $("strong, b")
    .text()
    .replace(/[^\p{L}]/gu, "");
  return bold.length === letters.length;
}

/** Heading text without leading emoji/symbols or a trailing colon. */
const headingText = (html: string) =>
  textOf(html)
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/:\s*$/, "");

const isNote = (html: string) => textOf(html).startsWith("*");

/** Splits a block's inner HTML on <br>, dropping empty lines. */
const linesOf = (html: string) =>
  html
    .split(BR)
    .map((l) => l.trim())
    .filter((l) => textOf(l) !== "" || /<img/i.test(l));

type Kind = "heading" | "bullet" | "fact" | "note" | "text";

function kindOf(line: string): Kind {
  if (BULLET.test(line)) return "bullet";
  if (isHeading(line)) return "heading";
  if (FACT.test(line)) return "fact";
  if (isNote(line)) return "note";
  return "text";
}

/** Turns one <p>'s lines into blocks, grouping runs of the same kind. */
function blocksFromLines(lines: string[]): string[] {
  const out: string[] = [];
  type Run = { kind: Kind; items: string[] };
  // Widened on purpose: flush() resets it, which TS can't see through.
  let run = null as Run | null;

  const flush = () => {
    if (!run) return;
    const { kind, items } = run;
    if (kind === "bullet" || kind === "fact") {
      out.push(
        `<ul data-kind="${kind === "bullet" ? "bullets" : "facts"}">${items
          .map((i) => `<li>${i}</li>`)
          .join("")}</ul>`,
      );
    } else if (kind === "text") {
      out.push(`<p>${items.join("<br>")}</p>`);
    }
    run = null;
  };

  for (const line of lines) {
    const kind = kindOf(line);
    if (kind === "heading") {
      flush();
      out.push(`<h3>${escapeHtml(headingText(line))}</h3>`);
    } else if (kind === "note") {
      flush();
      const body = line
        .replace(/^((?:<[^>]+>)*)\s*\*\s*/, "$1")
        .replace(/\*(\s*(?:<\/[^>]+>)*)\s*$/, "$1");
      out.push(`<p data-kind="note">${body}</p>`);
    } else {
      const item = kind === "bullet" ? line.replace(BULLET, "") : line;
      if (run?.kind === kind) run.items.push(item);
      else {
        flush();
        run = { kind, items: [item] };
      }
    }
  }
  flush();
  return out;
}

/** A list item with several lines becomes a card: first line is the title. */
function listItem(html: string): string {
  const lines = linesOf(html.replace(/<\/?p>/gi, "<br>"));
  if (lines.length < 2) return `<li>${lines.join("")}</li>`;
  const [title, ...body] = lines;
  return `<li><span data-part="title">${title}</span>${body
    .map((l) => `<span data-part="body">${l}</span>`)
    .join("")}</li>`;
}

export function normalizeDescription(html: string): string {
  if (!html?.trim()) return "";
  const $ = fragment(html);
  const out: string[] = [];

  $.root()
    .contents()
    .each((_, node: AnyNode) => {
      const el = $(node);
      const tag = node.type === "tag" ? node.tagName.toLowerCase() : "";

      if (tag === "p" || tag === "div") {
        out.push(...blocksFromLines(linesOf(el.html() ?? "")));
      } else if (tag === "ul" || tag === "ol") {
        const items = el
          .children("li")
          .map((__, li) => listItem($(li).html() ?? ""))
          .get();
        const cards = el
          .children("li")
          .toArray()
          .some(
            (li) =>
              linesOf(($(li).html() ?? "").replace(/<\/?p>/gi, "<br>")).length >
              1,
          );
        out.push(
          `<${tag}${cards ? ' data-kind="cards"' : ""}>${items.join("")}</${tag}>`,
        );
      } else if (/^h[1-6]$/.test(tag)) {
        out.push(`<h3>${escapeHtml(headingText(el.html() ?? ""))}</h3>`);
      } else if (node.type === "text") {
        const text = el.text().trim();
        if (text) out.push(`<p>${escapeHtml(text)}</p>`);
      } else if (tag) {
        out.push($.html(node));
      }
    });

  return out.join("");
}
