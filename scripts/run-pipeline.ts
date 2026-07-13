// Draait de pipeline vanaf de opdrachtregel.
//   npm run pipeline           -> testrun met 8 zoekwoorden
//   npm run pipeline -- 25     -> testrun met 25 zoekwoorden
//   npm run pipeline -- all    -> volledige run (alle zoekwoorden)
import { runPipeline } from "../lib/pipeline/run";

const arg = process.argv[2];
const limit = arg === "all" ? undefined : arg ? Number(arg) : 8;

console.log(
  `\n▶ Pipeline start (${limit ? `${limit} zoekwoorden` : "alle zoekwoorden"})...\n`
);

runPipeline({ limit })
  .then((r) => {
    console.log("Zoekwoorden verwerkt: ", r.keywords);
    console.log("Producten (pending):  ", r.productsUpserted);
    console.log("Signalen per bron:    ", r.signalsBySource);
    console.log("Signalen opgeslagen:  ", r.signalsStored);
    console.log(
      "Scores geschreven:    ",
      r.scoresWritten,
      `(overgeslagen wegens te weinig historie: ${r.scoresSkipped})`
    );
    if (r.errors.length) {
      console.log("\n⚠ Meldingen van bronnen (pipeline draaide gewoon door):");
      for (const e of r.errors) console.log("  -", e);
    }
    console.log("\n✅ Klaar.\n");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Pipeline gestopt:", err.message, "\n");
    process.exit(1);
  });
