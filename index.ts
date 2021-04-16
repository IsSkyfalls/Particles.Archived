import ParticleSystem from './particle';

document.addEventListener("DOMContentLoaded",()=>{
    let canvas=document.getElementById("world") as HTMLCanvasElement;
    let p=new ParticleSystem(canvas,100,100);
    p.run();
    console.log(p)
});

