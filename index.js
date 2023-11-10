const express = require('express');
const http = require('http');
const io = require('socket.io-client');

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

socket.on('disconnect', () => {
    console.log('Disconnected from cloud server');
    
    // Clear the interval
    clearInterval(interval);
});
