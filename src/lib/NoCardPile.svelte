<script lang="ts">
  import { getContext } from "svelte";


const classNames = [
	'position',
	'border',
	'border-1',
	'border-black',
	'rounded-md',
	'flex',
	'flex-col',
	'items-center',
	'text-3xl',
	'justify-center',
	'pointer-events-none',
];

const cardWidth = getContext('cardWidth');
const cardHeight = getContext('cardHeight');
</script>

<div
	style:width="{cardWidth}px"
	style:height="{cardHeight}px"
	class={classNames.join(' ')}>
</div>