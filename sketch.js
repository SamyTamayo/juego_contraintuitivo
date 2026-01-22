let stars = [];
let score = 0;

let cursorX, cursorY;
let targetX, targetY;

const VEL_HUIDA = 30;
const RADIO_DETECCION = 140;
const LERP_CURSOR = 0.15;

const PALETTE = [
  { h: 320, s: 85, b: 100 }, 
  { h: 300, s: 75, b: 100 }, 
  { h: 280, s: 65, b: 95  }, 
  { h: 290, s: 70, b: 95  }, 
  { h: 340, s: 80, b: 100 }  
];

let scorePop = 0;
let floatTexts = [];
const SCORE_POR_FRAME = 1;

let colorPool = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noCursor();

  cursorX = width / 2;
  cursorY = height / 2;

  resetColorPool();

  for (let i = 0; i < 5; i++) spawnStar();
}

function draw() {
  background(0, 0, 0);

  targetX = width - mouseX;
  targetY = height - mouseY;
  cursorX = lerp(cursorX, targetX, LERP_CURSOR);
  cursorY = lerp(cursorY, targetY, LERP_CURSOR);

  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    s.update();
    s.display();

    let d = dist(cursorX, cursorY, s.pos.x, s.pos.y);

    if (d < s.size + 4) {
      s.size -= 1.5;

      score += SCORE_POR_FRAME;
      scorePop = 1;

      stroke(0, 0, 100, 35);
      strokeWeight(2);
      line(cursorX, cursorY, s.pos.x, s.pos.y);

      if (s.size < 4) {
        score += 50;
        scorePop = 1;

        floatTexts.push({
          x: s.pos.x,
          y: s.pos.y,
          t: "+50",
          life: 45
        });

        releaseColor(s.col);

        stars.splice(i, 1);
        spawnStar();
      }
    }
  }

  updateFloatTexts();
  drawHUD();
}

class Star {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.size = 60;
    this.col = col; 
  }

  update() {
    let d = dist(cursorX, cursorY, this.pos.x, this.pos.y);

    if (d < RADIO_DETECCION) {
      let huida = createVector(this.pos.x - cursorX, this.pos.y - cursorY);
      huida.setMag(VEL_HUIDA);
      this.vel.lerp(huida, 0.5);
    }

    this.vel.mult(0.94);
    this.pos.add(this.vel);

    if (
      this.pos.x < -50 || this.pos.x > width + 50 ||
      this.pos.y < -50 || this.pos.y > height + 50
    ) {
      this.pos.x = width / 2 + random(-60, 60);
      this.pos.y = height / 2 + random(-60, 60);
      this.vel.mult(0);
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    fill(this.col.h, this.col.s, this.col.b);
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
  stroke(320, 85, 100);
  strokeWeight(3);
  noFill();
  ellipse(cursorX, cursorY, 20);

  scorePop = lerp(scorePop, 0, 0.15);
  let popScale = 1 + scorePop * 0.35;

  push();
  fill(0, 0, 100);
  noStroke();
  textSize(20 * popScale);
  textAlign(LEFT, BASELINE);
  text("Score: " + floor(score), 20, 40);
  pop();
}

function updateFloatTexts() {
  for (let i = floatTexts.length - 1; i >= 0; i--) {
    let f = floatTexts[i];
    f.y -= 1.2;
    f.life--;

    let a = map(f.life, 0, 45, 0, 100);

    push();
    noStroke();
    textSize(18);
    textAlign(LEFT, BASELINE);
    fill(60, 90, 100, a);
    text(f.t, f.x, f.y);
    pop();

    if (f.life <= 0) floatTexts.splice(i, 1);
  }
}

function resetColorPool() {
  colorPool = PALETTE.slice(); 
  shuffle(colorPool, true);  
}

function pickUniqueColor() {

  if (colorPool.length === 0) resetColorPool();
  return colorPool.pop();
}

function releaseColor(col) {

  colorPool.push(col);
  shuffle(colorPool, true);
}

function spawnStar() {
  const col = pickUniqueColor();
  stars.push(new Star(random(width), random(height), col));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}