#!/bin/bash

echo "Kill all the running PM2 actions"
sudo pm2 kill

echo "Update app from Git"
sudo pull origin dev

echo "insatll sass package"
sudo npm i -g sass

echo "Install app dependencies"
sudo rm -rf node_modules package-lock.json
sudo npm install

echo "Run new PM2 action"
pm2 start ecosystem.config.js