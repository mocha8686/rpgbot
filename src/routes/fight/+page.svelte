<script lang="ts">
	const MAP = [
		'---W---W--',
		'----------',
		'--WW--W---',
		'--WW----W-',
		'--WW----W-',
		'----------',
		'--W-------',
		'--W-WWWW--',
		'----------',
		'---WWW----',
	];

	type Cell = 'wall' | 'empty';
	type UnitType = 'player' | 'enemy';

	class Field {
		map: Cell[][];
		player: Unit;
		enemies: Unit[];

		constructor(size: number, player: Unit, enemies: Unit[]) {
			this.map = new Array(size).fill(0).map((_) => new Array(size).fill(0));
			this.player = player;
			this.enemies = enemies;
		}

		static parse(map: string[], player: Unit, enemies: Unit[]): Field {
			const field = new Field(map.length, player, enemies);
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
		type: UnitType;
		position: Point;

		constructor(type: UnitType, position: Point) {
			this.type = type;
			this.position = position;
		}

		move(position: Point) {
			this.position = position;
		}
	}

	class Point {
		x: number;
		y: number;

		constructor(x: number, y: number) {
			this.x = x;
			this.y = y;
		}
	}

	const player = new Unit('player', new Point(1, 1));
	const enemy1 = new Unit('enemy', new Point(8, 8));
	const enemy2 = new Unit('enemy', new Point(1, 6));
	const field = Field.parse(MAP, player, [enemy1, enemy2]);
</script>

<h1>Fight</h1>

<div class="field" />

<style lang="scss">
	.field {
		display: grid;
		width: fit-content;

		border: 1px solid black;
	}
</style>
