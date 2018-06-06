var HOST = "http://localhost:3000";
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
    listApiUsers();
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

function listApiUsers() {
  $.ajax({
    url: HOST + '/api/api_users',
    headers: headers(),
    statusCode: {
      200: function(response) {
        var apiUsers = response['data']['user/apis'];
        selectApiUser(apiUsers);
      },
      401: function() { badCredentials(); },
      500: function() { serverError(); }
    },
    type: 'GET'
  });
}

function selectApiUser(apiUsers){
  if(apiUsers.length != 0) {
    if(apiUsers.length == 1){
      setAndRenewApiUser(apiUsers[0].id);
    } else {
      selectionList(apiUsers);
    }
  } else {
    noApiUsers();
  }
}

function selectionList(apiUsers){
  showApiUserSelectionList(apiUsers);
  setSelectionOnHover();
  setSelectionOnClick();
}


function submitSelection(){
  var elem = $('#select-api-user').find('li.active');

  if(elem.length != 0){
    var id = elem.val();
    setAndRenewApiUser(id);
  }
}

function setAndRenewApiUser(id){
  $.ajax({
    url: HOST + '/api/api_users/' + id + '/token',
    headers: headers(),
    success: function(response) {
      var api = response['data']['user/api'];
      var token = response['messages']['info'][0].split(':')[1].trim();

      browser.runtime.sendMessage({'user':api, 'token':token});
      window.close();
    },
    type: 'GET'
  });
}

function headers(){
  return {
      'Authorization-User': credentials()[0],
      'Authorization-Password': btoa(credentials()[1])
  };
}

function credentials(){
  var username = $('#username').val().trim();
  var password = $('#password').val().trim();
  return [ username, password ]
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
      href: HOST + "/en/profile",
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
