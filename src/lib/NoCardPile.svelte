<script lang="ts">
import { getContext } from "svelte";

export let bg: string = '';

const classNames = [
	'position',
	'border',
	'border-1',
	'border-black',
	'rounded-md',
	'flex',
	'flex-col',
	'items-center',
	'justify-center',
	'pointer-events-none',
	bg,
	bg === '' ? 'text-black' : 'text-white',
	bg === '' ? 'text-2xl' : 'text-sm',
];

const cardWidth = getContext('cardWidth');
const cardHeight = getContext('cardHeight');
</script>

<div
	style:width="{cardWidth}px"
	style:height="{cardHeight}px"
	class={classNames.join(' ')}>
	<slot />
</div>