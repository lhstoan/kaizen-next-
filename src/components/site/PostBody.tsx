import DOMPurify from "isomorphic-dompurify";

// The admin editor stores HTML, so it is sanitised here before it reaches the page:
// only the tags the editor can produce survive, and no attributes beyond a link's
// href/target/rel. Older posts saved as plain text are wrapped in <p> per blank line.
const ALLOWED_TAGS = [
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
];

function toHtml(body: string) {
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(body);
  const source = looksLikeHtml
    ? body
    : body
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p) => `<p>${p.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)}</p>`)
        .join("");

  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i,
  });
}

export default function PostBody({ body }: { body: string }) {
  return <div className="iBlog--body" dangerouslySetInnerHTML={{ __html: toHtml(body) }} />;
}
