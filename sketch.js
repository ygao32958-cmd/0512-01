let capture;
let faceMesh;
let faces = [];

// 這是最新的 ml5.js v1.0+ 建議的載入方式
function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: false });
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 設定攝影機並隱藏原始元件
  capture = createCapture(VIDEO, () => {
    console.log("Camera ready!");
  });
  capture.hide(); // 隱藏原本出現在畫布下方的 HTML 影片元件
  
  // 開始連續偵測
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  background('#e7c6ff');

  // 繪製半透明灰色浮水印文字 (置中上方)
  fill(128, 128, 128, 150); // 灰色，150 為透明度
  noStroke();
  textAlign(CENTER, TOP);
  textSize(24);
  text("414730878 高翊嘉", width / 2, 20);
  text("作品為影像辨識_耳環臉譜", width / 2, 55);

  // 設定影像顯示的寬高為畫布的 50%
  let vW = width * 0.5;
  let vH = height * 0.5;

  // 計算置中座標
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  push();
  // 實作左右顛倒（鏡像）
  translate(x + vW, y); // 先移動到影像右側邊界
  scale(-1, 1);         // 水平翻轉座標系
  image(capture, 0, 0, vW, vH); // 在翻轉後的座標系中繪製影像

  // 繪製耳環效果 (需確認攝影機已有寬高資料)
  if (faces.length > 0 && capture.width > 0) {
    let face = faces[0];
    
    // MediaPipe FaceMesh 索引點 (468點模型)：150 接近左耳垂，379 接近右耳垂
    let leftEarlobe = face.keypoints[234] || face.keypoints[150]; 
    let rightEarlobe = face.keypoints[454] || face.keypoints[379];

    // 計算影像縮放比例
    let sX = vW / capture.width;
    let sY = vH / capture.height;

    drawEarring(leftEarlobe.x * sX, leftEarlobe.y * sY);
    drawEarring(rightEarlobe.x * sX, rightEarlobe.y * sY);
  }
  pop();
}

function drawEarring(x, y) {
  // 閃爍邏輯：利用 frameCount 切換顏色
  // 每 15 幀切換一次亮黃色與深橘色
  if (frameCount % 30 < 15) {
    fill(255, 255, 0); // 亮黃色
  } else {
    fill(255, 150, 0); // 深橘色，造成閃爍感
  }
  
  noStroke();
  for (let i = 0; i < 3; i++) {
    // 由耳垂位置往下顯示三個星星，垂直間距為 20 像素
    star(x, y + (i * 20), 5, 10, 5);
  }
}

// 繪製星星的輔助函式
function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
