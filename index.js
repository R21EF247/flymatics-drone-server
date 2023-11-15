const express = require('express');
const http = require('http');
const io = require('socket.io-client');
const { spawn } = require('child_process');
const { SerialPort } = require('serialport');

// const nanoPort = new SerialPort({
//     path: '/dev/ttyUSB0',
//     baudRate: 9600
// });
// const picoPort = new SerialPort({
//     path: '/dev/ttyACM0',
//     baudRate: 115200
// });
// Connect to the cloud server



const socket = io.connect('https://flymatics-cloud-server.onrender.com/');
let interval;

const sendRandomNumber = () => {
    const randomNumber = Math.random();
    socket.emit('send-number', randomNumber);
}
const app = express();
const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });
socket.on('connect', () => {
    console.log('Connected to cloud server');
    socket.emit('drone-connected');

    // Send random number every millisecond
    interval = setInterval(sendRandomNumber, 1);
});

// Handle forwarded commands from the pilot through the cloud server
socket.on('forwarded-command', (command) => {
    console.log('Received command from pilot:', command);

    // Here, you can handle the command accordingly, e.g., start a specific drone movement.
    // After handling, you can send a confirmation back to the pilot via the cloud server:
    socket.emit('send-confirmation', `Command ${command} executed successfully.`);
});
const libcameraVid = spawn('libcamera-vid', ['-t', '0', '-o', '-']);
    libcameraVid.stdout.on('data', (data) => {
        socket.emit('video-stream', data);
    });
    libcameraVid.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    libcameraVid.on('close', (code) => {
        console.log(`libcamera-vid process exited with code ${code}`);
    });
// nanoPort.on('data', (data) => {
//     const nanoSerialData = data.toString();
//     console.log("Data Recevied from serial Port", nanoSerialData);
//     socket.emit("Data Received from Nano", nanoSerialData)
// }
// );
// picoPort.on('data', (data) => {
//     const picoSerialData = data.toString();
//     console.log("Data Recevied from serial Port", picoSerialData);
//     socket.emit("Data Received from Pico", picoSerialData)
// }
// );
socket.on('disconnect', () => {
    console.log('Disconnected from cloud server');

    // Clear the interval
    clearInterval(interval);
});