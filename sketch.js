// 2 options for drawing the walls
// option 0 = corn maze
// option 1 = castle
// (Both look cool)
var drawingOption = 1;

// True para salvar o caminho no final, false para não salvar
var salvar = true;
var table;

//Set to true to allow diagonal moves
//This will also switch from Manhattan to Euclidean distance measures
var allowDiagonals = true;

// can the path go between the corners of two
// walls located diagonally next to each other
var canPassThroughCorners = false;

var cols = 31;
var rows = 31;

var x_i = 0;
var y_i = 0;
var x_f = cols - 1;
var y_f = rows - 1;

// % of cells that are walls
var percentWalls = (allowDiagonals ? (canPassThroughCorners ? 0.4 : 0.3) : 0.2);

// Timer
var t;
var timings = {};

function clearTimings() {
    timings = {};
}

function startTime() {
    t = millis();
}

function recordTime(n) {
    if (!timings[n]) {
        timings[n] = {
            sum: millis() - t,
            count: 1
        };
    } else {
        timings[n].sum = timings[n].sum + millis() - t;
        timings[n].count = timings[n].count + 1;
    }
}

function logTimings() {
    for (var prop in timings) {
        if (timings.hasOwnProperty(prop)) {
            console.log(prop + " = " + (timings[prop].sum / timings[prop].count).toString() + " ms");
        }
    }
}


function SettingBox(label, x, y, isSet, callback) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.isSet = isSet;
    this.callback = callback;

    this.show = function () {
        //noFill();
        strokeWeight(1);
        stroke(0);
        noFill();
        ellipse(this.x + 10, this.y + 10, 20, 20);
        if (this.isSet) {
            fill(0);
            ellipse(this.x + 10, this.y + 10, 3, 3);
        }
        fill(0);
        noStroke();
        text(label, this.x + 25, this.y + 15);
    }

    this.mouseClick = function (x, y) {
        if (x > this.x && x <= this.x + 20 &&
            y > this.y && y <= this.y + 20) {
            this.isSet = !this.isSet;
            if (this.callback != null)
                this.callback(this);
        }
    }
}

function Button(label, x, y, w, h, callback) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.callback = callback;

    this.show = function () {
        stroke(0);
        strokeWeight(1);
        noFill();
        rect(this.x, this.y, this.w, this.h);
        fill(0);
        noStroke();
        text(this.label, this.x + 5, this.y + 5, this.w - 10, this.h - 10);
    }

    this.mouseClick = function (x, y) {
        if (this.callback != null &&
            x > this.x && x <= this.x + this.w &&
            y > this.y && y <= this.y + this.h) {
            this.callback(this);
        }
    }
}

// Start and end
// start = grid[0][0];
// end = grid[cols - 1][rows - 1];
// start.wall = false;
// end.wall = false;

function step(button) {
    pauseUnpause(true);
    stepsAllowed = 1;
}

function pauseUnpause(pause) {
    paused = pause;
    runPauseButton.label = paused ? "Iniciar" : "Pausar";
}

function runpause(button) {
    pauseUnpause(!paused);
}

function restart(button) {
    logTimings();
    clearTimings();
    initaliseSearchExample(cols, rows);
    pauseUnpause(true);
}

function mudar(button) {
    logTimings();
    clearTimings();
    SearchExample(cols, rows);
    pauseUnpause(true);
}

function toggleDiagonals() {
    allowDiagonals = !allowDiagonals;
}

function toggleSalvar() {
    salvar = true;
}

function deBug() {
    deBug = !deBug;
}

function estilo() {
    estilo = !estilo;
}

function mouseClicked() {
    for (var i = 0; i < uiElements.length; i++) {
        uiElements[i].mouseClick(mouseX, mouseY);
    }
}

function doGUI() {
    for (var i = 0; i < uiElements.length; i++) {
        uiElements[i].show();
    }
}


var gamemap;
var uiElements = [];
var paused = true;
var pathfinder;
var status = "";
var stepsAllowed = 0;
var runPauseButton;

function initaliseSearchExample(rows, cols) {
    mapGraphic = null;

    gamemap = new MapFactory().getMap(cols, rows, 10, 10, 410, 410, allowDiagonals, percentWalls);
    
    start = gamemap.grid[x_i][y_i];
    end = gamemap.grid[x_f][y_f];

    start.wall = false;
    end.wall = false;

    pathfinder = new AStarPathFinder(gamemap, start, end, allowDiagonals);
}

function SearchExample(rows, cols) {
    mapGraphic = null;
    
    start = gamemap.grid[x_i][y_i];
    end = gamemap.grid[x_f][y_f];

    start.wall = false;
    end.wall = false;

    pathfinder = new AStarPathFinder(gamemap, start, end, allowDiagonals);
}


