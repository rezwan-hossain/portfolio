// module/event/components/RichDescription.tsx
//
// Event description from the admin editor, given structure (headings, lists,
// fact panel, notes) by normalizeDescription and styled by the CSS module.
// Server component.

import { normalizeDescription } from "./rich-description/normalize";
import styles from "./RichDescription.module.css";

export default function RichDescription({ html }: { html: string }) {
  return (
    <div
      className={styles.rich}
      // Admin-authored HTML, rendered as before; only its structure changes.
      dangerouslySetInnerHTML={{ __html: normalizeDescription(html) }}
    />
  );
}
