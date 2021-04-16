import {World} from "./world";
import {BlockInstances, BlockSand} from "./blocks";

export default class ParticleSystem {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
    world: World;

    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.canvas = canvas;
        canvas.width=width;
        canvas.height=height;
        this.width = width;
        this.height = height;
        this.context = canvas.getContext("2d");
        this.world = new World(width, height);
        canvas.addEventListener("mousemove", (evt)=>{
            let x=Math.floor(evt.offsetX/this.canvas.clientWidth*this.width);
            let y=Math.floor(evt.offsetY/this.canvas.clientHeight*this.height);
            this.world.setBlock(x,y,BlockInstances.SAND);
            console.log(`placed block: (${x},${y})`);
        });
    }

    run() {
        this.frame();
    }

    frame() {
        this.world.setBlock(50,0,BlockInstances.SAND);
        let t1 = performance.now();
        this.world.tick();
        this.render();
        let t2 = performance.now();
        window.fps.innerHTML=`Frame processed in ${t2 - t1}ms, ${1000 / (t2 - t1)}fps`;
        requestAnimationFrame(()=>this.frame());
    }

    render(){
        let blocks=this.world.blocks;
        let len=blocks.length;
        let arr=new Uint8ClampedArray(len*4);
        while (len--){
            let b=blocks[len];
            let c=b.getColor();
            arr[len*4]=c.r;
            arr[len*4+1]=c.g;
            arr[len*4+2]=c.b;
            arr[len*4+3]=128;
        }
        let data=this.context.createImageData(this.width,this.height);
        data.data.set(arr);
        this.context.putImageData(data,0,0)
    }
}
