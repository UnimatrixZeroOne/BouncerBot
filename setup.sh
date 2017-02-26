#!/bin/bash

rm npmsetup.log
rm config.txt
echo "BouncerBot by Elliott Pardee (vypr)"
echo "-----------------------------------"
echo ""
echo -ne "Installing npm modules... "
npm install &>npmsetup.log
echo "[done]"
echo -ne "Discord API key: "
read apikey
echo -ne "Owner's Discord Tag (ex: user#1234): "
read owner
echo -ne "Channel to log bans into (ex: #logs): "
read logchannel
config="$apikey|$owner|$logchannel"
echo $config > config.txt
echo ""
echo "Configuration created in config.txt"
echo ""
echo "Setup complete, type 'nodemon' to start the bot."
