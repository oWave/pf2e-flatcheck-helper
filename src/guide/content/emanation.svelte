<h3>Emanation Automation</h3>

<div class="grid grid-cols-2 gap-2 gap-y-4 items-center">

	<div class="col-span-2 mx-[10%]">
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
import Important from "./component/important.svelte"
import ImgConfig from "src/guide/content/img/emanation-config.webp"
import ImgChatCard from "src/guide/content/img/emanation-chat-card.webp"
import ImgDialog from "src/guide/content/img/emanation-dialog.webp"
import SettingInput from "./component/setting-input.svelte"
</script>

<style>
	img {
		justify-self: center;
	}
</style>
