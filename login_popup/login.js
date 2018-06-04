var host = "http://localhost:3000";
var ENTER = 13;
var UP = 38;
var DOWN = 40;

$('#login').click((e) => {
  connectApi();
});

$(document).keydown((e) => {
  if(!$('#login-form').hasClass('hidden') && e.which == ENTER){
    connectApi();
  } else if (!$('#select-api-user').hasClass('hidden')){
    switch(e.which){
      case(ENTER):
        submitSelection();
        break;
      case(UP):
        changeSelection(-1);
        break;
      case(DOWN):
        changeSelection(1);
        break;
    }
  }
});

function connectApi(){
  if(validateInput()){
    var username = $('#username').val().trim();
    var password = $('#password').val().trim();
    console.log(username + ' : ' + password);
    listApiUsers(username, password);
  }
}

function  validateInput() {
  var name = validate($('#username'));
  var pass = validate($('#password'));
  return name && pass;
}

function validate(elem) {
  var string = elem.val();
  if(string === null || typeof string !== 'string' || string.trim() === ''){
    elem.attr('placeholder', elem.attr('name') + ' needed');
    elem.addClass('border-danger');
    return false;
  }else if(elem.hasClass('border-danger')){
    elem.removeClass('border-danger');
  }
  return true;
}

function listApiUsers(username, password) {
  $.ajax({
    url: host + '/api/api_users',
    headers: headers(username, password),
    statusCode: {
      200: function(response) {
        var apiUsers = response['data']['user/apis'];
        if(apiUsers) {
          if(apiUsers.length == 1){
            setApiUser(apiUsers[0].id, username, password)
          } else {
            apiUserSelect(apiUsers);
          }
        } else {
          noApiUsers();
        }
      },
      401: function() { badCredentials() },
      500: function() { serverError() }
    },
    type: 'GET'
  });
}

function apiUserSelect(apiUsers){
  $('#login-form').addClass('hidden');
  $('#select-api-user').removeClass('hidden');
  apiUsers.forEach(function(api) {
    $('#api-user-list').append('<li class="list-group-item" value=' + api.id + '>' + api.username + '</li>');
  });
  $('#api-user-list').find('li').first().addClass('active');
}

function changeSelection(diff){
  var currentSelection = $('#select-api-user').find('li.active');
  var nextIndex = keepInBounds(currentSelection.index() + diff);

  var nextSelection = $('#select-api-user').find('li')[nextIndex];

  currentSelection.removeClass('active');
  $(nextSelection).addClass('active');
}

function keepInBounds(i){
  var max = $('#select-api-user').find('li').length-1;
  var min = 1;

  if(i < 0){
    return max;
  } else if (i > max){
    return 0;
  } else {
    return i;
  }
}

function submitSelection(){
  var username = $('#username').val().trim();
  var password = $('#password').val().trim();
  var id = $('#select-api-user').find('li.active').val();
  setApiUser(id, username, password)
}

function setApiUser(id, username, password){
  $.ajax({
    url: host + '/api/api_users/' + id + '/token',
    headers: headers(username, password),
    success: function(response) {
      var api = response['data']['user/api'];
      var token = response['messages']['info'][0].split(':')[1].trim();

      browser.runtime.sendMessage({'user':api, 'token':token});
      window.close();
    },
    type: 'GET'
  });
}

function badCredentials(){
  console.log('enter badCredentials');
}

function serverError(){
  console.log('enter serverError');
}

function headers(username, password){
  return {
      'Authorization-User': username,
      'Authorization-Password': btoa(password)
  };
}
