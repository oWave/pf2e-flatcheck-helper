import { compilePack } from "@foundryvtt/foundryvtt-cli";
import fs from "node:fs";
import path from "node:path";

const packDir = path.resolve(process.cwd(), "packs");
const subDirs = fs.readdirSync(packDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => path.resolve(packDir, d.name))

for (const dir of subDirs) {
	const sourceDir = path.resolve(dir, "_source")
	await compilePack(sourceDir, dir)
}
