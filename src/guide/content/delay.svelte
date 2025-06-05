<h3>Delay</h3>

<div class="grid grid-cols-2 gap-2 gap-y-4 items-center">
	<div class="col-span-2 mx-[10%]">
		<p>
			"Good enough" delay implementation. <br>
			Pressing any of the delay buttons (see below) ends the current creature's turn and marks it as delaying. <br>
			Pressing it again returns the creature to initiative by moving it after the current turn.
		</p>
		<SettingInput key="delay-create-message" label="Delay/Return Creates Chat Message" />
	</div>

	<img src="{ImgButton}">
	<div>
		<SettingInput key="delay-combat-tracker" label="Show Delay Button in Combat Tracker" />
	</div>

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
</div>

<script lang="ts">
import SettingInput from "./component/setting-input.svelte"
import ImgButton from "./img/delay-button.webp"
import ImgHudButton from "./img/delay-hud-button.webp"
</script>

<style scoped>
	img {
		max-width: 300px;
		justify-self: center;
	}
</style>
