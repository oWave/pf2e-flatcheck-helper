<img {...imgPropsForToken(token)} class="{extra}" inert />

<script lang="ts">
import type { TokenDocumentPF2e, TokenPF2e } from "@7h3laughingman/pf2e-types"
import { imgPropsForToken } from "../utils"

interface Props {
	token: TokenPF2e | TokenDocumentPF2e
	class?: string
}
const { token, class: extra }: Props = $props()
</script>

<style>
img {
	height: 48px;
	width: 48px;
	object-fit: cover;
	object-position: 50% 0;
	border-width: 0 !important;
}

</style>
