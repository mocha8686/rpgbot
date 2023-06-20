<script lang="ts">
	import { z } from 'zod';

	const COVER_MODIFIER = -0.4;
	const FLANKING_MODIFIER = 0.6;

	const cellSchema = z.enum(['player', 'wall', 'enemy', 'empty']);
	const fieldSchema = cellSchema.array().array();

	type Cell = z.infer<typeof cellSchema>;
	type Field = z.infer<typeof fieldSchema>;
	type Point = [number, number];
	type Cover = {
		north: boolean;
		south: boolean;
		east: boolean;
		west: boolean;
	};
	type Unit = {
		id: string;
		position: Point;
	};

	const map = [
		'WWWWWWWWWW',
		'W----WW--W',
		'W--------W',
		'W--W-----W',
		'W--W---W-W',
		'W--W-----W',
		'W-WW---W-W',
		'W-WW-----W',
		'W--------W',
		'WWWWWWWWWW',
	];

	const player: Unit = {
		id: crypto.randomUUID(),
		position: [2, 2],
	};
	const enemy: Unit = {
		id: crypto.randomUUID(),
		position: [7, 7],
	};
	const field = fieldSchema.parse(map.map((row) => row.split('').map(parseToCell)));
	setCellAtPosition(field, player.position, 'player');
	setCellAtPosition(field, enemy.position, 'enemy');

	function calculateAimModifier(field: Field): number {
		const playerPosition = findFirstIndexOf(field, 'player');
		const enemyPosition = findFirstIndexOf(field, 'enemy');

		if (!playerPosition || !enemyPosition) return NaN;

		const playerCover = calculateCover(field, playerPosition);
		/// FIXME: disallow step out if enemy is to the rear
		const stepOutPositions = [playerPosition];
		if (playerCover.north || playerCover.south) {
			const westPos: Point = [playerPosition[0] - 1, playerPosition[1]];
			if (getCellAtPosition(field, westPos) === 'empty') stepOutPositions.push(westPos);

			const eastPos: Point = [playerPosition[0] + 1, playerPosition[1]];
			if (getCellAtPosition(field, eastPos) === 'empty') stepOutPositions.push(eastPos);
		}

		if (playerCover.east || playerCover.west) {
			const northPos: Point = [playerPosition[0], playerPosition[1] - 1];
			if (getCellAtPosition(field, northPos) === 'empty') stepOutPositions.push(northPos);

			const southPos: Point = [playerPosition[0], playerPosition[1] + 1];
			if (getCellAtPosition(field, southPos) === 'empty') stepOutPositions.push(southPos);
		}

		const modifiers = stepOutPositions.map((playerPosition) => {
			// Line of sight

			const [coverModifier, flankingModifier] = calculateCoverModifiers(
				field,
				playerPosition,
				enemyPosition
			);

			// Good angle

			return coverModifier + flankingModifier;
		});

		return Math.max(...modifiers);
	}

	function calculateCoverModifiers(
		field: Field,
		playerPosition: Point,
		enemyPosition: Point
	): [number, number] {
		const cover = calculateCover(field, enemyPosition);

		console.debug(cover);

		if (
			(cover.north && playerPosition[1] < enemyPosition[1]) ||
			(cover.south && playerPosition[1] > enemyPosition[1]) ||
			(cover.east && playerPosition[0] > enemyPosition[0]) ||
			(cover.west && playerPosition[0] < enemyPosition[0])
		)
			return [COVER_MODIFIER, 0];

		return [0, FLANKING_MODIFIER];
	}

	function calculateCover(field: Field, position: Point): Cover {
		return {
			north: getCellAtPosition(field, [position[0], position[1] - 1]) === 'wall',
			south: getCellAtPosition(field, [position[0], position[1] + 1]) === 'wall',
			east: getCellAtPosition(field, [position[0] + 1, position[1]]) === 'wall',
			west: getCellAtPosition(field, [position[0] - 1, position[1]]) === 'wall',
		};
	}

	function findFirstIndexOf(field: Field, cell: Cell): Point | undefined {
		for (let y = 0; y < field.length; y++) {
			for (let x = 0; x < field[y].length; x++) {
				if (getCellAtPosition(field, [x, y]) === cell) return [x, y];
			}
		}

		return undefined;
	}

	function getCellAtPosition(field: Field, position: Point): Cell | undefined {
		return field.at(position[1])?.at(position[0]);
	}

	function setCellAtPosition(field: Field, position: Point, cell: Cell) {
		field[position[1]][position[0]] = cell;
	}

	function parseToCell(input: string): Cell {
		switch (input) {
			case 'W':
				return 'wall';
			case '-':
			default:
				return 'empty';
		}
	}

	function cellToDisplayString(cell: Cell): string {
		switch (cell) {
			case 'player':
				return '🧍';
			case 'wall':
				return '■';
			case 'enemy':
				return '👺';
			case 'empty':
				return '';
		}
	}

	function updatePlayerPosition(newX: number, newY: number) {
		if (getCellAtPosition(field, [newX, newY]) !== 'empty') return;

		const oldPlayerPosition = findFirstIndexOf(field, 'player');

		if (oldPlayerPosition) setCellAtPosition(field, oldPlayerPosition, 'empty');
		setCellAtPosition(field, [newX, newY], 'player');
	}

	$: aimModifier = calculateAimModifier(field);
</script>

<h1>Fight</h1>

<div
	class="field"
	style:grid-template-rows={`repeat(${map.length}, 2rem)`}
	style:grid-template-columns={`repeat(${map[0].length}, 2rem)`}
>
	{#each field as cols, y}
		{#each cols as cell, x}
			<button class:wall={cell === 'wall'} on:click={() => updatePlayerPosition(x, y)}
				>{cellToDisplayString(cell)}</button
			>
		{/each}
	{/each}
</div>

<p>Aim modifier: {`${(aimModifier * 100).toFixed(2)}%`}</p>

<style lang="scss">
	.field {
		display: grid;
		width: fit-content;
		grid-template-columns: repeat(10, 2rem);
		grid-template-rows: repeat(10, 2rem);

		border: 1px solid black;

		& > * {
			text-align: center;
			border: 1px solid black;

			&.wall {
				background-color: black;
			}
		}
	}
</style>
