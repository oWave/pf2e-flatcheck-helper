<h3 class="ml-4">Emanation Automation</h3>

<div class="grid grid-cols-2 gap-2 gap-y-4 items-center">

	<div class="col-span-2 mx-[10%]">
		<Important>
			<strong>Deprecated</strong>
			<p>This feature is deprecated. I'll keep it until it breaks. Please use <a onclick={(e) => {e.preventDefault(); changeTab("Quick Apply")}} class="underline">Quick Apply</a> instead.</p>
		</Important>

		<p>Adds a button to emanation spells that applies the spell effect to all tokens in the area.</p>
		<SettingInput key="emanation-automation" label="Enabled"></SettingInput>

		<p>
			The Spell Config only shows when the spell has no defense (passive or saving throw) and the area is set to emanation. <br>
			The "Apply emanation effect" button is visible to GMs if "Apply to" is configured.
		</p>
	</div>
	<figure class="col-span-2">
		<img src={ImgConfig}>
		<figcaption>Spell Config</figcaption>
	</figure>
	<div class="col-span-2 justify-self-center flex gap-2 items-center">
		<figure>
			<img src={ImgChatCard}>
			<figcaption>Emanation Spell in Chat</figcaption>
		</figure>
		<figure>
			<img src={ImgDialog}>
			<figcaption>Emanation Apply Dialog</figcaption>
		</figure>
	</div>
</div>

<script lang="ts">
import ImgChatCard from "src/guide/content/img/emanation-chat-card.webp"
import ImgConfig from "src/guide/content/img/emanation-config.webp"
import ImgDialog from "src/guide/content/img/emanation-dialog.webp"
import { preventDefault } from "svelte/legacy"
import { getGuideContext } from "../context"
import Important from "./component/important.svelte"
import SettingInput from "./component/setting-input.svelte"

const changeTab = getGuideContext()
</script>

<style>
	img {
		justify-self: center;
	}
</style>
