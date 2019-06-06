let canvas, context, img, width, height;

function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    context.fillStyle='aliceblue';
    width = canvas.width;
    height = canvas.height;
    context.fillRect(0, 0, width, height);

    img = new Image();
    img.crossOrigin = "anonymous";
    img.src = 'https://shotaronarita.github.io/linetemplate.png';
}

let x = 100;
let y = 100;
let theta = 0;

let h = 30;

let dr = 0;
let dl = 3;

let sl = 10;

let sensorL = {'x':0, 'y':0, 'i':-1};
let sensorC = {'x':0, 'y':0, 'i':-1};
let sensorR = {'x':0, 'y':0, 'i':-1};

function loop()
{
    context.drawImage(img, 0, 0, width, height);
    
    let ll = dl;
    let lr = dr;

    let d_theta = 0;
    let R = 0;

    if(ll == lr){
        R = 0;

        x += ll * Math.cos(theta);
        y += ll * Math.sin(theta);
    }else{
        R = (ll + lr) / (ll - lr) * h;

        d_theta = (ll - lr) / (2 * h);

        D = 2 * R * Math.sin((ll - lr) / 4);
    
        x += (- R * Math.sin(theta) + R * Math.cos(Math.PI / 2 - theta - d_theta));
        y += (  R * Math.cos(theta) - R * Math.sin(Math.PI / 2 - theta - d_theta));
    }

    theta += d_theta;
    
    let s = h * Math.sin(theta);
    let c = h * Math.cos(theta);

    let p = c + s;
    let q = c - s;

    context.beginPath();
    context.lineTo(x + c, y + s);
    context.lineTo(x - q, y - p);
    context.lineTo(x - p, y + q);
    context.closePath();
    context.fillStyle='black';
    context.fill();

    context.beginPath();
    context.arc(x - s, y + c, 5, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='red';
    context.fill();  

    context.beginPath();
    context.arc(x + s, y - c, 5, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='red';
    context.fill();  

    sensorC.x = x + c;
    sensorC.y = y + s;

    sensorL.x = sensorC.x + Math.sin(theta) * sl;
    sensorL.y = sensorC.y - Math.cos(theta) * sl;

    sensorR.x = sensorC.x - Math.sin(theta) * sl;
    sensorR.y = sensorC.y + Math.cos(theta) * sl;

    // sensorL.x = parseInt(sensorL.x);
    // sensorL.y = parseInt(sensorL.y);
    // sensorC.x = parseInt(sensorC.x);
    // sensorC.y = parseInt(sensorC.y);
    // sensorR.x = parseInt(sensorR.x);
    // sensorR.y = parseInt(sensorR.y);

    // let info = context.getImageData(100, 100, 1, 1);
    // let info = context.getImageData(sensorL.x, sensorL.y, 1, 1);
    let info = context.getImageData(0, 0, width, height);
    let idata = info.data;
    let index = parseInt((width * sensorL.y + sensorL.x) * 4);
    document.getElementById('terminal').innerText = idata[index] + ', ' + idata[index + 1] + ', ' + idata[index + 2];

    sensorL.i = (idata[index] + idata[index + 1] + idata[index + 2])

    context.beginPath();
    context.arc(sensorC.x, sensorC.y, 3, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='blue';
    context.fill();  

    context.beginPath();
    context.arc(sensorL.x, sensorL.y , 3, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='blue';
    context.fill();  

    context.beginPath();
    context.arc(sensorR.x, sensorR.y, 3, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='blue';
    context.fill();  
}

function main(){
    init();
    setInterval(loop, 100);
}