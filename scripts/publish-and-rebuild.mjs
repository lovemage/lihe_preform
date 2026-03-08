console.log("Running content publish workflow...");

await import("./publish-content.mjs");

console.log("Publishing complete.");
console.log("Next step: run `npm run build` and deploy the latest build.");

if (process.env.AUTO_DEPLOY === "true") {
  console.log("AUTO_DEPLOY=true detected. Running deploy...");
  const { execSync } = await import("node:child_process");
  execSync("npm run deploy", { stdio: "inherit" });
}
