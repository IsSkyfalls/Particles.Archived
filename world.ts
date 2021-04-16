import {Block, BlockInstances, BlockSand} from "./blocks";

export class World {
    blocks: Array<Block>;
    private readonly width: number;
    private readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.blocks = new Array<Block>(this.width * this.height);
        let len=this.blocks.length;
        while (len--){
            this.blocks[len]=BlockInstances.AIR;
        }
    }

    tick() {
        let t1 = performance.now();
        //if we didn't needed the x,y values
        //using a while loop will be faster
        for (let x = this.width-1; x >= 0; x--) {
            for (let y = this.height-1; y >= 0; y--) {
                this.getBlock(x, y).tick(this, x, y);
            }
        }
        let t2 = performance.now();
        //console.log(`Tick processed in ${t2 - t1}ms`);
    }

    getBlock(x: number, y: number) {
        return this.blocks[y * this.height + x];
    }

    setBlock(x: number, y: number, block: Block) {
        this.blocks[y * this.height + x] = block;
    }

    isInBounds(x: number, y: number){
        if(x<0||x>=this.width||y < 0 || y >= this.height){
            return false;
        }
        return true;
    }
}
