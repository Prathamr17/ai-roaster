import { getTemplate, DEFAULT_TEMPLATE_ID } from "./templates";

/**
 * Renders whichever template is selected via templateId. Existing callers
 * that don't pass templateId keep getting the original "modern" layout.
 */
export function ResumeDocument({ user, version, title, templateId = DEFAULT_TEMPLATE_ID }) {
  const { Component } = getTemplate(templateId);
  return <Component user={user} version={version} title={title} />;
}
