import { error } from '@sveltejs/kit';
import { getTrendDay, trendDays } from '$lib/trends';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => {
	return trendDays.map((d) => ({ date: d.date }));
};

export const load: PageLoad = ({ params }) => {
	const day = getTrendDay(params.date);
	if (!day) error(404, 'Not found');
	return { day };
};
