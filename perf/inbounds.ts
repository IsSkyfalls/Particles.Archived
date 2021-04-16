import {executeMultipleTimed, printTimingsAsCSV} from "./perf";

export function inBoundsCheckNotRandom() {
    //I want a resolution of 1920*1080
    //so we will be doing 2073600 checks per frame for 1920*1080
    const w = 1920, h = 1080;
    let timings = executeMultipleTimed([
        function return_early() {
            run(isInBounds);

            function isInBounds(x: number, y: number) {
                if (x < 0 || x >= h) {
                    return false;
                }
                if (y < 0 || y >= h) {
                    return false;
                }
                return true;
            }
        },
        function conditional_suggested() {
            run(isInBounds);

            function isInBounds(x: number, y: number) {
                if (x < 0 || x >= h) {
                    return false;
                }
                return !(y < 0 || y >= h);
            }
        },
        function single_if() {
            run(isInBounds);

            function isInBounds(x: number, y: number) {
                if (x < 0 || x >= h || y < 0 || y >= h) {
                    return false;
                }
                return true;
            }
        },
        function conditional_one_liner() {
            run(isInBounds);

            function isInBounds(x: number, y: number) {
                return !(x < 0 || x >= h || y < 0 || y >= h);
            }
        },
        function if_elseif_else() {
            run(isInBounds);

            function isInBounds(x: number, y: number) {
                if (x < 0 || x >= h) {
                    return false;
                } else if (y < 0 || y >= h) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        function if_times_4() {
            run(isInBounds);

            function isInBounds(x: number, y: number) {
                if(x<0){
                    return false;
                }else if(x>=h){
                    return false;
                }else if(y < 0){
                    return false;
                }else if(y>=h){
                    return false;
                }else{
                    return true;
                }
            }
        },
    ], 50);

    printTimingsAsCSV(timings);

    function run(check: Function) {
        for (let x = 0; x < w * 2; x++) {
            for (let y = 0; y < h * 2; y++) {
                check(x, y);
            }
        }
    }
}
