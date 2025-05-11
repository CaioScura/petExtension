const catImages = ['images/gato1.png', 'images/gato2.png', 'images/gato3.png'];
let currentIndex = 0;

const catImage = document.getElementById('cat-image');
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');

leftArrow.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + catImages.length) % catImages.length;
  catImage.src = catImages[currentIndex];
});

rightArrow.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % catImages.length;
  catImage.src = catImages[currentIndex];
});



document.getElementById('add-cat').addEventListener('click', () => {
  const name = document.getElementById('cat-name').value; 
  alert(`Gato "${name}" com skin ${currentIndex + 1} adicionado!`);
});
