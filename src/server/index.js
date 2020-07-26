import openSocket from 'socket.io-client';

export let socket = openSocket('https://moore-vk-apps.tk', { path: '/vk_words/socket.io', reconnection: false });

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
