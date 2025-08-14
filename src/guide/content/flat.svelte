<h3>Flat Checks</h3>

<div class="grid grid-cols-2 gap-2 gap-y-4 items-center">
	<img src="{FlatInMessage}">
	<div class="justify-self-start">
		<h5>Flat Checks in Messages</h5>
		<p>
			Adds flat checks on Strikes, Spells and some other chat messages.
		</p>
		<SettingInput key="flat-check-in-message" label="Enabled" />

		<h5>Auto-Roll Flat Checks</h5>
		<SettingInput key="flat-check-auto-roll" label="Mode" />
		<SettingInput key="flat-check-auto-roll-user" label="Enabled" />
	</div>

	<img src="{FlatOnTarget}">
	<div class="justify-self-start">
		<h5>Show Flat Check on Target</h5>
		<p>
			Shows flat check DC and reason when targeting a token. <br>
			With a token selected, this will use the selected actor's senses (low-light/darkvision) and include conditions like Dazzled.
		</p>
		<SettingInput key="flat-check-targer-marker" label="Enabled" />
	</div>

	<div class="col-span-2 mx-[10%]">
		<h5>Configure Flat Checks</h5>
		<p>You can turn off which flat checks are shown in messages and on tokens.</p>
		<p>Note: Light level flat checks are disabled by default and need to be enabled here.</p>
		<button onclick={() => new FlatMessageConfigApplication().render(true)}>
			<i class="fa-solid fa-gears"></i> Open Config
		</button>
	</div>

	<img src="{LightVis}">
	<div class="justify-self-start">
		<h5>Light Level Visualization</h5>
		<p>
			Hold <kbd>Alt</kbd> to highlight squares with <span class="text-yellow-700 dark:text-yellow-500">dim light</span>
			or in <span class="text-red-500">darkness</span>.
		</p>
		<SettingInput key="light-level-vis" label="Enabled" />
	</div>

	<div class="col-span-2 mx-[10%]">
		<h5 class="text-center">Compatibility</h5>
		<strong>PF2e Visioner Support</strong>
		<p>
			If PF2e Visioner is enabled and target flat checks are enabled, Visioner's detection states will also be used for flat checks.
		</p>
	</div>

</div>

<script lang="ts">
import { FlatMessageConfigApplication } from "src/modules/flat/message-config"
import SettingInput from "./component/setting-input.svelte"
import FlatInMessage from "./img/flat-in-message.webp"
import FlatOnTarget from "./img/flat-on-target.webp"
import LightVis from "./img/light-vis.webp"
</script>

<style scoped>
	img {
		max-width: 300px;
		border-radius: 5px;
		justify-self: center;
	}
</style>
