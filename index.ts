import ParticleSystem from './particle';

document.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("world") as HTMLCanvasElement;
    //let p = new ParticleSystem(canvas, 100, 100,300);
    let p = new ParticleSystem(canvas, 1920/10, 800/10,3000);
    p.run();
    console.log(p)
});

