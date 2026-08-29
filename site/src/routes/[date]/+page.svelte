<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const day = $derived(data.day);
</script>

<svelte:head>
	<title>{day.date} トレンド | Daily Trends</title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
	<div class="navbar bg-base-100 shadow-sm">
		<div class="mx-auto flex w-full max-w-3xl items-center gap-2 px-4">
			<a href="{base}/" class="btn btn-ghost btn-sm gap-1">
				<Icon icon="mdi:arrow-left" />
				一覧へ
			</a>
			<span class="text-lg font-bold">{day.date} トレンド</span>
		</div>
	</div>

	<main class="mx-auto max-w-3xl space-y-8 px-4 py-8">
		{#each day.categories as cat (cat.name)}
			<section>
				<h2 class="mb-3 text-xl font-bold">{cat.name}</h2>
				<div class="space-y-3">
					{#each cat.items as item (item.url)}
						<div class="card bg-base-100 shadow-sm">
							<div class="card-body">
								<a
									href={item.url}
									target="_blank"
									rel="noopener noreferrer"
									class="card-title link link-hover text-base"
								>
									{item.title_ja}
									<Icon icon="mdi:open-in-new" class="inline text-sm opacity-60" />
								</a>
								<p class="text-base-content/80">{item.summary_ja}</p>
								{#if item.bullets?.length}
									<div class="collapse-arrow collapse mt-2 bg-base-200">
										<input type="checkbox" />
										<div class="collapse-title text-sm font-medium">詳細を見る</div>
										<div class="collapse-content text-sm">
											<ul class="list-disc space-y-1 pl-5">
												{#each item.bullets as bullet}
													<li>{bullet}</li>
												{/each}
											</ul>
											{#if item.implication}
												<p class="mt-2">
													<span class="font-semibold">業務への示唆:</span>
													{item.implication}
												</p>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</main>
</div>
