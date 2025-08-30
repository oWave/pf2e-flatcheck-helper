<h3 class="ml-4">Delay</h3>

<main>
	<SettingSection>
		<div class="col-span-2 mx-[10%]">
			<p>
				"Good enough" delay implementation. <br>
				Pressing any of the delay buttons (see below) ends the current creature's turn and marks it as delaying. <br>
				Pressing it again returns the creature to initiative by moving it after the current turn.
			</p>
			<SettingInput key="delay-create-message" label="Delay/Return Creates Chat Message" />
		</div>
	</SettingSection>

	<SettingSection>
		<img src="{ImgButton}">
		<div>
			<SettingInput key="delay-combat-tracker" label="Show Delay Button in Combat Tracker" />
		</div>
	</SettingSection>

	<SettingSection>
		<img src="{ImgHudButton}" class="rounded!">
		<div>
			<div class="mb-1">
				<SettingInput key="delay-token-hud" label="Show Delay Button in Token HUD" />
				<div>The Token HUD shows up when you right click a token.</div>
			</div>
			<div class="mb-1">
				<SettingInput key="token-hud-remove-combat-toggle" label="Remove Combat Toggle from HUD for tokens in combat" />
			</div>

			<hr class="my-4">

			<p>
				You can also delay (and return) by using the Delay action. <br>
				Any action with the slug (in the Rules tab) set to <code>delay</code> will work.
			</p>
		</div>
	</SettingSection>

	<SettingSection>
		<div class="col-span-2 mx-[10%]">
			<h5 class="text-center">Variants</h5>
			<div class="mb-2">
				<SettingInput key="delay-prompt" label="Prompt for new initiative" />
				<div>
					Often you already know where you want your new turn to be. This variant asks which creature to delay after, skipping the need to wait for the right turn. <br>
					You can still return early by using the return button.
				</div>
			</div>
			<div class="mb-1">
				<SettingInput key="delay-return" label="Disable returning" invert />
				<div>Makes delaying just a marker.</div>
			</div>
		</div>
	</SettingSection>

	<SettingSection>
		<div class="col-span-2 mx-[10%]">
			<h5 class="text-center">Compatibility</h5>
			<div>
				<SettingInput key="pf2e-hud-enable" label="Modify PF2e HUD" />
				<div>Overrides PF2e HUD's delay handling. The delay button in PF2e HUD's combat tracker will work similarly to the one in the default tracker.</div>
				<strong>Please do not report issues to PF2e HUD with this setting enabled!</strong>
			</div>
		</div>
	</SettingSection>

</main>

<script lang="ts">
import SettingInput from "./component/setting-input.svelte"
import SettingSection from "./component/setting-section.svelte"
import ImgButton from "./img/delay-button.webp"
import ImgHudButton from "./img/delay-hud-button.webp"

const sectionStyle =
	"grid grid-cols-2 gap-2 py-2 my-3 items-center even:bg-gray-500/25 dark:even:bg-gray-500/15"
</script>

<style scoped>
	img {
		max-width: 300px;
		justify-self: center;
	}
</style>
