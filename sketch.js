let stars = [];
let score = 0;
let cursorX, cursorY;
let targetX, targetY;

const VEL_HUIDA = 18;      
const RADIO_DETECCION = 140; 
const LERP_CURSOR = 0.15;  

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  colorMode(HSB, 360, 100, 100); 
  cursorX = width / 2;
  cursorY = height / 2;
  noCursor(); 
  for (let i = 0; i < 5; i++) spawnStar();
}

function draw() {
  background(240, 80, 10); 

  targetX = width - mouseX;
  targetY = height - mouseY;
  cursorX = lerp(cursorX, targetX, LERP_CURSOR);
  cursorY = lerp(cursorY, targetY, LERP_CURSOR);

  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    s.update();
    s.display();

    let d = dist(cursorX, cursorY, s.pos.x, s.pos.y);
    
    if (d < s.size + 15) { 
      s.size -= 1.5; 
      
      stroke(s.hue, 80, 100);
      strokeWeight(2);
      line(cursorX, cursorY, s.pos.x, s.pos.y);
      
      if (s.size < 4) {
        score += 50;
        stars.splice(i, 1);
        spawnStar(); 
      }
    }
  }
  
  drawHUD();
}

class Star {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.size = 45;
    this.hue = random(0, 360); 
  }

  update() {
    this.hue += 1;
    if (this.hue > 360) this.hue = 0;

    let d = dist(cursorX, cursorY, this.pos.x, this.pos.y);
    
    if (d < RADIO_DETECCION) {
      let huida = createVector(this.pos.x - cursorX, this.pos.y - cursorY);
      huida.setMag(VEL_HUIDA);
      this.vel.lerp(huida, 0.2); 
    }

    this.vel.mult(0.9); 
    this.pos.add(this.vel);

    if (this.pos.x < -50 || this.pos.x > width + 50 || this.pos.y < -50 || this.pos.y > height + 50) {
      this.pos.x = width / 2 + random(-60, 60);
      this.pos.y = height / 2 + random(-60, 60);
      this.vel.mult(0); 
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    fill(this.hue, 80, 100); 
    noStroke();
    
    beginShape();
    for (let i = 0; i < 10; i++) {
      let r = i % 2 === 0 ? this.size : this.size / 2.2;
      let a = TWO_PI * i / 10 - HALF_PI;
      vertex(r * cos(a), r * sin(a));
    }
    endShape(CLOSE);
    pop();
  }
}

function drawHUD() {
  stroke(0, 100, 100);
  strokeWeight(3);
  noFill();
  ellipse(cursorX, cursorY, 20);

  fill(0, 0, 100); 
  noStroke();
  textSize(20);
  text("Score: " + score, 20, 40);
}

function spawnStar() {
  stars.push(new Star(random(width), random(height)));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}