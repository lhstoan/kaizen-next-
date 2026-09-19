import sanitizeHtml from "sanitize-html";

// The admin editor stores HTML, so it is sanitised here before it reaches the page:
// only the tags that editor can produce survive, links keep nothing but href/target/rel,
// and URLs must be http(s), mailto or site-relative. sanitize-html is pure JS — a
// DOM-based sanitiser (jsdom) fails on Vercel's serverless runtime.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "code",
    "pre",
    "hr",
  ],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
};

function escapeText(text: string) {
  return text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}

function toHtml(body: string) {
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(body);

  // Posts written before the editor existed are plain text: one paragraph per blank line.
  const source = looksLikeHtml
    ? body
    : body
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p) => `<p>${escapeText(p)}</p>`)
        .join("");

  return sanitizeHtml(source, OPTIONS);
}

export default function PostBody({ body }: { body: string }) {
  return <div className="iBlog--body" dangerouslySetInnerHTML={{ __html: toHtml(body) }} />;
}
