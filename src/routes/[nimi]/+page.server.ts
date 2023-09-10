import { error } from '@sveltejs/kit';
import type { Linku } from '$lib/types';
import { distance } from 'fastest-levenshtein';

import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, params }) => {
	const data: Linku = await fetch('/data/linku').then(res => res.json());

	const word = data.data[params.nimi];

	if (!word) {
		const closest = Object.keys(data.data)
			.map(word => ({
				word,
				distance: distance(word, params.nimi)
			}))
			.filter(
				({ word, distance }) => distance < 3 || word.startsWith(params.nimi)
			)
			.sort((a, b) => a.distance - b.distance)
			.slice(0, 10)
			.map(({ word }) => word);

		if (params.nimi.length >= 15) {
			if (params.nimi.length >= 10) closest.pop();
			closest.push('kijetesantakalu');
		}

		throw error(404, {
			message: 'Not found',
			closest
		});
	}

	return word;
}) satisfies PageServerLoad;
