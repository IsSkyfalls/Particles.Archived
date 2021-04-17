import {BlockType} from "./block";
import {Flags} from "./flags";

let INSTANCE: ParticleSystem;

export default class ParticleSystem {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
    data: Uint8ClampedArray;
    length: number;
    imageData: ImageData;
    tps: number;
    mspt: number;

    constructor(canvas: HTMLCanvasElement, width: number, height: number, tps: number) {
        this.canvas = canvas;
        canvas.width = width;
        canvas.height = height;
        this.width = width;
        this.height = height;
        this.context = canvas.getContext("2d", {alpha: false});
        this.length = width * height * 4;
        this.data = new Uint8ClampedArray(this.length);
        this.data.fill(BlockType.AIR, 0, this.length);
        this.imageData = this.context.getImageData(0, 0, width, height);
        this.tps = tps;
        this.mspt = 1000 / tps;
        INSTANCE = this;

        canvas.addEventListener("mousemove", (evt) => {
            let x = Math.floor(evt.offsetX / this.canvas.clientWidth * this.width) + 1;
            let y = Math.floor(evt.offsetY / this.canvas.clientHeight * this.height) + 1;
            this.setBlock(x, y, BlockType.WATER)
            console.log(`placed block: (${x},${y})`);
        });
    }

    run() {
        INSTANCE.render();
        INSTANCE.update();
    }

    lastFrame: DOMHighResTimeStamp;

    render() {
        let t1 = performance.now();
        let data = INSTANCE.data;
        let cWater = 0
        for (let index = data.length - 1; index > 0; index -= 4) {
            let blockType = data[index] as BlockType;
            switch (blockType) {
                case BlockType.SAND:
                    data[index - 3] = 0xc2;
                    data[index - 2] = 0xb2;
                    data[index - 1] = 0x80;
                    break;
                case BlockType.WATER:
                    data[index - 3] = 0xd4-25;
                    data[index - 2] = 0xf1-25;
                    data[index - 1] = 0xf9+50;
                    cWater++;
                    break;
                case BlockType.AIR:
                default:
                    data[index - 3] = 220;
                    data[index - 2] = 220;
                    data[index - 1] = 220;
            }
        }
        INSTANCE.imageData = INSTANCE.context.getImageData(0, 0, INSTANCE.width, INSTANCE.height);
        INSTANCE.imageData.data.set(INSTANCE.data);
        INSTANCE.context.putImageData(INSTANCE.imageData, 0, 0);
        let now = performance.now();
        window.fps.innerText = `Water: ${cWater}\nThis frame took ${(now - t1).toFixed(2)}ms to render, last frame till now, ${(now - INSTANCE.lastFrame).toFixed(2)}ms has passed, which is about ${(1000 / (now - INSTANCE.lastFrame)).toFixed(2)}fps`;
        INSTANCE.lastFrame = now;
        requestAnimationFrame(INSTANCE.render);
    }

