let canvas, context, img, width, height;

function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    context.fillStyle='aliceblue';
    width = canvas.width;
    height = canvas.height;
    context.fillRect(0, 0, width, height);

    img = new Image();
    img.src = 'https://shotaronarita.github.io/linetemplate.png';
}

let x = 100;
let y = 100;
let theta = 0;

let h = 30;

let dr = 0;
let dl = 3;

let sl = 10;

let censorL = {'x':0, 'y':0};
let censorC = {'x':0, 'y':0};
let censorR = {'x':0, 'y':0};

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

    censorC.x = x + c;
    censorC.y = y + s;

    censorL.x = censorC.x + Math.sin(theta) * sl;
    censorL.y = censorC.y - Math.cos(theta) * sl;

    censorR.x = censorC.x - Math.sin(theta) * sl;
    censorR.y = censorC.y + Math.cos(theta) * sl;

    context.beginPath();
    context.arc(censorC.x, censorC.y, 3, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='blue';
    context.fill();  

    context.beginPath();
    context.arc(censorL.x, censorL.y , 3, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='blue';
    context.fill();  

    context.beginPath();
    context.arc(censorR.x, censorR.y, 3, 0, Math.PI * 2, true);
    context.closePath();  
    context.fillStyle='blue';
    context.fill();  

    censorL.x = parseInt(censorL.x);
    censorL.y = parseInt(censorL.y);
    censorC.x = parseInt(censorC.x);
    censorC.y = parseInt(censorC.y);
    censorR.x = parseInt(censorR.x);
    censorR.y = parseInt(censorR.y);

    // let info = context.getImageData(100, 100, 1, 1);
    let info = context.getImageData(censorL.x, censorL.y, 1, 1);
    // console.log(censorL.x, censorL.y);
    console.log(info.data);
    document.getElementById('terminal').innerText = info.data;
    //info.data;
    
}

function main(){
    init();
    setInterval(loop, 100);
}