const catImages = [
  'images/gato1.png',
  'images/gato2.png',
  'images/gato3.png',

// imagem padrao
        "images/img-padrao/gato-preto-sentado.png",
        "images/img-padrao/gato-branco-sentado.png",
        "images/img-padrao/gato-siames-sentado.png",
        "images/img-padrao/gato-brancopreto-sentado.png",
        // animacao sentado
        "images/gatos/animation-1/preto.gif",
        "images/gatos/animation-1/branco.gif",
        "images/gatos/animation-1/siames.gif",
        "images/gatos/animation-1/branco-manchas-pretas.gif",

        // amimacao carregado
        "images/gatos/animation-2/gato-preto-carregado.png",
        "images/gatos/animation-2/gato-branco-carregado.png",
        "images/gatos/animation-2/gato-siames-carregado.png",
        "images/gatos/animation-2/gato-branco-preto-carregado.png",
];

let currentIndex = 0;

const catImage = document.getElementById('cat-image');
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');
const addCatButton = document.getElementById('add-cat');
const nameInput = document.getElementById('cat-name');
const container = document.getElementById('selected-cats');

// Verificar se a API do Chrome está disponível
if (typeof chrome === 'undefined' || !chrome.storage) {
  console.error('Chrome API não está disponível!');
  alert('Erro: A extensão não está funcionando corretamente. Recarregue a extensão.');
}

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

// Carregar gatos salvos ao abrir o popup
function loadSavedCats() {
  chrome.storage.local.get(['allCats'], (result) => {
    const cats = result.allCats || [];
    container.innerHTML = ''; // Limpar container

    cats.forEach(cat => {
      displayCatInPopup(cat);
    });
  });
}

// Exibir gato no popup
function displayCatInPopup(cat) {
  const catDiv = document.createElement('div');
  catDiv.classList.add('selected-cat');
  catDiv.dataset.catId = cat.id;

  const nameContainer = document.createElement('div');
  nameContainer.classList.add('cat-name-container');

  const nameEl = document.createElement('span');
  nameEl.classList.add('cat-name');
  nameEl.textContent = cat.name;

  const removeBtn = document.createElement('button');
  removeBtn.classList.add('remove-cat');
  removeBtn.innerHTML = '&times;';

  nameContainer.appendChild(nameEl);
  nameContainer.appendChild(removeBtn);
  catDiv.appendChild(nameContainer);

  if (cat.name.toLowerCase() === 'megumi') {
    const subtitle = document.createElement('div');
    subtitle.classList.add('cat-subtitle');
    subtitle.textContent = 'cabeção';
    catDiv.appendChild(subtitle);
  }

  const img = document.createElement('img');
  img.src = cat.image;
  catDiv.appendChild(img);

  container.appendChild(catDiv);
}

// Adicionar gato
addCatButton.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert('Digite um nome para o gato!');
    return;
  }

  const newCat = {
    id: Date.now().toString(), // ID único para cada gato
    name: name,
    image: catImages[currentIndex]
  };

  // Buscar todos os gatos salvos
  chrome.storage.local.get(['allCats'], (result) => {
    const cats = result.allCats || [];
    cats.push(newCat);

    // Salvar array atualizado
    chrome.storage.local.set({ allCats: cats }, () => {
      // Adicionar gato no popup
      displayCatInPopup(newCat);
      nameInput.value = '';

      // Tocar som
      let sound;
      if (name.toLowerCase() === 'megumi') {
        sound = new Audio('audio/gato-rindo.mp3');
      } else {
        sound = new Audio('audio/miado.mp3');
      }
      sound.volume = 0.3;
      sound.play().catch(() => console.log('Erro ao tocar som'));

      setTimeout(() => {
        sound.pause();
        sound.currentTime = 0;
      }, 2000);

      // Injetar gato em TODAS as abas
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          // Verificar se a aba pode receber scripts (não são páginas do chrome://)
          if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: addCatToPage,
              args: [newCat]
            }).catch(() => {
              console.log(`Não foi possível adicionar gato na aba ${tab.id}`);
            });
          }
        });
      });
    });
  });
});

// Remover gato
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('remove-cat')) {
    const catElement = e.target.closest('.selected-cat');
    const catId = catElement.dataset.catId;
    const catName = catElement.querySelector('.cat-name').innerText;

    if (confirm(`Deseja remover o gato "${catName}"?`)) {
      // Tocar som
      const removeSound = new Audio('audio/death-bong.mp3');
      removeSound.volume = 0.3;
      removeSound.play().catch(() => {
        console.log('Não foi possível tocar o som de remoção');
      });

      // Remover do storage
      chrome.storage.local.get(['allCats'], (result) => {
        const cats = result.allCats || [];
        const updatedCats = cats.filter(cat => cat.id !== catId);

        chrome.storage.local.set({ allCats: updatedCats }, () => {
          // Remover da interface
          setTimeout(() => {
            catElement.remove();
          }, 300);

          // Remover de todas as abas
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: removeCatFromPage,
                  args: [catId]
                }).catch(() => {
                  console.log(`Não foi possível remover gato da aba ${tab.id}`);
                });
              }
            });
          });
        });
      });

      setTimeout(() => {
        removeSound.pause();
        removeSound.currentTime = 0;
      }, 2000);
    }
  }
});

// Carregar gatos ao abrir o popup
loadSavedCats();

// Função que será injetada na página para ADICIONAR gato
function addCatToPage(cat) {
  // Verificar se já existe
  if (document.querySelector(`[data-cat-id="${cat.id}"]`)) return;

  const wrapper = document.createElement('div');
  wrapper.classList.add('floating-cat');
  wrapper.dataset.catId = cat.id;
  wrapper.style.position = 'fixed';
  wrapper.style.bottom = '10px';
  wrapper.style.right = `${10 + (document.querySelectorAll('.floating-cat').length * 110)}px`;
  wrapper.style.zIndex = '9999';
  wrapper.style.cursor = 'grab';
  wrapper.draggable = true;

  const nameDiv = document.createElement('div');
  nameDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
  nameDiv.style.color = 'white';
  nameDiv.style.padding = '5px';
  nameDiv.style.borderRadius = '5px';
  nameDiv.style.fontSize = '12px';
  nameDiv.style.textAlign = 'center';
  nameDiv.textContent = cat.name;

  const img = document.createElement('img');
  img.src = chrome.runtime.getURL(cat.image);
  img.alt = cat.name;
  img.style.width = '100px';
  img.style.height = 'auto';
  img.style.display = 'block';

  wrapper.appendChild(nameDiv);
  wrapper.appendChild(img);
  document.body.appendChild(wrapper);
}

// Função que será injetada na página para REMOVER gato
function removeCatFromPage(catId) {
  const catElement = document.querySelector(`[data-cat-id="${catId}"]`);
  if (catElement) {
    catElement.remove();
  }
}