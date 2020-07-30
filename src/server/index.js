import openSocket from 'socket.io-client';

export let socket = openSocket(process.env.REACT_APP_SERVER_URL, {
  query: window.location.search.slice(1),
  reconnection: false
});

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log('Соединение закрыто чисто');
  } else {
    console.log('Обрыв соединения');
  }
};

socket.onerror = function(error) {
  console.log("Ошибка " + error.message);
};
