import { PUBLISH_LOCALES } from "@/lib/admin/locales";
import { publishFactoryJson, publishHomeJson, publishProductsJson } from "@/lib/admin/content-repository";

export async function publishContent() {
  const outputs: string[] = [];

  for (const locale of PUBLISH_LOCALES) {
    outputs.push(await publishHomeJson(locale));
    outputs.push(await publishFactoryJson(locale));
    outputs.push(await publishProductsJson(locale));
  }

  return outputs;
}
