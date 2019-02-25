var socket=io();

function scrollToBottom () {
  // Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child')
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

// console.log(socket);
socket.on('connect',function (){
  var params=jQuery.deparam(window.location.search);
  socket.emit('join',params, function(err) {
    if (err) {
      alert(err);
      window.location.href='/';
    } else {

    }
  });
});

socket.on('disconnect',function (){
  console.log('Server Down');
});

socket.on('userList',function (list) {
  var ul=$('<ul></ul>');

  list.forEach(function(user){
    ul.append($('<li></li>').text(user));
  });

  $('.usersList').html(ul);
  console.log(list);
});

socket.on('newMsg',function (msg) {

  var formattedTime=moment(msg.createdAt).format('h:mm a');
  var template=$('#message-template').html();
  var html= Mustache.render(template,{
    from: msg.from,
    text: msg.text,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
});

$('#msg_form').on('submit', function(e){
  e.preventDefault();

  socket.emit('createMsg',{
    text: $('#msg').val()
  },function(){
    $('#msg').val('');
  });
});

function openNav() {
  $('#mySidenav').css("width","100%");
}

function closeNav() {
  $('#mySidenav').css("width","0%");
}
