let canvas, context;

function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    context.fillStyle='aliceblue';
    context.fillRect(0, 0, canvas.width, canvas.height);

    var img = new Image();
    img.src = 'https://www.tam-tam.co.jp/tipsnote/wpdata/wp-content/uploads/2017/10/canvas_image.jpg';
}

let x = 100;
let y = 100;
let theta = 0;

let h = 30;

let dr = 1;
let dl = 3;

function loop()
{

    context.fillStyle='aliceblue';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    let ll = dl;
    let lr = dr;

    let d_theta = 0;
    let R = 0;

    if(ll == lr){
        R = 0;
    }else{
        R = (ll + lr) / (ll - lr) * h;
    }

    d_theta = (ll - lr) / (2 * h);

    // console.log('R = ', R, 'd_theta = ', d_theta, 'x = ', x, 'y = ', y);

    D = 2 * R * Math.sin((ll - lr) / 4);

    x += (- R * Math.sin(theta) + R * Math.cos(Math.PI / 2 - theta - d_theta));
    y += (  R * Math.cos(theta) - R * Math.sin(Math.PI / 2 - theta - d_theta));

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
}

function main(){
    init();
    setInterval(loop, 100);
    // context.fillRect(100, 100, 100, 100);
}