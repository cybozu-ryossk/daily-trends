<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
	import {
		fetchAdminData,
		createFlag,
		updateFlag,
		deleteFlag,
		createSource,
		updateSource,
		deleteSource,
		ApiError,
		type InterestFlag,
		type Source,
		type Tier
	} from '$lib/interestsApi';
	import { getStoredToken, setStoredToken, clearStoredToken } from '$lib/auth';

	const TIERS: Tier[] = ['core', 'rising', 'watching', 'suppressed'];
	const TIER_LABEL: Record<Tier, string> = {
		core: 'コア',
		rising: '上昇中',
		watching: '監視中',
		suppressed: '収集抑制'
	};

	let token = $state('');
	let tokenInput = $state('');
	let flags = $state<InterestFlag[]>([]);
	let sources = $state<Source[]>([]);
	let loading = $state(false);
	let error = $state('');

	let newFlag = $state<{ label: string; tier: Tier; notes: string }>({
		label: '',
		tier: 'watching',
		notes: ''
	});
	let newSource = $state({ group_name: '', source_type: 'blog', url: '', label: '' });

	token = getStoredToken();

	$effect(() => {
		if (token) load();
	});

	function describeError(e: unknown, fallback: string) {
		if (e instanceof ApiError) return e.status === 401 ? 'トークンが正しくありません' : e.message;
		return e instanceof Error ? e.message : fallback;
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const data = await fetchAdminData(token);
			flags = data.flags;
			sources = data.sources;
		} catch (e) {
			error = describeError(e, '読み込みに失敗しました');
			if (e instanceof ApiError && e.status === 401) logout();
		} finally {
			loading = false;
		}
	}

	function connect() {
		const trimmed = tokenInput.trim();
		if (!trimmed) return;
		token = trimmed;
		setStoredToken(token);
	}

	function logout() {
		token = '';
		tokenInput = '';
		flags = [];
		sources = [];
		clearStoredToken();
	}

	async function addFlag() {
		if (!newFlag.label) return;
		try {
			const created = await createFlag(token, newFlag);
			flags = [...flags, created];
			newFlag = { label: '', tier: 'watching', notes: '' };
		} catch (e) {
			error = describeError(e, '追加に失敗しました');
		}
	}

	async function saveFlag(flag: InterestFlag) {
		try {
			await updateFlag(token, flag.id, { label: flag.label, tier: flag.tier, notes: flag.notes });
		} catch (e) {
			error = describeError(e, '更新に失敗しました');
		}
	}

	async function removeFlag(id: number) {
		if (!confirm('この興味フラグを削除しますか？')) return;
		try {
			await deleteFlag(token, id);
			flags = flags.filter((f) => f.id !== id);
		} catch (e) {
			error = describeError(e, '削除に失敗しました');
		}
	}

	async function addSource() {
		if (!newSource.group_name || !newSource.source_type || !newSource.url) return;
		try {
			const created = await createSource(token, newSource);
			sources = [...sources, created];
			newSource = { group_name: '', source_type: 'blog', url: '', label: '' };
		} catch (e) {
			error = describeError(e, '追加に失敗しました');
		}
	}

	async function saveSource(source: Source) {
		try {
			await updateSource(token, source.id, {
				group_name: source.group_name,
				source_type: source.source_type,
				url: source.url,
				label: source.label,
				notes: source.notes
			});
		} catch (e) {
			error = describeError(e, '更新に失敗しました');
		}
	}

	async function toggleSource(source: Source) {
		const next = source.enabled ? 0 : 1;
		const prev = source.enabled;
		source.enabled = next;
		try {
			await updateSource(token, source.id, { enabled: !!next });
		} catch (e) {
			source.enabled = prev;
			error = describeError(e, '更新に失敗しました');
		}
	}

	async function removeSource(id: number) {
		if (!confirm('この情報ソースを削除しますか？')) return;
		try {
			await deleteSource(token, id);
			sources = sources.filter((s) => s.id !== id);
		} catch (e) {
			error = describeError(e, '削除に失敗しました');
		}
	}
</script>

