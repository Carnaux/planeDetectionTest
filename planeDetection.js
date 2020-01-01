let overwrite = [];
let threshold = 60;
let boxFilter = [0.111, 0.111, 0.111,
                 0.111, 0.111, 0.111,
                 0.111, 0.111, 0.111 ];
let boxFilterCoord = [{x:-1, y:-1}, {x:-1, y:0}, {x:-1, y:+1},
                      {x:0, y:-1}, {x:0, y:0}, {x:0, y:+1},
                      {x:+1, y:-1}, {x:+1, y:0}, {x:-1, y:+1}];

let avgColor = {
    r: -1,
    g: -1,
    b: -1
}

let ag = false;
let debugTxt = "";

function setToBW(imgData, outFrame){
    let brightness = detectBrightness(imgData.data);
    debugTxt += " lvl: " + toString(brightness) + " ";
    console.log(brightness)
    if(avgColor.r != -1){
        for (let x = 0; x < imgData.width; x++){
            for (let y = 0; y < imgData.height; y++){
                const pos = (x + y * imgData.width) * 4;
      
                const r1 = imgData.data[pos];
                const g1 = imgData.data[pos + 1];
                const b1 = imgData.data[pos + 2];
                const a = imgData.data[pos + 3];
                let colorObj = gammaCorrection(brightness, r1, g1, b1);

                // outFrame[pos] = colorObj.r;
                // outFrame[pos+1] = colorObj.g;
                // outFrame[pos+2] = colorObj.b;
                // outFrame[pos+3] = a; 

                // const d = distSq(r1, g1, b1, avgColor.r, avgColor.g, avgColor.b);
                const d = distSq(colorObj.r, colorObj.g, colorObj.b, avgColor.r, avgColor.g, avgColor.b);
                
                if (d < threshold * threshold) {
                    outFrame[pos] = 255;
                    outFrame[pos+1] = 255;
                    outFrame[pos+2] = 255;
                    outFrame[pos+3] = a;
                }else{
                    outFrame[pos] = 0;
                    outFrame[pos+1] = 0;
                    outFrame[pos+2] = 0;
                    outFrame[pos+3] = a;
                }
                
                applyGauBlur(x, y,imgData.width, pos, outFrame)
            }
        }  
    }

    // if(ag){
    //     for (let x = 0; x < imgData.width; x++){
    //         for (let y = 0; y < imgData.height; y++){
    //             const pos = (x + y * imgData.width) * 4;
      
    //             const r1 = imgData.data[pos];
    //             const g1 = imgData.data[pos + 1];
    //             const b1 = imgData.data[pos + 2];
    //             const a = imgData.data[pos + 3];
    //             let colorObj = gammaCorrection(brightness, r1, g1, b1);

    //             outFrame[pos] = colorObj.r;
    //             outFrame[pos+1] = colorObj.g;
    //             outFrame[pos+2] = colorObj.b;
    //             outFrame[pos+3] = a; 
    //         }
    //     }
    // }else{
    //     for (let x = 0; x < imgData.width; x++){
    //         for (let y = 0; y < imgData.height; y++){
    //             const pos = (x + y * imgData.width) * 4;
      
    //             const r1 = imgData.data[pos];
    //             const g1 = imgData.data[pos + 1];
    //             const b1 = imgData.data[pos + 2];
    //             const a = imgData.data[pos + 3];
               

    //             outFrame[pos] = r1;
    //             outFrame[pos+1] = g1;
    //             outFrame[pos+2] = b1;
    //             outFrame[pos+3] = a; 
    //         }
    //     }
    // }
       
    document.getElementById("debug").textContent = debugTxt;
}

// function clicks(){
//     ag = !ag;
//     console.log(ag)
// }

function applyGauBlur(x, y, currentPos, width, outFrame){
  
    let tot = 0;
    for(let k = 0; k < boxFilter.length; k++){
        let coord = boxFilterCoord[k];
        const pos = ((x + coord.x) + (y + coord.y) * width) * 4;
        if(outFrame[pos] != undefined){
            tot += outFrame[currentPos]*boxFilter[k];
        }
    }
    outFrame[currentPos] = tot;
}