    private update() {
        INSTANCE.setBlock(25, 25, BlockType.SAND);
        INSTANCE.setBlock(50, 25, BlockType.SAND);
        INSTANCE.setBlock(75, 0, BlockType.WATER);
        INSTANCE.setBlock(175, 0, BlockType.WATER);
        INSTANCE.setBlock(1, 0, BlockType.WATER);
        let t1 = performance.now();
        let data = INSTANCE.data;
        let len = INSTANCE.length;
        let w = INSTANCE.width;
        let h = INSTANCE.height;
        let index = len;
        let flags = new Uint8Array(w * h);
        while (index--) {
            let blockType = data[index] as BlockType;
            let currentY = Math.floor(((index + 1) / 4 - 1) / w);
            switch (blockType) {
                case BlockType.SAND: {
                    let belowIndex = index + w * 4;
                    let belowType = data[belowIndex] as BlockType;
                    //for out of bounds
                    //the type is 'undefined'
                    if (belowType == BlockType.WATER || belowType == BlockType.AIR) {
                        data[belowIndex] = blockType;
                        data[index] = belowType;
                    } else {
                        belowIndex -= 4;
                        belowType = data[belowIndex] as BlockType;
                        if (Math.floor(((belowIndex + 1) / 4 - 1) / w) == currentY + 1 //boundary check
                            && (belowType == BlockType.AIR || belowType == BlockType.WATER)) {
                            data[belowIndex] = blockType;
                            data[index] = belowType;
                        } else {
                            belowIndex += 8;
                            belowType = data[belowIndex] as BlockType;
                            if (Math.floor(((belowIndex + 1) / 4 - 1) / w) == currentY + 1 //boundary check
                                && (belowType == BlockType.AIR || belowType == BlockType.WATER)) {
                                data[belowIndex] = blockType;
                                data[index] = belowType;
                            }
                        }
                    }
                    break;
                }
                case BlockType.WATER: {
                    //try fall
                    let belowIndex = index + w * 4;
                    let belowType = data[belowIndex] as BlockType;
                    //for out of bounds
                    //the type is 'undefined'
                    if (belowType == BlockType.AIR) {
                        data[belowIndex] = blockType;
                        data[index] = BlockType.AIR;
                    } else {
                        belowIndex -= 4;
                        belowType = data[belowIndex] as BlockType;
                        if (Math.floor(((belowIndex + 1) / 4 - 1) / w) == currentY + 1 //boundary check
                            && belowType == BlockType.AIR) {
                            data[belowIndex] = blockType;
                            data[index] = BlockType.AIR;
                        } else {
                            belowIndex += 8;
                            belowType = data[belowIndex] as BlockType;
                            if (Math.floor(((belowIndex + 1) / 4 - 1) / w) == currentY + 1 //boundary check
                                && belowType == BlockType.AIR) {
                                data[belowIndex] = blockType;
                                data[index] = BlockType.AIR;
                            } else {
                                //didn't move down, try flowing
                                //try flow
                                if (flags[(index + 1) / 4] & Flags.WATER_PROCESSED) {
                                    //console.log((index+1)/4,"is processed")
                                    continue;
                                }
                                let flowIndex = index - 4;
                                let flowY = Math.floor(((flowIndex + 1) / 4 - 1) / w); //should be doing this on other places but it doesn't hurt as much
                                let flowType = data[flowIndex] as BlockType;
                                //two blocks per tick
                                if (flowType == BlockType.AIR && flowY == currentY) {
                                    // we move along
                                    flowIndex = index - 8;
                                    flowY = Math.floor(((flowIndex + 1) / 4 - 1) / w);
                                    flowType = data[flowIndex] as BlockType
                                    if (flowType != BlockType.AIR || flowY != currentY) {
                                        console.log("blocked")
                                        //blocked, so one block only
                                        flowIndex = index - 4;
                                    }
                                    console.log(`this: ${index}, moved into ${flowIndex}(${flowType})=${Math.abs(flowIndex - index) / 4}blocks`)
                                    //move in
                                    //console.log("marked ",(flowIndex+1)/4,"as processed");
                                    flags[(flowIndex + 1) / 4] |= Flags.WATER_PROCESSED;
                                    data[flowIndex] = BlockType.WATER;
                                    data[index] = BlockType.AIR;
                                } else {
                                    //try right side
                                    if (flags[(index + 1) / 4] & Flags.WATER_PROCESSED) {
                                        //console.log((index+1)/4,"is processed")
                                        continue;
                                    }
                                    let flowIndex = index + 4;
                                    let flowY = Math.floor(((flowIndex + 1) / 4 - 1) / w); //should be doing this on other places but it doesn't hurt as much
                                    let flowType = data[flowIndex] as BlockType;
                                    //two blocks per tick
                                    if (flowType == BlockType.AIR && flowY == currentY) {
                                        // we move along
                                        flowIndex = index + 8;
                                        flowY = Math.floor(((flowIndex + 1) / 4 - 1) / w);
                                        flowType = data[flowIndex] as BlockType
                                        if (flowType != BlockType.AIR || flowY != currentY) {
                                            console.log("blocked")
                                            //blocked, so one block only
                                            flowIndex = index + 4;
                                        }
                                        console.log(`this: ${index}, moved into ${flowIndex}(${flowType})=${Math.abs(flowIndex - index) / 4}blocks`)
                                        //move in
                                        //console.log("marked ",(flowIndex+1)/4,"as processed");
                                        flags[(flowIndex + 1) / 4] |= Flags.WATER_PROCESSED;
                                        data[flowIndex] = BlockType.WATER;
                                        data[index] = BlockType.AIR;
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        let t2 = performance.now();
        let thisTick = (t2 - t1);
        let nextTick = INSTANCE.mspt - (t2 - t1)
        window.tps.innerText = `Tick processed in ${thisTick.toFixed(3)}ms, ${(thisTick / INSTANCE.mspt * 100).toFixed(2)}%, ${thisTick < INSTANCE.mspt ? INSTANCE.tps : (INSTANCE.mspt / thisTick * INSTANCE.tps).toFixed(1)}tps`
        setTimeout(INSTANCE.update, nextTick);
    }

    setBlock(x: number, y: number, type: BlockType) {
        INSTANCE.data[(y * this.width + x) * 4 - 1] = type;
    }
}
