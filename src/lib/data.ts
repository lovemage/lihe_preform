import fs from "fs";
import path from "path";

function loadJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getSiteData() {
  return loadJson<any>("site.json");
}

export function getHomeData() {
  return loadJson<any>("home.json");
}

export function getAboutData() {
  return loadJson<any>("about.json");
}

export function getFactoryData() {
  return loadJson<any>("factory.json");
}

export function getEquipmentData() {
  return loadJson<any>("equipment.json");
}

export function getContactData() {
  return loadJson<any>("contact.json");
}

export function getProductsData() {
  const filePath = path.join(process.cwd(), "products-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
