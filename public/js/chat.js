const socket = io();

document.querySelector('#increment').addEventListener('click', () => {
  console.log('clicked');
  socket.emit('increment');
});
socket.on('countUpdated', count => {
  console.log('The count has been updated - ' + count);
});
