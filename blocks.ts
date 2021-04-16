import {World} from "./world";
import {Color} from "./utils";

export interface Block {
    tick(world: World, x: number, y: number): void;

    replaceable(block: Block): boolean;

    getColor(): Color;
}

export class BlockAir implements Block {
    private readonly color = new Color(10, 10, 10);

    replaceable(block: Block) {
        return true;
    }

    getColor(): Color {
        return this.color;
    }

    tick(world: World, x: number, y: number): void {
    }
}

export class BlockSand implements Block {
    private readonly color = new Color(76, 70, 50);
    private readonly velocity = 2;
    tick(w: World, x: number, y: number) {
        let yNew=y + 1;
        if (this.tryReplace(w, x, yNew)
            || this.tryReplace(w, x - 1, yNew)
            || this.tryReplace(w, x + 1, yNew)) {
            w.setBlock(x, y, BlockInstances.AIR);
        }
    }

    tryReplace(world: World, x: number, y: number): boolean {
        if (world.isInBounds(x, y)) {
            if (world.getBlock(x, y).replaceable(this)) {
                world.setBlock(x, y, this);
                return true;
            }
        }
        return false;
    }

    getColor(): Color {
        return this.color;
    }

    replaceable(block: Block): boolean {
        return false;
    }
}

export class BlockInstances {
    static SAND = new BlockSand();
    static AIR = new BlockAir();
}
