#!bin/bash
echo "Kill all the running PM2 actions"
pm2 kill

echo "Jump to app folder"
cd ./Visualization

echo "Update app from Git"
git pull origin

echo "Install app dependencies"
rm -rf node_modules package-lock.json
npm install

echo "Run new PM2 action"
pm2 start ecosystem.json