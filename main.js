let canvas, terminal, field, width, height, idata;

let car1;

let resetButton, startButton, stopButton, createButton;

let cursor = {'x' : 0, 'y' : 0};
// 0: normal, 1: position set, 2: angle set
let mode = 0;

function carInformation(car){
    text = '';

    text += `Car1    (x, y, angle) = `;
    text +=`\n(${ Math.floor(car.x)}, ${Math.floor(car.y)}, ${Math.floor(car.angle * 180 / Math.PI)})\n\n`;

    text += `Sensor  (Left, Center, Middle) = `;
    text += `\n(${car.SensorLeft.value}, ${car.SensorMiddle.value}, ${car.SensorRight.value})\n\n`;

    // text += `Left Wheel = (inertia, radius)`;
    // text += `\n${car.WheelLeft.inertia}, ${car.WheelLeft.radius}\n\n`;

    text += `Left Wheel = (angle, angle velocity, angle acceleration)`;
    text += `\n${Math.floor(car.WheelLeft.angle)}(rad), ${Math.floor(car.WheelLeft.omega)}, ${Math.floor(car.WheelLeft.angacc)}\n\n`;

    terminal.innerText = text;
}

function intensity(x, y){
    if(x < 0 || y < 0 || width - 1 < x || height - 1 < y) return 255;

    let index = Math.floor(width * y + x) * 4;
    return Math.floor((idata[index] + idata[index + 1] + idata[index + 2]) / 3);
}

function around(x, y)
{
    let sum = 0;
    let size = 3;

    for(let i = - size / 2; i < size / 2; i++){
        for(let j = - size / 2; j < size / 2; j++){
            let px = Math.floor(x - i)
            let py = Math.floor(y - j)
            sum += around(px, py);
        }
    }
    return Math.floor(sum / size / size);
}

class Sensor{
    constructor(context){
        this.value = 0;
        this.x = 100;
        this.y = 100;

        this.context = context;
    }

    reset(){
        this.value = 0;
        this.x = 0;
        this.y = 0;
    }

    update(){
        this.value = intensity(Math.round(this.x), Math.round(this.y));
        return this.value;
    }

    render(){
        this.context.beginPath();
        this.context.arc(this.x, this.y, 3, 0, Math.PI * 2, true);
        this.context.closePath();  
        this.context.fillStyle = '#507ea4';
        this.context.fill();   
    }
}

class Wheel{
    constructor(context){
        this.x = 0;
        this.y = 0;

        this.context = context;

        this.inertia = 10; // N x m
        this.dumper = 0.02;
        this.radius = 1; // m

        this.theta = 0; // rad
        this.omega = 0;
        this.angacc = 0;

        this.angle = 0;
    }

    reset()
    {
        this.x = 0;
        this.y = 0;

        this.theta = 0;
        this.omega = 0;
        this.angacc = 0;
    }

    torque(T)
    {
        this.angacc = T / this.inertia - this.dumper * this.omega;
        this.angacc = 0;
        this.omega = T * 10;
    }

    update()
    {
        this.omega += this.angacc;
        this.theta += this.omega;
        return this.omega * this.radius; // return distance Wheel contact
    }

    render(){
        let s = Math.sin(this.angle) * this.angacc * 5000;
        let c = Math.cos(this.angle) * this.angacc * 5000;

        this.context.lineWidth = 4;
        this.context.strokeStyle='#c4a3bf';

        this.context.beginPath();
        this.context.lineTo(this.x, this.y);
        this.context.lineTo(this.x + c, this.y + s);
        this.context.closePath();
        this.context.stroke();

        s = Math.sin(this.angle) * this.omega * 20;
        c = Math.cos(this.angle) * this.omega * 20;

        this.context.lineWidth = 1;
        this.context.strokeStyle='#1f3134';

        this.context.beginPath();
        this.context.lineTo(this.x, this.y);
        this.context.lineTo(this.x + c, this.y + s);
        this.context.closePath();
        this.context.stroke();

        this.context.beginPath();
        this.context.arc(this.x, this.y, 5, 0, Math.PI * 2, true);
        this.context.closePath();  
        this.context.fillStyle='#e6b422';
        this.context.fill();
    }
}

class Car
{
    constructor(context){
        this.mass = 1; // kg
        this.h = 20;
        this.sl = 10;

        this.x = 250; // m
        this.y = 260; // m
        this.angle = 0; // rad

        this.trajectry = new Array();

        this.context = context;

        this.WheelLeft = new Wheel(context);
        this.WheelRight = new Wheel(context);

        this.SensorLeft = new Sensor(context);
        this.SensorMiddle = new Sensor(context);
        this.SensorRight = new Sensor(context);

        this.update();
    }

    reset()
    {
        this.trajectry = new Array();
        this.WheelLeft.reset();
        this.WheelRight.reset();
        
        this.SensorLeft.reset();
        this.SensorMiddle.reset();
        this.SensorRight.reset();
    }

    drive(Tl, Tr)
    {
        this.WheelLeft.torque(Tl);
        this.WheelRight.torque(Tr);
    }

