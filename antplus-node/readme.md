# To get it to work on Linux:

## Install libusb
sudo apt-get update 
sudo apt-get install build-essential libudev-dev
sudo npm install -g node-gyp
cd node_modules/usb
node-gyp rebuild

## Allow pi user to read/write to usb
As super user:

echo 'SUBSYSTEM=="usb", ATTRS{idVendor}=="0fcf", GROUP="plugdev", MODE="0660"' > /lib/udev/rules.d/50-usb-ant.rules

sudo udevadm control --reload ; sudo udevadm triggerls -l