function setup() {
    startTime();

    if (getURL().toLowerCase().indexOf("fullscreen") === -1) {
        createCanvas(600, 600);
    } else {
        var sz = min(windowWidth, windowHeight);
        createCanvas(sz, sz);
    }
    console.log('A*');

    initaliseSearchExample(cols, rows);

    runPauseButton = new Button("Iniciar", 430, 20, 50, 30, runpause);
    uiElements.push(runPauseButton);
    uiElements.push(new Button("Passo", 430, 70, 50, 30, step));
    uiElements.push(new Button("Zerar", 430, 120, 50, 30, restart));

    uiElements.push(new SettingBox("Salvar", 430, 160, salvar, toggleSalvar));

    uiElements.push(new SettingBox("Permitir Diagonais", 430, 200, allowDiagonals, toggleDiagonals));

    uiElements.push(new SettingBox("deBug", 430, 240, deBug, deBug));

    uiElements.push(new SettingBox("Estilo Caminho", 430, 280, estilo, estilo));

    sliderx_i = createSlider(0, cols - 1, 0);
    slidery_i = createSlider(0, rows - 1, 0);
    sliderx_f = createSlider(0, cols - 1, cols - 1);
    slidery_f = createSlider(0, rows - 1, rows - 1);
    
    uiElements.push(new Button("Mudar Pontos", 10, 550, 50, 30, mudar));
    
    recordTime("Setup");
}

function searchStep() {
    if (!paused || stepsAllowed > 0) {
        startTime();
        var result = pathfinder.step();
        recordTime("AStar Iteration");
        stepsAllowed--;

        switch (result) {
            case -1:
                status = "(Concluido) Sem solução.";
                logTimings();
                pauseUnpause(true);
                break;
            case 1:
                status = "(Concluido) Objetivo alcançado.";
                logTimings();
                pauseUnpause(true);
                break;
            case 0:
                status = "Procurando"
                break;
        }
    }
}

var mapGraphic = null;

function drawMap() {
    if (mapGraphic == null) {
        for (var i = 0; i < gamemap.cols; i++) {
            for (var j = 0; j < gamemap.rows; j++) {
                if (gamemap.grid[i][j].wall) {
                    gamemap.grid[i][j].show(color(255));
                }
            }
        }
        mapGraphic = get(gamemap.x, gamemap.y, gamemap.w, gamemap.h);
    }

    image(mapGraphic, gamemap.x, gamemap.y);
}

function draw() {

    searchStep();

    // Draw current state of everything
    background(255);

    doGUI();

    text("Operação - " + status, 10, 450);

    x_i = sliderx_i.value();
    y_i = slidery_i.value();
    x_f = sliderx_f.value();
    y_f = slidery_f.value();

    text("X inicial: " + x_i, 10, 600);
    text("Y inicial: " + y_i, 150, 600);
    text("X final: " + x_f, 290, 600);
    text("Y final: " + y_f, 410, 600);



    startTime();

    drawMap();

    fill(color(0, 255, 0));
    ellipse(17 + x_i * 13.2258, 17 + y_i * 13.2258, 7, 7);
    fill(color(255, 0, 0));
    ellipse(17 + x_f * 13.2258, 17 + y_f * 13.2258, 7, 7);

    for (var i = 0; i < pathfinder.closedSet.length; i++) {
        pathfinder.closedSet[i].show(color(255, 0, 0));
    }

    var infoNode = null;

    for (var i = 0; i < pathfinder.openSet.length; i++) {
        var node = pathfinder.openSet[i];
        node.show(color(0, 255, 0));
        if (mouseX > node.x && mouseX < node.x + node.width &&
            mouseY > node.y && mouseY < node.y + node.height) {
            infoNode = node;
        }
    }
    recordTime("Draw Grid");

    fill(0);
    if (infoNode != null) {

        text("f = " + infoNode.f, 430, 360);
        text("g = " + infoNode.g, 430, 380);
        text("h = " + infoNode.h, 430, 400);
        text("vh = " + infoNode.vh, 430, 420);
        text("X = " + infoNode.x, 430, 440);
        text("Y = " + infoNode.y, 430, 460);
        text("i = " + infoNode.i, 430, 480);
        text("j = " + infoNode.j, 430, 500);
    }

    var path = calcPath(pathfinder.lastCheckedNode);

    if (pathfinder.lastCheckedNode === pathfinder.end) {

        drawPath(path);
        if (salvar) {
            salvarTabela(path);
            salvar = false;
        }
    }
}

function calcPath(endNode) {
    startTime();
    // Find the path by working backwards
    path = [];
    var temp = endNode;
    path.push(temp);
    while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
    }
    recordTime("Calc Path");
    return path
}

function drawPath(path) {
    // Drawing path as continuous line
    noFill();
    stroke(0, 0, 255);
    strokeWeight(gamemap.w / gamemap.cols / 2);
    beginShape();
    for (var i = 0; i < path.length; i++) {
        vertex(path[i].x + path[i].width / 2, path[i].y + path[i].height / 2);
    }
    endShape();
}

function salvarTabela(path) {
    table = new p5.Table();

    table.addColumn('Passo, X, Y');

    var newRow = [path.length - 1];

    for (var j = path.length - 1; j >= 0; j--) {
        newRow[j] = table.addRow();
        newRow[j].setString('Passo, X, Y', table.getRowCount() - 1 + ", " + path[j].i + ", " + path[j].j);
    }
    saveTable(table, 'new.csv');
    //saveTable(table, 'new.txt');
}
