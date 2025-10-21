import { read } from '$app/server';
import UbuntuSansVariable from '$lib/server/fonts/Ubuntu-Sans.ttf';
import { Resvg } from '@resvg/resvg-js';
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import satori from 'satori';
import { html } from 'satori-html';
import { render } from 'svelte/server';
import z from 'zod';
import templates from '../../../templates/index.js';
import { applyDefaultFlexStyle, applyNumericDimensions } from './(utils)/index.js';

const fontData = read(UbuntuSansVariable).arrayBuffer();

const allowedFormats = z.union([
	z.object({
		format: z.literal('png').optional(),
		scale: z.coerce.number().min(1).max(10).optional()
	}),
	z.object({ format: z.literal('svg') })
]);

export const GET: RequestHandler = async (event) => {
	const templateId = event.params.template;
	const parsedFormat = allowedFormats.safeParse(Object.fromEntries(event.url.searchParams));

	if (!parsedFormat.success) {
		return new Response(parsedFormat.error.message, { status: 400 });
	}

	const template = templates.find((t) => t.id === templateId);
	if (!template) {
		return new Response(
			'Template not found, available templates: ' + templates.map((t) => t.id).join(', '),
			{ status: 404 }
		);
	}

	const {
		success,
		data: inputProps,
		error: templateError
	} = template.schema.safeParse(Object.fromEntries(event.url.searchParams));

	if (!success) {
		return new Response(`Invalid template input: ${templateError.message}`, { status: 400 });
	}

	const renderedComponent = render(template.component, {
		props: inputProps
	});

	const reactLike = applyNumericDimensions(
		applyDefaultFlexStyle(html(renderedComponent.head + renderedComponent.body))
	);

	let svg: string;
	try {
		svg = await satori(reactLike as React.ReactNode, {
			width: template.width,
			height: template.height,
			fonts: [
				{
					name: 'Ubuntu Sans',
					data: await fontData
				}
			]
		});
	} catch (err) {
		console.error(err);
		error(500, 'Error generating image (Satori)');
	}

	const format = parsedFormat.data?.format || 'svg';
	switch (format) {
		case 'png': {
			const scale =
				parsedFormat.data &&
				'scale' in parsedFormat.data &&
				typeof parsedFormat.data.scale === 'number'
					? parsedFormat.data.scale
					: 1;
			const png = new Resvg(svg, {
				fitTo: { mode: 'width', value: template.width * scale }
			})
				.render()
				.asPng();

			return new Response(Buffer.from(png), {
				headers: {
					'Content-Type': 'image/png',
					'Cache-Control': 'public, max-age=3600'
				}
			});
		}
		case 'svg':
			return new Response(svg, {
				headers: {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'public, max-age=3600'
				}
			});
	}
};
