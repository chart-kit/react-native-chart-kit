const [command = "command", ...reasonParts] = process.argv.slice(2);
const reason = reasonParts.join(" ").trim();

console.error(`${command} is not configured yet.`);

if (reason) {
  console.error(reason);
}

console.error("See contributing.md for the current CKV2 command matrix.");

process.exitCode = 1;
