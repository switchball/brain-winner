# brain-winner

## Introduction

It is a crowd-sourcing platform for solving BrainWinner.

## Installation

- Install `npm` and `nodejs`, see [nodejs official website](https://nodejs.org/zh-cn/)
- Use `npm install -g anyproxy` to install anyproxy
- Clone the project, and run `npm install` under the directory which contains `package.json`

## How to run the server?

The project contains two servers, one is the proxy and the other is the web server.

- First, to run the proxy, open a console and run command `anyproxy --rule sample.js`
- Second, open another console and run `npm run start` (`npm run devstart` if in debug mode)
- At last, open `http://ip_addr:8000` in the browser to check if it works.

## What the client should do?

- First, the client should connect via proxy `ip_addr:8001` 
- Second, the client should open `http://ip_addr:8000` and follow the guide

