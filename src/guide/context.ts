import { getContext, setContext } from "svelte"

type ChangeTab = (name: string) => void

export function setGuideContext(f: ChangeTab) {
	setContext("changeTab", f)
}

export function getGuideContext() {
	return getContext("changeTab") as ChangeTab
}
