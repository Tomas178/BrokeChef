export async function formEmailTemplate(
  template: string,
  placeholders: Record<string, string>
): Promise<string> {
  for (const key in placeholders) {
    template = template.replaceAll(`{{${key}}}`, placeholders[key]);
  }
  return template;
}