<svelte:head>
	<title>興味プロファイル管理 | Daily Trends</title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
	<div class="navbar bg-base-100 shadow-sm">
		<div class="mx-auto flex w-full max-w-4xl items-center gap-2 px-4">
			<a href="{base}/" class="btn btn-ghost btn-sm gap-1">
				<Icon icon="mdi:arrow-left" />
				一覧へ
			</a>
			<span class="text-lg font-bold">興味プロファイル管理</span>
			{#if token}
				<button class="btn btn-ghost btn-sm ml-auto" onclick={logout}>ログアウト</button>
			{/if}
		</div>
	</div>

	<main class="mx-auto max-w-4xl space-y-8 px-4 py-8">
		{#if !token}
			<div class="card bg-base-100 mx-auto max-w-md shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-base">管理トークンを入力</h2>
					<input
						type="password"
						class="input input-bordered w-full"
						placeholder="ADMIN_TOKEN"
						bind:value={tokenInput}
						onkeydown={(e) => e.key === 'Enter' && connect()}
					/>
					<button class="btn btn-primary mt-2" onclick={connect}>接続</button>
					{#if error}<p class="text-error mt-1 text-sm">{error}</p>{/if}
				</div>
			</div>
		{:else}
			{#if error}
				<div class="alert alert-error">
					<Icon icon="mdi:alert-circle-outline" />
					<span>{error}</span>
				</div>
			{/if}

			{#if loading}
				<span class="loading loading-spinner"></span>
			{:else}
				<section>
					<h2 class="mb-3 text-xl font-bold">興味フラグ</h2>
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>ラベル</th>
									<th>Tier</th>
									<th>メモ</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each flags as flag (flag.id)}
									<tr>
										<td>
											<input
												class="input input-sm input-bordered w-full"
												bind:value={flag.label}
												onblur={() => saveFlag(flag)}
											/>
										</td>
										<td>
											<select
												class="select select-sm select-bordered"
												bind:value={flag.tier}
												onchange={() => saveFlag(flag)}
											>
												{#each TIERS as t (t)}
													<option value={t}>{TIER_LABEL[t]}</option>
												{/each}
											</select>
										</td>
										<td>
											<input
												class="input input-sm input-bordered w-full"
												bind:value={flag.notes}
												onblur={() => saveFlag(flag)}
											/>
										</td>
										<td>
											<button
												class="btn btn-ghost btn-sm text-error"
												onclick={() => removeFlag(flag.id)}
												aria-label="削除"
											>
												<Icon icon="mdi:delete-outline" />
											</button>
										</td>
									</tr>
								{/each}
								<tr>
									<td>
										<input
											class="input input-sm input-bordered w-full"
											placeholder="新規ラベル"
											bind:value={newFlag.label}
										/>
									</td>
									<td>
										<select class="select select-sm select-bordered" bind:value={newFlag.tier}>
											{#each TIERS as t (t)}
												<option value={t}>{TIER_LABEL[t]}</option>
											{/each}
										</select>
									</td>
									<td>
										<input
											class="input input-sm input-bordered w-full"
											placeholder="メモ"
											bind:value={newFlag.notes}
										/>
									</td>
									<td>
										<button class="btn btn-primary btn-sm" onclick={addFlag} aria-label="追加">
											<Icon icon="mdi:plus" />
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<h2 class="mb-3 text-xl font-bold">情報ソース</h2>
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>有効</th>
									<th>グループ</th>
									<th>種別</th>
									<th>URL</th>
									<th>ラベル</th>
									<th>メモ</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each sources as source (source.id)}
									<tr class={source.enabled ? '' : 'opacity-50'}>
										<td>
											<input
												type="checkbox"
												class="toggle toggle-sm"
												checked={!!source.enabled}
												onchange={() => toggleSource(source)}
												aria-label="有効/無効"
											/>
										</td>
										<td>
											<input
												class="input input-sm input-bordered w-32"
												bind:value={source.group_name}
												onblur={() => saveSource(source)}
											/>
										</td>
										<td>
											<input
												class="input input-sm input-bordered w-28"
												bind:value={source.source_type}
												onblur={() => saveSource(source)}
											/>
										</td>
										<td>
											<input
												class="input input-sm input-bordered w-56"
												bind:value={source.url}
												onblur={() => saveSource(source)}
											/>
										</td>
										<td>
											<input
												class="input input-sm input-bordered w-40"
												bind:value={source.label}
												onblur={() => saveSource(source)}
											/>
										</td>
										<td>
											<input
												class="input input-sm input-bordered w-40"
												bind:value={source.notes}
												onblur={() => saveSource(source)}
											/>
										</td>
										<td>
											<button
												class="btn btn-ghost btn-sm text-error"
												onclick={() => removeSource(source.id)}
												aria-label="削除"
											>
												<Icon icon="mdi:delete-outline" />
											</button>
										</td>
									</tr>
								{/each}
								<tr>
									<td></td>
									<td>
										<input
											class="input input-sm input-bordered w-32"
											placeholder="グループ"
											bind:value={newSource.group_name}
										/>
									</td>
									<td>
										<input
											class="input input-sm input-bordered w-28"
											placeholder="種別"
											bind:value={newSource.source_type}
										/>
									</td>
									<td>
										<input
											class="input input-sm input-bordered w-56"
											placeholder="URL"
											bind:value={newSource.url}
										/>
									</td>
									<td>
										<input
											class="input input-sm input-bordered w-40"
											placeholder="ラベル"
											bind:value={newSource.label}
										/>
									</td>
									<td></td>
									<td>
										<button class="btn btn-primary btn-sm" onclick={addSource} aria-label="追加">
											<Icon icon="mdi:plus" />
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p class="text-base-content/60 mt-2 text-sm">
						種別: hatena / hn / blog / hf-papers / reddit / script-zenn / script-qiita
					</p>
				</section>
			{/if}
		{/if}
	</main>
</div>
