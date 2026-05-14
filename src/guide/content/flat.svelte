<h3 class="ml-4">Flat Checks</h3>

<main>
	<SettingSection>
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
	</SettingSection>

	<SettingSection>
		<img src="{FlatHiddenRoll}">
		<div class="justify-self-start">
			<h5>Hide Results</h5>
			<p>If a roll requires flat checks, the results will be hidden until revealed.</p>
			<SettingInput key="flat-check-hide-roll" label="Enabled" />
			<hr>
			<SettingInput key="flat-check-hide-roll-auto-reveal" label="Auto-Reveal" />
			<span>Automatically reveals the result when all flat checks succeed.</span>
			<SettingInput key="flat-check-hide-roll-players-can-reveal" label="Players can Reveal" />
			<span>Allows players to manually reveal results, even when not all flat checks succeeded.</span>
		</div>
	</SettingSection>

	<SettingSection>
		<img src="{FlatOnTarget}">
		<div class="justify-self-start">
			<h5>Show Flat Check on Target</h5>
			<p>
				Shows flat check DC and reason when targeting a token. <br>
				With a token selected, this will use the selected actor's senses (low-light/darkvision) and include conditions like Dazzled.
			</p>
			<SettingInput key="flat-check-target-marker" label="Mode" />
			<div class="mb-1"></div>
			<SettingInput key="flat-check-target-marker-display" label="Display" />
		</div>
	</SettingSection>

	<SettingSection>
			<div class="col-span-2 mx-[10%]">
			<h5>Configure Flat Checks</h5>
			<p>You can turn off which flat checks are shown in messages and on tokens.</p>
			<p>Note: Light level flat checks are disabled by default and need to be enabled here.</p>
			<button onclick={() => new FlatMessageConfigApplication().render(true)}>
				<i class="fa-solid fa-gears"></i> Open Config
			</button>
		</div>
	</SettingSection>

	<SettingSection>
		<img src="{LightVis}">
		<div class="justify-self-start">
			<h5>Light Level Visualization</h5>
			<p>
				Hold <kbd>Alt</kbd> to highlight squares with <span class="text-yellow-700 dark:text-yellow-500">dim light</span>
				or in <span class="text-red-500">darkness</span>.
			</p>
			<SettingInput key="light-level-vis" label="Enabled" />
		</div>
	</SettingSection>

	<SettingSection>
		<div class="col-span-2 mx-[10%]">
			<h5 class="text-center">Compatibility</h5>
			<strong>PF2e Visioner Support</strong>
			<p>
				If PF2e Visioner is enabled and target flat checks are enabled, Visioner's detection states will also be used for flat checks.
			</p>
		</div>
	</SettingSection>
</main>

<script lang="ts">
import { FlatMessageConfigApplication } from "src/modules/flat/message-config"
import SettingInput from "./component/setting-input.svelte"
import SettingSection from "./component/setting-section.svelte"
import FlatHiddenRoll from "./img/flat-hidden.roll.webp"
import FlatInMessage from "./img/flat-in-message.webp"
import FlatOnTarget from "./img/flat-on-target.webp"
import LightVis from "./img/light-vis.webp"

const sectionStyle = "grid grid-cols-2 gap-2 py-2 my-3 items-center even:bg-gray-500/25"
</script>

<style scoped>
	img {
		max-width: 300px;
		border-radius: 5px;
		justify-self: center;
	}
</style>
