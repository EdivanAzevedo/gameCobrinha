const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const score = document.querySelector(".score-value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const audioEat = new Audio("../assets/sound1.wav");
const audioDead = new Audio("../assets/boom1.wav");

const size = 30;
let direction, loopId;
let audioPlayed = false;
const initialPosition = { x: 270, y: 240 };

let snake = [initialPosition];

const incrementScore = () => {
    score.innerText = +score.innerText + 10;
};

// Generates a random integer between `min` and `max` (inclusive).
// The previous implementation subtracted `min` after multiplying and could
// return values outside the desired range when `min` was greater than zero.
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / 30) * 30;
};

const randomColor = () => {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
};

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor(),
};

const drawSnake = () => {
    ctx.fillStyle = "#ddd";
    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "green";
        }
        ctx.fillRect(position.x, position.y, size, size);
    });
};

const moveSnake = () => {
    if (!direction) return;
    const head = snake[snake.length - 1];

    snake.shift();

    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y });
    }

    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y });
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size });
    }

    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size });
    }
};

const drawFood = () => {
    const { x, y, color } = food;

    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.shadowBlur = 0;
};

const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.lineTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(0, i);
        ctx.lineTo(600, i);
        ctx.stroke();
    }
};

const checkEat = () => {
    const head = snake[snake.length - 1];

    if (head.x == food.x && head.y == food.y) {
        snake.push(head);
        audioEat.play();
        incrementScore();

        let x = randomPosition();
        let y = randomPosition();

        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition();
            y = randomPosition();
        }
        food.x = x;
        food.y = y;
        food.color = randomColor();
    }
};

const checkCollision = () => {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size;
    const neckIndex = snake.length - 2;

    const wallCollision =
        head.x < 0 ||
        head.x > canvasLimit ||
        head.y < 0 ||
        head.y > canvasLimit;
    const selfCollision = snake.find((position, index) => {
        return (
            index < neckIndex && position.x == head.x && position.y == head.y
        );
    });

    if (wallCollision || selfCollision) {
        if (!audioPlayed) {
            audioDead.play();
            audioPlayed = true;
        }
        gameOver();
    }
};

const gameOver = () => {
    direction = undefined;

    menu.style.display = "flex";
    finalScore.innerText = score.innerText;
    canvas.style.filter = "blur(2px)";
};

const gameLoop = () => {
    clearInterval(loopId);
    ctx.clearRect(0, 0, 600, 600);
    drawGrid();
    drawFood();
    drawSnake();
    moveSnake();
    checkCollision();
    checkEat();

    loopId = setInterval(() => {
        gameLoop();
    }, 100);
};

gameLoop();

document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowRight" && direction != "left") {
        direction = "right";
    }

    if (key == "ArrowLeft" && direction != "right") {
        direction = "left";
    }

    if (key == "ArrowDown" && direction != "up") {
        direction = "down";
    }

    if (key == "ArrowUp" && direction != "down") {
        direction = "up";
    }
});

buttonPlay.addEventListener("click", () => {
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";
    audioPlayed = false;

    snake = [initialPosition];
    food.x = randomPosition();
    food.y = randomPosition();
    food.color = randomColor();
});
