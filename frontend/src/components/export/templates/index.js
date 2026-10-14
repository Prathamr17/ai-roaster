import { ClassicTemplate } from "./ClassicTemplate";
import { LatexTemplate } from "./LatexTemplate";
import { ModernTemplate } from "./ModernTemplate";

/**
 * Available resume templates for export:
 * - classic: Classic single-column LaTeX style matching sample PDF
 * - latex: Ultra-compact LaTeX template format
 * - modern: Modern design with accent colors and chips
 */
export const TEMPLATES = [
  {
    id: "classic",
    label: "Classic",
    description: "Traditional single-column layout matching standard PDF format",
    Component: ClassicTemplate,
  },
  {
    id: "latex",
    label: "Latex",
    description: "Clean LaTeX geometry style with tight padding & compact bullet lists",
    Component: LatexTemplate,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Sans-serif, accent color, rounded skill chips",
    Component: ModernTemplate,
  },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id;

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
