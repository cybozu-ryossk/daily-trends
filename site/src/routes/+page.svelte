<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { trendDays, totalItemCount } from '$lib/trends';
</script>

<svelte:head>
	<title>Daily Trends</title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
	<div class="navbar bg-base-100 shadow-sm">
		<div class="mx-auto flex w-full max-w-3xl items-center gap-2 px-4">
			<Icon icon="mdi:trending-up" class="text-primary text-2xl" />
			<span class="text-lg font-bold">Daily Trends</span>
			<a href="{base}/admin" class="btn btn-ghost btn-sm btn-circle ml-auto" aria-label="興味プロファイル管理">
				<Icon icon="mdi:cog-outline" />
			</a>
		</div>
	</div>

	<main class="mx-auto max-w-3xl px-4 py-8">
		{#if trendDays.length === 0}
			<p class="text-base-content/60">まだ投稿がありません。</p>
		{:else}
			<div class="grid gap-4">
				{#each trendDays as day (day.date)}
					<a
						href="{base}/{day.date}"
						class="card bg-base-100 shadow-sm transition hover:shadow-md"
					>
						<div class="card-body">
							<div class="flex items-center justify-between">
								<h2 class="card-title">{day.date}</h2>
								<span class="badge badge-primary badge-outline">{totalItemCount(day)}件</span>
							</div>
							<div class="mt-1 flex flex-wrap gap-1">
								{#each day.categories as cat (cat.name)}
									<span class="badge badge-ghost badge-sm">{cat.name} ({cat.items.length})</span>
								{/each}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>
