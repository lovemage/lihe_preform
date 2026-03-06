import type { Metadata } from "next";
import { getLocaleAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL("https://lihe-preform.com"),
  title: "Lihe Precision",
  description:
    "Lihe Precision PET preform mold and blow mold engineering solutions.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: getLocaleAlternates("en", ""),
};

export default function RootPage() {
  const redirectScript = `
    (function () {
      var supported = ["en", "ru", "es"];
      var langs = (navigator.languages && navigator.languages.length)
        ? navigator.languages
        : [navigator.language || "en"];
      var locale = "en";

      for (var i = 0; i < langs.length; i += 1) {
        var current = (langs[i] || "").toLowerCase();
        var base = current.split("-")[0];
        if (supported.indexOf(base) !== -1) {
          locale = base;
          break;
        }
      }

      window.location.replace("/" + locale + "/");
    })();
  `;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Lihe Precision</h1>
      <p>Redirecting to your language...</p>
      <p>
        Continue manually:
        {" "}
        <a href="/en/">English</a>
        {" | "}
        <a href="/ru/">Русский</a>
        {" | "}
        <a href="/es/">Español</a>
      </p>
      <script
        dangerouslySetInnerHTML={{
          __html: redirectScript,
        }}
      />
    </main>
  );
}
