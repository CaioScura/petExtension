const catImages = [
  'images/gato1.png',
  'images/gato2.png',
  'images/gato3.png'
];

let currentIndex = 0;

const catImage = document.getElementById('cat-image');
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');
const addCatButton = document.getElementById('add-cat');
const nameInput = document.getElementById('cat-name');
const container = document.getElementById('selected-cats');

// Atualiza a imagem do gato com base no índice atual
function updateCatImage() {
  catImage.src = catImages[currentIndex];
}

leftArrow.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + catImages.length) % catImages.length;
  updateCatImage();
});

rightArrow.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % catImages.length;
  updateCatImage();
});

addCatButton.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert('Digite um nome para o gato!');
    return;
  }

  const catDiv = document.createElement('div');
  catDiv.classList.add('selected-cat');

  const nameEl = document.createElement('div');
  nameEl.classList.add('cat-name');
  nameEl.textContent = name;

  const img = document.createElement('img');
  img.src = catImages[currentIndex];

  catDiv.appendChild(nameEl);
  catDiv.appendChild(img);
  container.appendChild(catDiv);

  nameInput.value = '';
});
