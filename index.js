const express = require('express');
const http = require('http');
const io = require('socket.io-client');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const { SerialPort } = require('serialport');
const nanoPort = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 9600
});
const picoPort = new SerialPort({
    path: '/dev/ttyACM0',
    baudRate: 115200
});
// Connect to the cloud server
const socket = io.connect('https://flymatics-cloud-server.onrender.com/');
let interval;

const sendRandomNumber = () => {
    const randomNumber = Math.random();
    socket.emit('send-number', randomNumber);
}

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
nanoPort.on('data', (data) => {
    const nanoSerialData = data.toString();
    console.log("Data Recevied from serial Port", nanoSerialData);
    socket.emit("Data Received from Nano", nanoSerialData)
}
);
picoPort.on('data', (data) => {
    const picoSerialData = data.toString();
    console.log("Data Recevied from serial Port", picoSerialData);
    socket.emit("Data Received from Pico", picoSerialData)
}
);
wss.on('connection', function connection(ws) {
    console.log('Client connected for video stream');

    // Spawn the libcamera process
    const libcameraProcess = spawn('libcamera-vid', ['-t', '0', '-o', '-']);

    libcameraProcess.stdout.on('data', function(data) {
        ws.send(data, { binary: true });
    });

    libcameraProcess.stderr.on('data', function(data) {
        console.error(`libcamera stderr: ${data}`);
    });

    libcameraProcess.on('close', function(code) {
        console.log(`libcamera process exited with code ${code}`);
        ws.close();
    });

    ws.on('close', function close() {
        console.log('Client disconnected from video stream');
        libcameraProcess.kill();
    });
});


socket.on('disconnect', () => {
    console.log('Disconnected from cloud server');

    // Clear the interval
    clearInterval(interval);
});
