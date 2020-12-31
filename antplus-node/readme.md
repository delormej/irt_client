# To get it to work on Linux:

## Install libusb
sudo apt-get update 
sudo apt-get install build-essential libudev-dev
sudo npm install -g node-gyp
cd node_modules/usb
node-gyp rebuild

## Allow pi user to read/write to usb
Write this to a file in /usr/ 
SUBSYSTEM=="usb"

