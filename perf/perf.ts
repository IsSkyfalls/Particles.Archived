export function executeTimed(func: Function): number {
    let t1 = window.performance.now();
    func();
    let t2 = window.performance.now();
    // @ts-ignore
    console.log(`func ${func.name} execution took ${t2 - t1}ms.`)
    return t2 - t1;
}

export function executeMultipleTimed(func: Array<Function>, iterations: number): Map<string, Array<number>> {
    let map = new Map<string, Array<number>>();
    func.forEach(e => {
        let i = iterations;
        let array = new Array<number>();
        map.set(e.name, array);
        while (i--) {
            array.push(executeTimed(e));
        }
    });
    return map;
}

export function printTimingsMap(map: Map<string, Array<number>>) {
    let data = new Array<any>();
    map.forEach((v, k, m) => {
        let arr = new Array<any>();
        arr.push(k);
        data.push(arr.concat(v));
    });
    console.log(data)
    console.table(data);
}

export function printTimingsAsCSV(map: Map<string, Array<number>>) {
    let s = "#Timings report CSV:\n";
    map.forEach((v, k, m) => {
        s += k;
        v.forEach((t) => {
            s += ","
            s += t;
        })
        s += "\n";
    });
    let p = document.createElement("p");
    p.innerText = s;
    document.body.appendChild(p);
}
