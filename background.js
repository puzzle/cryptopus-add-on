var user, token;

browser.runtime.onMessage.addListener(setUser)

function setUser(message){
  if(typeof user == 'undefined' && typeof token == 'undefined'){
    user = message['user'];
    token = message['token'];
    browser.runtime.onMessage.removeListener(setUser);
  }
}

