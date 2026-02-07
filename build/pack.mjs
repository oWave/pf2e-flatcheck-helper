import fs from "node:fs"
import path from "node:path"
import { compilePack } from "@foundryvtt/foundryvtt-cli"

const packDir = path.resolve(process.cwd(), "packs")
const subDirs = fs
	.readdirSync(packDir, { withFileTypes: true })
	.filter((d) => d.isDirectory() && !d.name.endsWith("-sf2e"))
	.map((d) => path.resolve(packDir, d.name))

for (const dir of subDirs) {
	const sourceDir = path.resolve(dir, "_source")

	await compilePack(sourceDir, dir)
	await compilePack(sourceDir, `${dir}-sf2e`, {
		transformEntry(data) {
			if (typeof data.img === "string") data.img = data.img.replaceAll(/\/pf2e\//g, "/sf2e/")
		}
	})
}
