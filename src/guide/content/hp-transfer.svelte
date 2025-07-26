<h3>HP Transfer Effects</h3>

<div class="grid grid-cols-2 gap-2 gap-y-4 items-center">
	<img src={Img} class="justify-self-center">
	<div>
		<p>
			Adds buttons in chat to automate the effects of Life Link, Share Life and Spirit Link.
			<Important>The math for this will be wrong if damage reduces a creature below 0 HP</Important>
		</p>
		<SettingInput key="lifelink" label="Enabled"></SettingInput>
		<SettingInput key="lifelink-formular" label="Lifelink Formular"></SettingInput>
	</div>

	<div class="col-span-2 mx-[10%]">
		<strong>Setup</strong>
		<ol class="m-0!">
			<li>Open and edit the description of a spell.</li>
			<li>Open the <a class="underline" onclick={() => game.packs.get("pf2e-flatcheck-helper.Effects")?.render(true)}>effects compedium pack</a> of this module.</li>
			<li>Drag and drop the effect into the spell's description. It will create a link that looks like <code>@UUID[...]{"{Share Life}"}</code></li>
			<li>Save the edited description.</li>
		</ol>
		<p>
			The spell effect has to be dragged onto the target from the spell card posted to chat (or from the actor sheet). Just using the effect from the compedium pack will not work.
		</p>
	</div>
</div>

<script lang="ts">
import Img from "src/guide/content/img/hp-transfer.webp"
import Important from "./component/important.svelte"
import SettingInput from "./component/setting-input.svelte"
</script>
