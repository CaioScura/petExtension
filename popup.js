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

function updateCatImage(direction) {
  catImage.classList.remove('slide-left', 'slide-right');
  void catImage.offsetWidth;
  catImage.src = catImages[currentIndex];
  catImage.classList.add(direction === 'left' ? 'slide-left' : 'slide-right');
}

leftArrow.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + catImages.length) % catImages.length;
  updateCatImage('left');
});

rightArrow.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % catImages.length;
  updateCatImage('right');
});

addCatButton.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert('Digite um nome para o gato!');
    return;
  }

  const catDiv = document.createElement('div');
  catDiv.classList.add('selected-cat');

  const nameContainer = document.createElement('div');
  nameContainer.classList.add('cat-name-container');

  const nameEl = document.createElement('span');
  nameEl.classList.add('cat-name');
  nameEl.textContent = name;

  const removeBtn = document.createElement('button');
  removeBtn.classList.add('remove-cat');
  removeBtn.innerHTML = '&times;';

  nameContainer.appendChild(nameEl);
  nameContainer.appendChild(removeBtn);
  catDiv.appendChild(nameContainer);

  if (name.toLowerCase() === 'megumi') {
    const subtitle = document.createElement('div');
    subtitle.classList.add('cat-subtitle');
    subtitle.textContent = 'cabeção';
    catDiv.appendChild(subtitle);
  }

  const img = document.createElement('img');
  img.src = catImages[currentIndex];
  catDiv.appendChild(img);

  container.appendChild(catDiv);
  nameInput.value = '';

  // som no popup (opcional)
  let sound;
  if (name.toLowerCase() === 'megumi') {
    sound = new Audio('audio/gato-rindo.mp3');
  } else {
    sound = new Audio('audio/miado.mp3');
  }
  sound.volume = 0.3;
  sound.play();

  setTimeout(() => {
    sound.pause();
    sound.currentTime = 0;
  }, 2000);

  const selectedCat = {
    name,
    image: catImages[currentIndex]
  };

  chrome.storage.local.set({ selectedCat }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: showCatInPage,
        args: [selectedCat]
      });
    });
  });
});

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('remove-cat')) {
    const catElement = e.target.closest('.selected-cat');
    const catName = catElement.querySelector('.cat-name').innerText;

    if (confirm(`Deseja remover o gato "${catName}" da tela?`)) {
      catElement.remove();
    }
  }
});

// Esta função será injetada na aba ativa do navegador
function showCatInPage(cat) {
  if (document.getElementById('floating-cat')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'floating-cat';
  wrapper.style.position = 'fixed';
  wrapper.style.bottom = '10px';
  wrapper.style.right = '10px';
  wrapper.style.zIndex = '9999';
  wrapper.style.cursor = 'pointer';

  const img = document.createElement('img');
  img.src = cat.image;
  img.alt = cat.name;
  img.style.width = '100px';
  img.style.height = 'auto';

  wrapper.appendChild(img);
  document.body.appendChild(wrapper);

  let sound;
  if (cat.name.toLowerCase() === 'megumi') {
    sound = new Audio('audio/gato-rindo.mp3');
  } else {
    sound = new Audio('audio/miado.mp3');
  }
  sound.volume = 0.3;
  sound.play();

  setTimeout(() => {
    sound.pause();
    sound.currentTime = 0;
  }, 2000);
}
