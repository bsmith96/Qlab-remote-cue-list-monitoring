/**
 * @description Open Stage Control - Custom Module to retrieve Qlab playhead in a certain cue list
 * @author Ben Smith
 * @link bensmithsound.uk
 * @version 3.0.0-beta1
 * @about Asks for updates from Qlab, then interprets the appropriate replies and displays the results.
 * 
 * @changelog
 *   v3.0.0-beta1  - implementation of backup Qlab switch - manual changeover
 */


/*******************************************
 ***********  USER CUSTOMISATION  **********
 *******************************************/

// Use TCP or UDP?
// If false, sends thump (heartbeat) to Qlab every 20 seconds to maintain UDP connection.
// If true, disables the thump (heartbeat) command.
const useTCP = true;


/*******************************************
 ***************  VARIABLES  ***************
 *******************************************/

var config = loadJSON("qlab-info-config.json");

var nameAddress = config.control.address.name;
var numAddress = config.control.address.number;

if (config.QlabCount = 1) {
  var qlabCount = config.QlabCount;
  var qlabIP = config.QlabMain.ip;
  var workspaceID = config.QlabMain.workspaceID;
  var cueListID = config.QlabMain.cueListID;
} else if (config.QlabCount = 2) {
  var qlabCount = config.QlabCount;
  var qlabIP = config.QlabMain.ip;
  var workspaceID = config.QlabMain.workspaceID;
  var cueListID = config.QlabMain.cueListID;
  var qlabIP_B = config.QlabBackup.ip;
  var workspaceID_B = config.QlabBackup.workspaceID;
  var cueListID_B = config.QlabBackup.cueListID;
};

var whichQlab = "MAIN"

// config includes data for Backup Qlab – this has not yet been implemented


/*******************************************
 ***************  FUNCTIONS  ***************
 *******************************************/

function decodeQlabReply(args) {
  var replyData = JSON.parse(args[0].value); // decode the JSON reply from Qlab
  var toReturn = replyData.data; // get the cue display name from within the JSON
  return toReturn;
}

// HEARTBEAT FUNCTION for staying connected over UDP. Not required if using TCP.
function sendThump(id) {
  const thump = "/workspace/" + id + "/thump";

  setInterval(function(){
    send(qlabIP, 53000, thump);
  }, 20000);
}

// Single heartbeat command for checking connection
function singlethump(id, ip) {
  const thump = "/workspace/" + id + "/thump";

  send(ip, 53000, thump);
}


/*******************************************
 **************  MAIN ROUTINE  *************
 *******************************************/

module.exports = {

  // ON START, ASK QLAB FOR UPDATES
  init:function(){
    send(qlabIP, 53000, '/workspace/' + workspaceID + '/updates', 1);

    if (useTCP == false) {
    sendThump(workspaceID);
    };
  },

  // FILTER ALL INCOMING MESSAGES
  oscInFilter:function(data){

      var {address, args, host, port} = data;

      if (whichQlab === "MAIN" && host === qlabIP) {

        // when receiving an update with the playhead's cue id, ask for name and number
        // does not pass this message on to the server
        if (address === "/update/workspace/" + workspaceID + "/cueList/" + cueListID + "/playbackPosition") {
          send(host, 53000, '/cue_id/' + args[0].value + '/displayName');
          send(host, 53000, '/cue_id/' + args[0].value + '/number');
          return
        }
        
        // when receiving a reply with the name, interpret and send to server
        if (address.startsWith("/reply")) {
          var returnedValue = decodeQlabReply(args); // decode the reply to get the value requested
          if (address.endsWith("/displayName")) {
            receive(host, 53001, nameAddress, returnedValue) // send the name to the server
          } else if (address.endsWith("/number")) {
            receive(host, 53001, numAddress, returnedValue) // send the number to the server
          }
          return
        }

        if (address.endsWith("/disconnect")) {
          receive(host, 53001, "/NOTIFY", "Qlab is disconnected");
          receive(host, 53001, nameAddress, "QLAB IS DISCONNECTED");
          return
        }

      } else if (whichQlab === "BACKUP" && host === qlabIP_B) {

        if (address === "/update/workspace/" + workspaceID + "/cueList/" + cueListID + "/playbackPosition") {
          send(host, 53000, '/cue_id' + args[0].value + '/displayName');
          send(host, 53000, '/cue_id' + args[0].value + '/number');
          return
        }

        if (address.startsWith("/reply")) {
          var returnedValue = decodeQlabReply(args);
          if (address.endsWith("/displayName")) {
            receive(host, 53001, nameAddress, returnedValue)
          } else if (address.endsWith("/number")) {
            receive(host, 53001, numAddress, returnedValue)
          }
          return
        }

        if (address.endsWith("/disconnect")) {
          receive(host, 53001, "/NOTIFY", "Qlab is disconnected");
          receive(host, 53001, nameAddress, "QLAB IS DISCONNECTED");
          return
        }
      }

      return {address, args, host, port}

  },

  // FILTER ALL OUTGOING MESSAGES
  oscOutFilter:function(data){

    var {address, args, host, port, clientId} = data;
    
    // Refresh button
    if (address === "/module/refresh") {
      send(qlabIP, 53000, '/workspace/' + workspaceID + '/updates', 1);
      send(qlabIP_B, 53000, '/workspace/' + workspaceID_B + '/updates', 1);
    };

    // Switch Qlab button
    if (address === "/module/switch") {
      whichQlab = args[0].value
    }

    return {address, args, host, port}
  }

}
