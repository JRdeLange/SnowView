// Select the canvas element
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Adjust the canvas size to match the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawInitialBitmap();
}

// Create an ImageData object (a bitmap) to represent the pixels
let bitmap;

function createBitmap() {
    const width = canvas.width;
    const height = canvas.height;
    bitmap = ctx.createImageData(width, height);

    // Example: Fill the bitmap with black
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            bitmap.data[index + 0] = 0; // R
            bitmap.data[index + 1] = 0; // G
            bitmap.data[index + 2] = 0; // B
            bitmap.data[index + 3] = 255; // A
        }
    }
}

// Draw the bitmap to the canvas
function drawInitialBitmap() {
    createBitmap();
    ctx.putImageData(bitmap, 0, 0);
}

function write_color_to_pixel(color, x, y) {
    idx = (y * canvas.width + x) * 4;
    bitmap.data[idx + 0] = color[0]; // R
    bitmap.data[idx + 1] = color[1]; // G
    bitmap.data[idx + 2] = color[2]; // B
    bitmap.data[idx + 3] = color[3]; // A
}

function approach_color_by_fraction(color, fraction, x, y) {
    // add the difference between the color and the pixel color, multiplied by fraction
    idx = (y * canvas.width + x) * 4;
    bitmap.data[idx + 0] += (color[0] - bitmap.data[idx + 0]) * fraction; // R
    bitmap.data[idx + 1] += (color[1] - bitmap.data[idx + 1]) * fraction; // G
    bitmap.data[idx + 2] += (color[2] - bitmap.data[idx + 2]) * fraction; // B
    bitmap.data[idx + 3] += (color[3] - bitmap.data[idx + 3]) * fraction; // A
}

function add_color_to_pixel(color, x, y) {
    // add the color, capped at 255
    idx = (y * canvas.width + x) * 4;
    bitmap.data[idx + 0] = Math.min(bitmap.data[idx + 0] + color[0], 255); // R
    bitmap.data[idx + 1] = Math.min(bitmap.data[idx + 1] + color[1], 255); // G
    bitmap.data[idx + 2] = Math.min(bitmap.data[idx + 2] + color[2], 255); // B
    bitmap.data[idx + 3] = Math.min(bitmap.data[idx + 3] + color[3], 255); // A
}

class cyclist {
    constructor(x, y, direction) {
        this.front_x = x;
        this.front_y = y;
        this.direction = direction;

        // constants
        this.speed = 2.5;
        this.width = 2;

        this.bike_length = 50;
        this.direction_momentum = 0;
        this.turn_speed = 0.005;
        this.max_turn_speed = 0.015;

        this.rear_x = this.front_x - this.bike_length * Math.cos(this.direction);
        this.rear_y = this.front_y - this.bike_length * Math.sin(this.direction);
    }

    move() {
        // Determine the new position
        this.front_x = this.front_x + this.speed * Math.cos(this.direction);
        this.front_y = this.front_y + this.speed * Math.sin(this.direction);
        this.curve()


        // draw a circle at the new position
        let pixels = get_circle_pixels(this.front_x, this.front_y, this.width);
        for (let i = 0; i < pixels.length; i++) {
            let pixel = pixels[i];
            write_color_to_pixel([0, 0, 0, 255], pixel[0], pixel[1]);
        }

        pixels = get_circle_pixels(this.rear_x, this.rear_y, this.width);
        for (let i = 0; i < pixels.length; i++) {
            let pixel = pixels[i];
            write_color_to_pixel([0, 0, 0, 255], pixel[0], pixel[1]);
        }


        // wrap around the canvas with a box of 2*bike_length around the canvas
        if (this.front_x < - 2 * this.bike_length) {
            this.front_x = canvas.width + this.front_x + 2 * this.bike_length;
            this.rear_x = canvas.width + this.rear_x + 2 * this.bike_length;
        }
        if (this.front_x > canvas.width + 2 * this.bike_length) {
            this.front_x = this.front_x - canvas.width - 2 * this.bike_length;
            this.rear_x = this.rear_x - canvas.width - 2 * this.bike_length;
        }
        if (this.front_y < - 2 * this.bike_length) {
            this.front_y = canvas.height + this.front_y + 2 * this.bike_length;
            this.rear_y = canvas.height + this.rear_y + 2 * this.bike_length;
        }
        if (this.front_y > canvas.height + 2 * this.bike_length) {
            this.front_y = this.front_y - canvas.height - 2 * this.bike_length;
            this.rear_y = this.rear_y - canvas.height - 2 * this.bike_length;
        }
    }

    curve() {
        // Determine the new direction momentum
        this.direction_momentum += (Math.random() - 0.5) * this.turn_speed;
        if (Math.abs(this.direction_momentum) > this.max_turn_speed) {
            this.direction_momentum = Math.sign(this.direction_momentum) * this.max_turn_speed;
        }

        this.direction += this.direction_momentum;

        // determine the line between the front and the rear
        let diff_x = this.front_x - this.rear_x;
        let diff_y = this.front_y - this.rear_y;

        // move the rear along this line so that the distance between the front and the rear is this.bike_length
        let rear_distance = Math.sqrt(diff_x ** 2 + diff_y ** 2);
        this.rear_x = this.front_x - this.bike_length * diff_x / rear_distance;
        this.rear_y = this.front_y - this.bike_length * diff_y / rear_distance;

    }
}


// Handle resizing the canvas dynamically
window.addEventListener('resize', resizeCanvas);

// Initialize the canvas size and draw the initial bitmap
resizeCanvas();

let cyclists = [];
for (let i = 0; i < 5; i++) {
    cyclists.push(new cyclist(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2 * Math.PI));
}

snow(200000, 4);


function mainLoop() {
    // Update the bitmap or perform any animations here
    snow(150, 2 + Math.random() * 3);

    // Move the cyclists
    for (let i = 0; i < cyclists.length; i++) {
        cyclists[i].move();
    }

    // Draw the updated bitmap to the canvas
    ctx.putImageData(bitmap, 0, 0);

    // Request the next frame
    requestAnimationFrame(mainLoop);
}

function snow(n_flakes, size) {
    // determine n_flakes positions
    for (let i = 0; i < n_flakes; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        // draw snowflake
        let pixels = get_circle_pixels(x, y, size);

        for (let j = 0; j < pixels.length; j++) {
            let pixel = pixels[j];
            approach_color_by_fraction([255, 255, 255, 255], 0.65, pixel[0], pixel[1]);
        }
    }

}

function draw_snowflake(x, y, size) {
    // draw a circle of radius size at (x, y)
    bitmap.data[index + 0] = 255; // R

}

function get_circle_pixels(x, y, radius) {
    // return an array of pixel coordinates that are within the circle of radius radius centered at (x, y)
    let pixels = [];
    for (let i = Math.floor(x - radius); i < x + radius; i++) {
        for (let j = Math.floor(y - radius); j < y + radius; j++) {
            if ((i - x) ** 2 + (j - y) ** 2 < 1 + radius ** 2) {
                pixels.push([Math.floor(i), Math.floor(j)]);
            }
        }
    }
    return pixels;
}

// Start the main loop
mainLoop();