import "./index.ts"
import "./module.css"

if (!import.meta.env.DEV) {
	const link = document.createElement("link")
	link.rel = "stylesheet"
	link.type = "text/css"
	link.href = "modules/pf2e-flatcheck-helper/dist/module.css"
	document.head.appendChild(link)
}
