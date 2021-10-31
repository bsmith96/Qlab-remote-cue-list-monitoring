# Qlab Display

[![GitHub license](https://img.shields.io/github/license/bsmith96/qlab-display.svg)](https://github.com/bsmith96/qlab-display/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/bsmith96/qlab-display.svg)](https://GitHub.com/bsmith96/qlab-display/releases/)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F120U9I)

# Custom Module for Open Stage Control

This version runs entirely within the [Open Stage Control](http://openstagecontrol.ammd.net/) software, as a 'custom module'. It requests updates from Qlab when there are changes to the workspace, and interprets the responses appropriately - the module ignores responses which do not relate to the playhead position of the chosen cue list.

You can run the module with either a UDP or TCP connection to Qlab. If using TCP, a connection with Qlab will be maintained until it is terminated. If using UDP, you must send a thump (heartbeat) message to Qlab to maintain the connection – to enable this, at the top of the module, edit the variable `useTCP = false`.

## Open Stage Control setup

- Store the entire `open-stage-control-module` folder on the computer which will be running Open Stage Control. Ensure you can connect to this folder over the network.
- If using only one Qlab mac:
  - On the Qlab Mac, with your Qlab file open, navigate to that folder.
  - Open "Get-IDs.applescript" in script editor, and run it.
    - Select "Only" when prompted as to which Qlab mac this is.
    - Select the appropriate IP address. If you are running Open Stage Control on the same computer as Qlab, select "127.0.0.1". If not, select the appropriate network connection – e.g. use the control network, rather than the Dante network.
    - Select the appropriate Cue List from Qlab.
- If using Main and Backup Qlab macs:
  - On the Main Qlab Mac, with your Qlab file open, navigate to that folder.
  - Open "Get-IDs.applescript" in the script editor, and run it.
    - Select "Main" when prompted as to which Qlab mac this is.
    - Select the appropriate IP address. If you are running Open Stage Control on the same computer as Qlab, select "127.0.0.1". If not, select the appropriate network connection – e.g. use the control network, rather than the Dante network.
    - Select the appropriate Cue List from Qlab.
  - On the Backup Qlab Mac, with your Qlab file open, navigate to that folder.
  - Open "Get-IDs.applescript" in the script editor, and run it.
    - Select "Backup" when prompted as to which Qlab mac this is.
    - Select the appropriate IP address. If you are running Open Stage Control on the same computer as Qlab, select "127.0.0.1". If not, select the appropriate network connection – e.g. use the control network, rather than the Dante network.
    - Select the appropriate Cue List from Qlab.
- Open **Open Stage Control**.
- Set the following settings in the launcher, using files from the `open-stage-control-module` folder:
  - **load**: select the file `open-stage-control-template.json`
  - **custom-module**: select the file `get-cue-list-playhead.js`
  - **port**: this is the port that the web server is served to. Leave this blank to use the default 8080.
  - **no-gui**: if you do not want this open on the device which is the server, set this to true.
  - **IF USING UDP**
    - **osc-port**: set 53001. This is the port it will listen for replies from.
  - **IF USING TCP**
    - **tcp-port**: set 53001. 
    - **tcp-targets**: set \[Qlab IP\]:53000 (e.g. `127.0.0.1:53000`). Use a space to separate multiple instances
- Now, click start to launch the OSC & web server.

My suggested setup is to run the Open Stage Control server at Front Of House (for example, on the System computer), with the local GUI active, so the Sound No. 1 can see that it is working correctly. Then, the remote display for the MD is simply a browser window.

This has the added advantage that, if the Sound No 1 has to switch to the Backup due to issues with the Main, or the Main computer crashing entirely, they can also hit the "BACKUP" button on the viewer, which also switches it for the MD.

# Node JS version

## Methods

This script has several versions for displaying the result:
- `qlab-mon.js` displays the current playhead in terminal.
- `qlab-mon-streamdeck.js` displays the current playhead on 2 buttons on a streamdeck, which can be on a separate computer to that running the script if desired.
- `qlab-mon-open-stage-control.js` displays the current playhead in the software "open stage control", which can also be run on either the same or a remote computer, and can also be viewed over the network in a web browser.

## Installation

1. Clone this repository, or download and expand the zip.
2. Ensure you have installed [node.js](https://nodejs.org/en/).
3. In terminal, set the repository folder as the directory, e.g: `cd Documents/qlab-display`.
4. In terminal, enter `npm install` to install all dependencies of the project.
5. To set variables to allow the scripts to work on your system, open config.yml in a text or code editor. Here, you can set:
   - Production information:
      - Production name
      - Cue list name
      - Config version (in case you make changes to your network)
   - Cue list number
   - Qlab information:
      - IP address
      - Port to send to
      - Port replies come from
   - Display information:
      - IP address
      - For Open Stage Control:
         - Port
         - OSC address for displaying cue number
         - OSC address for displaying cue name
         - OSC address for a heartbeat indicator
      - For Streamdeck:
         - Port
         - Companion page number
         - Companion button number for Q Number
         - Companion button number for Q Name
6. You can also set most of these variables from the command line, which could be particularly useful for cue list numbers and OSC ports.

## Operation

Choose which version of the script you wish to use: in `package.json`, change the filename under "main" to be that script. By default, I've set this to `qlab-mon-open-stage-control.js`.

In terminal, enter: `node .`. Leave this terminal window open, and it will constantly send Qlab a message every 0.5s (by default) to request the playhead position on the cue list specified.

### Command Line Variables

You can control several variables when launching the scripts - simply add the following after `node .` if you desire.

- `--cuelist, -q`, to set the cue list number to monitor
- `--qlabip, --qi`, to set the IP address for qlab
- `--qlabport, --qp`, to set the OSC port to send to qlab
- `--displayip, --di`, to set the IP address for the computer running the display (Companion or Open Stage Control)
- `--displayport, -d`, to set the OSC port of the display software
- `--companionpage, --cp`, on streamdeck to set the page to display the information
- `--cuenumberbutton, --cqnum`, on streamdeck to set the button which displays the cue number
- `--cuenamebutton, --cqname`, on streamdeck to set the button which displays the cue name
- `--help, -h` to see a list of all available options on the script you're using

### qlab-mon.js

The terminal window will display the number and name of the playhead position, updating automatically every 0.5s.

### qlab-mon-streamdeck.js

If you have Bitfocus Companion open, the buttons you set should update automatically.

### qlab-mon-open-stage-control.js

Once you start Open Stage Control on the correct port, with the correct template open, this template should update.

If you are using the included template, `open-stage-control-template.json`, try setting this file in the "load" option before clicking the 'play' button to start Open Stage Control. This will automatically load the file, and enable you to log into, for example, http://127.0.0.1:7000 remotely and see this information too.

## Limitations

To use this method, the cue list you wish to monitor must have a cue number. e.g., for "Click Tracks", you might number the cue list "CLICK".

## Screenshots

### Launching the script from the macOS terminal
![Launching the script from macOS terminal](https://github.com/bsmith96/qlab-display/blob/88a575394aa7cfd73a8b2e9f0469c437339c826e/_images/1%20Launch%20from%20terminal.png)

### Setting custom options when launching the script from the macOS terminal
![Launching the script with custom options](https://github.com/bsmith96/qlab-display/blob/88a575394aa7cfd73a8b2e9f0469c437339c826e/_images/2%20Set%20options%20from%20terminal.png)

### The Qlab Display working in Open Stage Control
![Qlab Display in Open Stage Control](https://github.com/bsmith96/qlab-display/blob/d455d86049b6652e5e1927ed41af07260de47376/_images/3%20Open%20Stage%20Control%20display.png)

### Qlab Display when Qlab has disconnected
![Qlab Display when disconnected](https://github.com/bsmith96/qlab-display/blob/d455d86049b6652e5e1927ed41af07260de47376/_images/4%20Disconnected%20display.png)
