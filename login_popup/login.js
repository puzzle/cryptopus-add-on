var host = "http://localhost:3000";
var ENTER = 13;
var UP = 38;
var DOWN = 40;

$('#login').click((e) => {
  connectApi();
});

$(document).keydown((e) => {
  if(!$('#login-form').hasClass('hidden') && e.which == ENTER){
    $('.alert-danger').addClass('hidden');
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
    listApiUsers(host, username, password);
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

function listApiUsers(hostUrl, username, password) {
  $.ajax({
    url: hostUrl + '/api/api_users',
    headers: headers(username, password),
    statusCode: {
      200: function(response) {
        var apiUsers = response['data']['user/apis'];
        if(apiUsers.length != 0) {
          if(apiUsers.length == 1){
            setAndRenewApiUser(apiUsers[0].id, username, password)
          } else {
            apiUserSelect(apiUsers);
          }
        } else {
          noApiUsers();
        }
      },
      401: function() { badCredentials(); },
      500: function() { serverError(); }
    },
    type: 'GET'
  });
}

function apiUserSelect(apiUsers){
  showApiUserSelectionList(apiUsers);
  setSelectionOnHover();
  setSelectionOnClick();
}

function badCredentials(){
  $('#bad-credentials').removeClass('hidden');
}

function serverError(){
  $('#server-error').removeClass('hidden');
}

function noApiUsers(){
  $('#no-api-users').append(
    $('<a>', {
      type: 'text',
      href: host + "/en/profile",
      text: 'Profile page'
    }));
  $('#login-form').addClass('hidden');
  $('#no-api-users').removeClass('hidden');
}

function showApiUserSelectionList(apiUsers){
  $('#login-form').addClass('hidden');
  $('#select-api-user').removeClass('hidden');
  apiUsers.forEach(function(api) {
    $('#api-user-list').append('<li class="list-group-item" value=' + api.id + '>' + api.username + '</li>');
  });
  $('#api-user-list').find('li').first().addClass('active');
}

function setSelectionOnHover() {
  $('#api-user-list').find('li').hover(
    function(){
      var prevElem = $('#select-api-user').find('li.active');
      if(prevElem.length != 0){
        prevElem.removeClass('active');
      }
      $(this).addClass('active');
    },
    function(){
      $(this).removeClass('active');
    });
}

function setSelectionOnClick() {
  $('#api-user-list').find('li').click(function () {
    submitSelection();
  });
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
  setAndRenewApiUser(id, username, password)
}

function setAndRenewApiUser(id, username, password){
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

function headers(username, password){
  return {
      'Authorization-User': username,
      'Authorization-Password': btoa(password)
  };
}
