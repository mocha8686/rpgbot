<script lang="ts">
	const FLANKING_MODIFIER = 0.6;
	const COVER_MODIFIER = -0.4;

	const MAP = [
		'---W---W--',
		'----------',
		'--WW--W---',
		'--WW----W-',
		'--WW----W-',
		'----------',
		'--W-------',
		'--W--WW---',
		'----------',
		'---WWW----',
	];

	type Cell = 'wall' | 'empty';
	type UnitType = 'player' | 'enemy';
	type Cover = {
		north: boolean;
		south: boolean;
		east: boolean;
		west: boolean;
	};

	class Field {
		private map: Cell[][];

		constructor(size: number) {
			this.map = new Array(size).fill(0).map((_) => new Array(size).fill(0));
		}

		getMap(): Cell[][] {
			return structuredClone(this.map);
		}

		getCell(position: Point): Cell | undefined {
			return this.map.at(this.map.length - 1 - position.y)?.at(position.x);
		}

		static parse(map: string[]): Field {
			const field = new Field(map.length);
			field.map = map.map((row) =>
				row.split('').map((val) => {
					switch (val) {
						case 'W':
							return 'wall';
						case '-':
						default:
							return 'empty';
					}
				})
			);
			return field;
		}
	}

	class Unit {
		field: Field;
		type: UnitType;
		position: Point;

		constructor(field: Field, type: UnitType, position: Point) {
			this.field = field;
			this.type = type;
			this.position = position;
		}

		calculateAimModifier(target: Unit): number {
			return Math.max(
				...[this.position, ...this.calculateStepOuts(target)]
					.filter((position) => this.moved(position).canSee(target))
					.map(this.moved.bind(this))
					.map((attacker) => {
						// cover/flanking
						const coverOrFlankingModifier = attacker.isFlanking(target)
							? FLANKING_MODIFIER
							: COVER_MODIFIER;

						// TODO: good angle

						return coverOrFlankingModifier;
					})
			);
		}

		calculateStepOuts(target: Unit): Point[] {
			if (target.isFlanking(this)) return [];

			const cover = this.calculateCover();
			const stepOuts = [];

			if (cover.north || cover.south) {
				const westPosition = new Point(this.position.x - 1, this.position.y);
				const westCell = this.field.getCell(westPosition);
				if (westCell === 'empty') stepOuts.push(westPosition);

				const eastPosition = new Point(this.position.x + 1, this.position.y);
				const eastCell = this.field.getCell(eastPosition);
				if (eastCell === 'empty') stepOuts.push(eastPosition);
			}

			if (cover.east || cover.west) {
				const northPosition = new Point(this.position.x, this.position.y + 1);
				const northCell = this.field.getCell(northPosition);
				if (northCell === 'empty') stepOuts.push(northPosition);

				const southPosition = new Point(this.position.x, this.position.y - 1);
				const southCell = this.field.getCell(southPosition);
				if (southCell === 'empty') stepOuts.push(southPosition);
			}

			return stepOuts;
		}

		isFlanking(target: Unit): boolean {
			const cover = target.calculateCover();
			if (
				(cover.north && this.position.y > target.position.y) ||
				(cover.south && this.position.y < target.position.y) ||
				(cover.east && this.position.x > target.position.x) ||
				(cover.west && this.position.x < target.position.x)
			)
				return false;
			return true;
		}

		calculateCover(): Cover {
			return {
				north:
					this.field.getCell(new Point(this.position.x, this.position.y + 1)) === 'wall',
				south:
					this.field.getCell(new Point(this.position.x, this.position.y - 1)) === 'wall',
				east:
					this.field.getCell(new Point(this.position.x + 1, this.position.y)) === 'wall',
				west:
					this.field.getCell(new Point(this.position.x - 1, this.position.y)) === 'wall',
			};
		}

		canSee(target: Unit): boolean {
			// https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
			const dx = target.position.x - this.position.x;
			const dy = target.position.y - this.position.y;
			const steps = Math.max(Math.abs(dx), Math.abs(dy));

			const xIncrement = dx / steps;
			const yIncrement = dy / steps;

			let x = this.position.x;
			let y = this.position.y;
			for (let i = 0; i < steps; i++) {
				x += xIncrement;
				y += yIncrement;

				const position = new Point(Math.round(x), Math.round(y));
				const cell = this.field.getCell(position);

				if (cell !== 'empty') return false;
			}

			return true;
		}

		moved(position: Point): Unit {
			return new Unit(this.field, this.type, position);
		}
	}

	class Point {
		x: number;
		y: number;

		constructor(x: number, y: number) {
			this.x = x;
			this.y = y;
		}

		toString(): string {
			return `(${this.x}, ${this.y})`;
		}
	}

	const field = Field.parse(MAP);
	let player = new Unit(field, 'player', new Point(1, 1));
	const enemy1 = new Unit(field, 'enemy', new Point(7, 7));
	const enemy2 = new Unit(field, 'enemy', new Point(2, 1));

	type DisplayCell = Cell | UnitType;
	function getDisplayField(field: Field, units: Unit[]): DisplayCell[][] {
		const displayField: DisplayCell[][] = field.getMap();
		for (const unit of units) {
			displayField[displayField.length - 1 - unit.position.y][unit.position.x] = unit.type;
		}
		return displayField;
	}

	function displayCellToString(displayCell: DisplayCell): string {
		switch (displayCell) {
			case 'wall':
				return '';
			case 'empty':
				return '';
			case 'player':
				return '🧍';
			case 'enemy':
				return '👹';
		}
	}

	$: displayField = getDisplayField(field, [player, enemy1, enemy2]);
	$: enemy1AimModifier = player.calculateAimModifier(enemy1);
	$: enemy2AimModifier = player.calculateAimModifier(enemy2);
</script>

<h1>Fight</h1>

<div
	class="field"
	style:grid-template-rows={`repeat(${MAP.length}, 1fr)`}
	style:grid-template-columns={`repeat(${MAP[0].length}, 1fr)`}
>
	{#each displayField as rows, row}
		{#each rows as cell, x}
			<button
				on:click={() => {
					if (cell === 'empty') player = player.moved(new Point(x, MAP.length - 1 - row));
				}}
				disabled={cell !== 'empty'}
				class:wall={cell === 'wall'}>{displayCellToString(cell)}</button
			>
		{/each}
	{/each}
</div>

<p>
	Enemy 1 {enemy1.position.toString()} aim mod: {enemy1AimModifier * 100}%
</p>
<p>
	Enemy 2 {enemy2.position.toString()} aim mod: {enemy2AimModifier * 100}%
</p>

<style lang="scss">
	.field {
		display: grid;
		width: fit-content;

		border: 1px solid black;

		& > * {
			border: 1px solid black;
			width: 2rem;
			aspect-ratio: 1;
			font-size: 1.5rem;
			text-align: center;

			&.wall {
				background-color: black;
			}
		}
	}
</style>
