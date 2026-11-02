export const SHOWCASE_MD = `<!--
  showcase.md — Generic demo document.
  Walks through everything the viewer can render: brand banner, headings,
  inline styles (bold, italic, underline, strikethrough, code, link, color,
  highlight), tables with colored cells and per-column widths, quote, divider,
  code block and footer.
  All colors use var(--token) to adapt to light/dark. The base tokens
  (page-bg, text, heading, rule, link, code, highlight) come from the library;
  the brand ones (accent, on-accent, accent-text) come from the colorTokens prop.
-->

<div style="font-family: Arial, Helvetica, sans-serif; max-width: 7.08in; margin: 0 auto; color: var(--text);">

<div style="background: var(--accent); color: var(--on-accent); text-align: center; font-size: 18pt; text-transform: uppercase; padding: 10px 24px; margin: 0 0 12px;">react-native-md-document</div>

<p style="text-align: center; font-size: 13pt; font-style: italic; color: var(--accent-text); margin: 0 0 18px;">Demo document · Markdown as PDF</p>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">1. What this document shows</h2>

<p style="text-align: justify; margin: 0 0 10px;">This file exercises every capability of the viewer in a single source page. The content is <strong>immutable</strong>: it is not edited, only read, paginated and navigated with a <em>page-flip</em> gesture. Tap any word to highlight it; the highlight <span style="background: var(--highlight);">persists across sessions</span> because it is stored by stable offset.</p>

<p style="text-align: justify; margin: 0 0 16px;">Use <strong>Read</strong> to listen to the text with the system's native voice: the active word is highlighted and the page advances by itself to follow the marker. <strong>Pause</strong> keeps the position and <strong>Resume</strong> continues where it stopped.</p>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">2. Inline text styles</h2>

<p style="text-align: justify; margin: 0 0 10px;">The viewer understands <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>monospaced code</code> and <a href="https://reactnative.dev">links</a>. It also supports brand-token color: <span style="color: var(--accent-text);">this fragment is in the accent color</span>. And background highlighting: <span style="background: var(--highlight);">text over the theme's highlight color</span>.</p>

<p style="text-align: justify; margin: 0 0 16px;">Styles combine: <strong><em>bold italic</em></strong>, or <strong>bold with <code>code</code> inside</strong>. Every word keeps its offset in the plain text, so manual highlights and the reading marker share the same coordinate space.</p>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">3. Table with colored cells</h2>

<table style="width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; border: 3px solid var(--page-bg); margin-bottom: 16px;">
  <colgroup>
    <col style="width: 30%;">
    <col style="width: 70%;">
  </colgroup>
  <tr>
    <td style="background: var(--accent); color: var(--on-accent); font-weight: bold; font-size: 12pt; text-align: center; vertical-align: middle; padding: 8px 6px; border: 3px solid var(--page-bg);">
      <p style="margin: 0; text-align: center;">Capability</p>
    </td>
    <td style="background: var(--accent); color: var(--on-accent); font-weight: bold; font-size: 12pt; text-align: center; vertical-align: middle; padding: 8px 6px; border: 3px solid var(--page-bg);">
      <p style="margin: 0; text-align: center;">Detail</p>
    </td>
  </tr>
  <tr>
    <td style="font-weight: bold; font-size: 11pt; text-align: left; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Pagination</p>
    </td>
    <td style="font-size: 11pt; text-align: justify; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Real height measurement and packing into pages; recalculated when the size or orientation changes.</p>
    </td>
  </tr>
  <tr>
    <td style="font-weight: bold; font-size: 11pt; text-align: left; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Zoom</p>
    </td>
    <td style="font-size: 11pt; text-align: justify; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Pinch to zoom in and drag to pan; the page-turning gesture is locked while zoomed.</p>
    </td>
  </tr>
  <tr>
    <td style="font-weight: bold; font-size: 11pt; text-align: left; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Theme</p>
    </td>
    <td style="font-size: 11pt; text-align: justify; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Light, dark or automatic. The document's colors are tokens that the viewer resolves per theme.</p>
    </td>
  </tr>
</table>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">4. Quote and divider</h2>

<blockquote style="border-left: 4px solid var(--accent); padding-left: 12px; margin: 0 0 12px; font-style: italic; color: var(--accent-text);">
<p style="margin: 0;">The fidelity of a PDF while remaining live text: selectable, readable aloud and adaptable to the theme.</p>
</blockquote>

<hr />

<h2 style="color: var(--heading); font-size: 16pt; margin: 12px 0 6px;">5. Code sample</h2>

<p style="text-align: justify; margin: 0 0 8px;">The text can include embedded monospaced code, for example the viewer's entry point:</p>

<div style="background: var(--highlight); padding: 8px 10px; margin: 0 0 16px;">
<p style="margin: 0;"><code>useDocumentSource({ markdown: SHOWCASE_MD })</code></p>
</div>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">6. Long content to paginate</h2>

<p style="text-align: justify; margin: 0 0 10px;">From here on there is enough text to fill several pages, so you can try turning pages, the auto-advance while reading and the highlight that is kept when you come back. Every paragraph keeps its position in the plain text; paginating loses neither the reading marker nor the saved highlights.</p>

<p style="text-align: justify; margin: 0 0 10px;">A document is treated as an immutable source. That immutability gives a stable offset space: the highlight you save today still points at the same words tomorrow, even if the screen size, the orientation or the theme changes. Pagination is a view over that text, not a modification of it.</p>

<p style="text-align: justify; margin: 0 0 10px;">Reading aloud uses the operating system's engine through its own native module, with no third-party dependencies. While it speaks, it reports the range of the current word; the viewer maps that range to the word and its page, highlights the word and, if it is on another page, advances to follow it.</p>

<p style="text-align: justify; margin: 0 0 10px;">Gestures compose: a tap highlights a word, a horizontal drag turns the page with a flip animation, and a pinch zooms. While zoomed in, dragging pans the content instead of turning the page, so that zooming stays usable.</p>

<p style="text-align: justify; margin: 0 0 16px;">Everything visual rests on two dependencies: Reanimated and Gesture Handler. The storage, the document source and the speech engine are injectable ports: you can plug in whichever you prefer or use the ones the library ships.</p>

<div style="border-top: 2px solid var(--rule); margin-top: 20px; padding-top: 6px; text-align: right; font-size: 9pt; color: var(--accent-text);">Demo document · Page generated by the viewer</div>

</div>
`;
