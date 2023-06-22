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
		type: Cell;
		position: Point;
	};

	const mapData = [
		'WWWWWWWWWW',
		'W----WW--W',
		'W--------W',
		'W--W---W-W',
		'W--W---W-W',
		'W--W-----W',
		'W-WWW--W-W',
		'W-WWW----W',
		'W--------W',
		'WWWWWWWWWW',
	];
	const map = fieldSchema.parse(mapData.map((row) => row.split('').map(parseToCell)));

	const player: Unit = {
		id: crypto.randomUUID(),
		type: 'player',
		position: [2, 2],
	};
	const enemy1: Unit = {
		id: crypto.randomUUID(),
		type: 'enemy',
		position: [7, 7],
	};
	const enemy2: Unit = {
		id: crypto.randomUUID(),
		type: 'enemy',
		position: [8, 4],
	};
	const enemies = [enemy1, enemy2];

	$: field = placeUnitsOnMap(structuredClone(map), [player, ...enemies]);

	function placeUnitsOnMap(map: Field, units: Unit[]): Field {
		for (const unit of units) {
			setCellAtPosition(map, unit.position, unit.type);
		}
		return map;
	}

	function calculateAimModifier(
		field: Field,
		playerPosition: Point,
		enemyPosition: Point
	): number {
		const playerCover = calculateCover(field, playerPosition);

		const possiblePlayerPositions = [playerPosition];

		if (
			(playerCover.north && enemyPosition[1] < playerPosition[1]) ||
			(playerCover.south && enemyPosition[1] > playerPosition[1])
		) {
			const westPos: Point = [playerPosition[0] - 1, playerPosition[1]];
			if (getCellAtPosition(field, westPos) === 'empty')
				possiblePlayerPositions.push(westPos);

			const eastPos: Point = [playerPosition[0] + 1, playerPosition[1]];
			if (getCellAtPosition(field, eastPos) === 'empty')
				possiblePlayerPositions.push(eastPos);
		}

		if (
			(playerCover.east && enemyPosition[0] > playerPosition[0]) ||
			(playerCover.west && enemyPosition[0] < playerPosition[0])
		) {
			const northPos: Point = [playerPosition[0], playerPosition[1] - 1];
			if (getCellAtPosition(field, northPos) === 'empty')
				possiblePlayerPositions.push(northPos);

			const southPos: Point = [playerPosition[0], playerPosition[1] + 1];
			if (getCellAtPosition(field, southPos) === 'empty')
				possiblePlayerPositions.push(southPos);
		}

		const modifiers = possiblePlayerPositions
			.filter((playerPosition) => {
				// Line of sight
				console.group(JSON.stringify(playerPosition));
				const res = canSee(field, playerPosition, enemyPosition);
				console.groupEnd();
				return res;
			})
			.map((playerPosition) => {
				const [coverModifier, flankingModifier] = calculateCoverModifiers(
					field,
					playerPosition,
					enemyPosition
				);

				// TODO: Good angle

				return coverModifier + flankingModifier;
			});

		if (modifiers.length === 0) return NaN;

		return Math.max(...modifiers);
	}

	function calculateCoverModifiers(
		field: Field,
		playerPosition: Point,
		enemyPosition: Point
	): [number, number] {
		const cover = calculateCover(field, enemyPosition);

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

	function canSee(field: Field, src: Point, dst: Point): boolean {
		// https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
		const dx = dst[0] - src[0];
		const dy = dst[1] - src[1];
		const steps = Math.max(Math.abs(dx), Math.abs(dy));

		const xIncrement = dx / steps;
		const yIncrement = dy / steps;

		let x = src[0];
		let y = src[1];

		for (let i = 0; i < steps; i++) {
			x += xIncrement;
			y += yIncrement;

			const cell = getCellAtPosition(field, [Math.round(x), Math.round(y)]);
			console.debug(`(${Math.round(x)}, ${Math.round(y)}): ${cell}`);
			if (cell === undefined || cell === 'wall') return false;
		}

		return true;
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
		if (getCellAtPosition(field, [newX, newY]) === 'empty') player.position = [newX, newY];
	}

	$: aimModifiers = enemies.map((enemy) =>
		calculateAimModifier(field, player.position, enemy.position)
	);
</script>

<h1>Fight</h1>

<div
	class="field"
	style:grid-template-rows={`repeat(${mapData.length}, 2rem)`}
	style:grid-template-columns={`repeat(${mapData[0].length}, 2rem)`}
>
	{#each field as cols, y}
		{#each cols as cell, x}
			<button class:wall={cell === 'wall'} on:click={() => updatePlayerPosition(x, y)}
				>{cellToDisplayString(cell)}</button
			>
		{/each}
	{/each}
</div>

<p>Aim modifiers:</p>
{#each aimModifiers as aimModifier}
	<p>{`${(aimModifier * 100).toFixed(2)}%`}</p>
{/each}

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
