import sanitizeHtml from "sanitize-html";

/** Sanitasi konten artikel SEBELUM disimpan (lebih ketat: tanpa img/figure). */
export function cleanContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "h2", "h3", "h4", "blockquote"],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tag, attribs) => ({
        tagName: tag,
        attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
      }),
    },
  });
}