function detectBrightness(frame){
    let totBrightness = 0;
    for(let i = 0; i < frame.length; i+=4){
        var avg = (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
        totBrightness += avg;
    }
    totBrightness = totBrightness/(frame.length/4);
    if(totBrightness < 102){
        if(totBrightness < 51){
            return 1
        }else{
            return 2
        }
    }else if(totBrightness > 102 && totBrightness < 153){
       return 3
    }else if(totBrightness > 153){
        if(totBrightness > 204){
            return 5
        }else{
            return 4
        }
    }
    // lvl 1
    // 0 - 51
    // lvl 2
    // 51 - 102
    // lvl 3
    // 102 - 153
    // lvl 4
    // 153 - 204
    // lvl 5
    // 204 - 255

}

function gammaCorrection(lvl, r, g, b){
    let gamma = 1;
    switch(lvl){
        case 1:
            gamma = 1.8;
            break;
        case 2: 
            gamma = 1.3;
            break;
        case 3: 
            gamma = 1;
            break;
        case 4:
            gamma = 0.5;
            break;
        case 5:
            gamma = 0.2;
            break;
    }

   
    let newR = 255 * Math.pow(r/255 , 1/gamma);
    let newG = 255 * Math.pow(g/255 , 1/gamma);
    let newB = 255 * Math.pow(b/255 , 1/gamma);

    return obj = {
        gamma: gamma,
        r: newR,
        g: newG,
        b: newB
    }
    
}

function setAverageColor(imgData){
    let x = imgData.width/2;
    let y = imgData.height/2;
    let frame_1byte = [];

    for(let i = 0; i < imgData.data.length; i+=4){
        let color = {
           i: i,
           r: imgData.data[i],
           g: imgData.data[i+1],
           b: imgData.data[i+2]
        } 
        frame_1byte.push(color);
    }

    let colors = [];
    for(let i = - 10; i < 10; i++){
        for(let j = -5; j < 5; j++){
            let pos = (x-i)+(y-j)*imgData.width;
            let middleColor = {
                i: frame_1byte[pos].i,
                r: frame_1byte[pos].r, 
                g: frame_1byte[pos].g, 
                b: frame_1byte[pos].b
            };
            colors.push(middleColor);
        }
    }

    let totR = 0;
    let totG = 0;
    let totB = 0;
    let totAlpha = 0
    for(let i = 0; i < colors.length; i++){
        totR += colors[i].r * 255;
        totG += colors[i].g * 255; 
        totB += colors[i].b * 255;
        totAlpha += 255;
    }
    totR = totR/totAlpha;
    totG = totG/totAlpha;
    totB = totB/totAlpha;
    
    avgColor.r = totR;
    avgColor.g = totG;
    avgColor.b = totR;

    let videoAr = document.getElementById("videoAr");
    videoAr.style.display = "none";
}

function findBlobs(imgData, outFrame){
    const currentBlobs = [];
    for (let x = 0; x < imgData.width; x++){
        for (let y = 0; y < imgData.height; y++){
            const currentPos = (x + y * imgData.width) * 4;
            // What is current color
            const r1 = video.pixels[loc + 0];
            const g1 = video.pixels[loc + 1];
            const b1 = video.pixels[loc + 2];
            const r2 = red(trackColor);
            const g2 = green(trackColor);
            const b2 = blue(trackColor);

            const d = distSq(r1, g1, b1, r2, g2, b2);

            if (d < threshold * threshold) {
                let found = false;
                for (let b of currentBlobs) {
                    if (b.isNear(x, y)) {
                    b.add(x, y);
                    found = true;
                    break;
                    }
                }

                if (!found) {
                    const b = new Blob(x, y);
                    currentBlobs.push(b);
                }
            }
        }
    }
}

function distSq(a1, b1, c1, a2, b2, c2) {
    let x1, y1, z1, x2, y2, z2;

    x1 = a1;
    y1 = b1;
    z1 = c1;
    x2 = a2;
    y2 = b2;
    z2 = c2;
    
    const d = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z1 - z2) * (z1 - z2);
    return d;
}