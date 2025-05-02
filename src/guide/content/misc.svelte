<h3>Miscellaneous</h3>

<div class="mx-[10%]">


	<h5>Alternative Roll Breakdowns</h5>
	<p>
		The system hides all roll modifiers from players. With this enabled, base and total modifiers remain hidden while others are revealed.
	</p>

	<SettingInput key="script-alt-roll-breakdown" label="Enabled" />

	<div class="flex justify-center gap-1">
		<figure>
			<img src="{ImgGM}">
			<figcaption>GM View</figcaption>
		</figure>
		<figure>
			<img src="{ImgPlayer}">
			<figcaption>Player View</figcaption>
		</figure>
	</div>

	<hr>

	<h5>Automatic Shared Vision Toggle</h5>
	<p>Automatically turns Shared Party Vision off when combat starts, and turns it back on when combat ends.</p>
	<p>
		Why? In exploration, being stuck at the back without seeing what's going on isn't fun.
		But in combat, having shared vision constantly on is confusing, as it becomes hard to tell what you can see versus what the whole party sees.
	</p>


	<SettingInput key="script-toggle-shared-vision" label="Enabled" />
</div>

	<script lang="ts">
import ImgGM from "./img/alt-roll-gm.webp"
import ImgPlayer from "./img/alt-roll-player.webp"
import Important from "./component/important.svelte"
import SettingInput from "./component/setting-input.svelte"
</script>