    update(){
        let ll = this.WheelLeft.update();
        let lr = this.WheelRight.update();

        this.SensorLeft.update();
        this.SensorMiddle.update();
        this.SensorRight.update();

        let d_theta = 0;
        let R = 0;
    
        if(ll == lr){
            R = 0;
    
            this.x += ll * Math.cos(this.angle);
            this.y += ll * Math.sin(this.angle);
        }else{
            R = (ll + lr) / (ll - lr) * this.h;
    
            d_theta = (ll - lr) / (2 * this.h);
        
            this.x += (- R * Math.sin(this.angle) + R * Math.cos(Math.PI / 2 - this.angle - d_theta));
            this.y += (  R * Math.cos(this.angle) - R * Math.sin(Math.PI / 2 - this.angle - d_theta));
        }
    
        let s = this.h * Math.sin(this.angle);
        let c = this.h * Math.cos(this.angle);

        if(mode == 0)
            this.trajectry.push({'x': this.x, 'y':this.y});

        // Sensor
        this.SensorMiddle.x = this.x + c;
        this.SensorMiddle.y = this.y + s;

        this.SensorLeft.x = this.SensorMiddle.x + Math.sin(this.angle) * this.sl;
        this.SensorLeft.y = this.SensorMiddle.y - Math.cos(this.angle) * this.sl;

        this.SensorRight.x = this.SensorMiddle.x - Math.sin(this.angle) * this.sl;
        this.SensorRight.y = this.SensorMiddle.y + Math.cos(this.angle) * this.sl;

        // Wheel
        this.WheelLeft.x = this.x + s;
        this.WheelLeft.y = this.y - c;

        this.WheelRight.x = this.x - s;
        this.WheelRight.y = this.y + c;

        this.WheelLeft.angle = this.angle;
        this.WheelRight.angle = this.angle;

        this.angle += d_theta;
    }

    render(){
        let s = this.h * Math.sin(this.angle);
        let c = this.h * Math.cos(this.angle);
    
        let p = c + s;
        let q = c - s;

        // trajectory
        this.context.beginPath();

        for(let i = 0; i < this.trajectry.length; i++){
            let pt = this.trajectry[i];
            this.context.lineTo(pt.x, pt.y);
        }
        // this.context.closePath();
        this.context.lineWidth = 3;
        this.context.strokeStyle = '#f8b862'
        this.context.stroke()

        // car itself
        this.context.beginPath();
        this.context.lineTo(this.x + c, this.y + s);
        this.context.lineTo(this.x - q, this.y - p);
        this.context.lineTo(this.x - p, this.y + q);
        this.context.closePath();
        this.context.fillStyle='#a22041';
        this.context.fill();
    
        // Wheel
        this.WheelLeft.render();
        this.WheelRight.render();

        // sensor
        this.SensorLeft.render();
        this.SensorMiddle.render();
        this.SensorRight.render();
    }
}

let mainLoop;
function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    canvas.addEventListener('mousemove', (e) => 
    {
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
    });

    canvas.addEventListener('click', (e) => {
        if(mode == 1){
            mode = 2;
            return;
        }

        if(mode == 2){
            mode = 0;
            return;
        }
    });

    terminal = document.getElementById('terminal');

    resetButton = document.getElementById('resetButton');
    stopButton = document.getElementById('resetButton');
    startButton = document.getElementById('startButton');
    createButton = document.getElementById('createButton');

    resetButton.addEventListener('click', ()=> {
        car1.reset();
        mode = 1;
    });

    width = canvas.width;
    height = canvas.height;

    field = new Image();
    field.crossOrigin = "anonymous";

    field.onload = function()
    {
        context.drawImage(field, 0, 0, width, height);
        idata = context.getImageData(0, 0, width, height).data;

        car1 = new Car(context);
        car1.render();
        setInterval(loop, 30);
    };

    field.src = './lines.png';
}

function loop()
{
    context.drawImage(field, 0, 0, width, height);

    // normal
    if(mode == 0){
        let dl = 0.0;
        let dr = 0.0;

        // let onLeft = car1.SensorLeft.value < 100;
        // let onRight = car1.SensorRight.value < 100;

        // if(!onLeft && !onRight) {
        //     dr = 0.3;
        //     dl = 0.3;
        // }
    
        // if(!onLeft && onRight){
        //     dl = 0.5;
        //     dl = 0.1;
        // }
    
        // if(onLeft && !onRight){
        //     dr = 0.5;
        //     dl = 0.1;
        // }

        dl = - (car1.SensorRight.value - car1.SensorLeft.value) / 255 * 0.3;
        dr = (car1.SensorRight.value - car1.SensorLeft.value) / 255 * 0.3;

        dl += (255 - car1.SensorMiddle.value) / 255 * 0.2 + 0.1;
        dr += (255 - car1.SensorMiddle.value) / 255 * 0.2 + 0.1;
    
        car1.drive(dl, dr);
    }

    if(mode == 1){
        car1.x = cursor.x;
        car1.y = cursor.y;
    }

    if(mode == 2){
        car1.angle = Math.atan2(cursor.y - car1.y, cursor.x - car1.x);
    }

    car1.update();
    car1.render();

    // terminal.innerText = car1.SensorLeft.read() + ', ' + car1.SensorMiddle.read() + ', ' + car1.SensorRight.read();
    terminal.innerHTML = car1.SensorLeft.value + '<br>' + car1.SensorMiddle.value + '<br>' + car1.SensorRight.value + '<br>';
    carInformation(car1);
}

function main(){
    init();
}
