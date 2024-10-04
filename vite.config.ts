/* eslint-env node */
import fs from "node:fs"
import { type Connect, type PluginOption, defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import moduleJSON from "./module.json" with { type: "json" }

const packagePath = `modules/${moduleJSON.id}`
// const { esmodules, styles } = moduleJSON

const skippedFiles = [`${moduleJSON.id}.css`].map((f) => `dist/${f}`).join("|")

export default defineConfig(({ command: _buildOrServe }) => ({
	root: "src",
	base: `/${packagePath}/dist`,
	cacheDir: "../.vite-cache",
	publicDir: "../assets",

	clearScreen: true,

	esbuild: {
		target: ["es2022"],
	},

	resolve: { conditions: ["import", "browser"] },

	server: {
		open: false,
		port: 30001,
		proxy: {
			// Serves static files from main Foundry server.
			[`^(/${packagePath}/(assets|lang|packs|${skippedFiles}))`]: "http://localhost:30000",

			// All other paths besides package ID path are served from main Foundry server.
			[`^(?!/${packagePath}/)`]: "http://localhost:30000",

			// Enable socket.io from main Foundry server.
			"/socket.io": { target: "ws://localhost:30000", ws: true },
		},
	},

	build: {
		copyPublicDir: false,
		outDir: "../dist",
		emptyOutDir: true,
		sourcemap: true,
		minify: "terser" as const,
		terserOptions: {
			mangle: {
				toplevel: true,
				keep_classnames: true,
				keep_fnames: true,
			},
			module: true,
		},
		lib: {
			entry: "vite-index.js",
			formats: ["es"],
			fileName: "module",
		},
		rollupOptions: {
			output: {
				// assetFileNames: assetInfo => (assetInfo.name === 'style.css') ? `${moduleJSON.id}.css` : (assetInfo.name as string),
			},
		},
	},

	optimizeDeps: {
		esbuildOptions: {
			target: "es2022",
		},
	},

	plugins: [
		tsconfigPaths(),
		{
			name: "change-names",
			configureServer(server) {
				server.middlewares.use((req: Connect.IncomingMessage & { url?: string }, res, next) => {
					if (req.originalUrl === `/${packagePath}/dist/module.js`) {
						req.url = `/${packagePath}/dist/vite-index.js`
					}
					next()
				})
			},
		},
		{
			name: "create-dist-files",
			apply: "serve",
			buildStart() {
				const files = [...moduleJSON.esmodules, ...moduleJSON.styles]
				for (const name of files) {
					fs.writeFileSync(`${name}`, "", { flag: "a" })
				}
			},
		},
	],
}))
