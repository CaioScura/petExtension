// const catImages = [
//   'images/gato1.png',
//   'images/gato2.png',
//   'images/gato3.png',
// ];

const catImages = [
  {
    preview: 'images/img-padrao/gato-preto-sentado.png',
    animation: 'images/gatos/animation-1/preto.png'
  },
  {
    preview: 'images/img-padrao/gato-branco-sentado.png',
    animation: 'images/gatos/animation-1/branco.png'
  },
  {
    preview: 'images/img-padrao/gato-siames-sentado.png',
    animation: 'images/gatos/animation-1/siames.png'
  },
  {
    preview: 'images/img-padrao/gato-brancopreto-sentado.png',
    animation: 'images/gatos/animation-1/branco-manchas-pretas.png'
  }
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
  catImage.src = catImages[currentIndex].preview;
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
  img.src = cat.preview || cat.image;  // Usa preview no popup, se não tiver usa a animação
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
    id: Date.now().toString(),
    name: name,
    preview: catImages[currentIndex].preview,
    image: catImages[currentIndex].animation  // Salva a animação para usar na página
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

        mostrarImagemSusto();
      } else {
        sound = new Audio('audio/miado.mp3');
      }
      sound.volume = 0.4;
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
      // Resolver a URL da imagem ANTES de injetar
      const catWithResolvedUrl = {
        ...newCat,
        image: chrome.runtime.getURL(newCat.image)
      };
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: addCatToPage,
        args: [catWithResolvedUrl]
      }).catch((error) => {
        console.log(`Não foi possível adicionar gato na aba ${tab.id}:`, error);
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





// Função para toggle (minimizar/maximizar) a lista de gatos
function initializeToggleCatsList() {
  const toggleBtn = document.getElementById('toggle-cats-list');
  const catsListContainer = document.querySelector('.cats-list-container');
  const iconMinimize = toggleBtn.querySelector('.icon-minimize');
  const iconMaximize = toggleBtn.querySelector('.icon-maximize');

  // Verificar se há estado salvo
  chrome.storage.local.get(['catsListMinimized'], (result) => {
    if (result.catsListMinimized) {
      catsListContainer.classList.add('minimized');
      iconMinimize.style.display = 'none';
      iconMaximize.style.display = 'block';
    }
  });

  toggleBtn.addEventListener('click', () => {
    const isMinimized = catsListContainer.classList.toggle('minimized');
    
    if (isMinimized) {
      // Minimizado - mostrar ícone de maximizar
      iconMinimize.style.display = 'none';
      iconMaximize.style.display = 'block';
    } else {
      // Maximizado - mostrar ícone de minimizar
      iconMinimize.style.display = 'block';
      iconMaximize.style.display = 'none';
    }

    // Salvar estado
    chrome.storage.local.set({ catsListMinimized: isMinimized });
  });
}

// Inicializar toggle da lista
initializeToggleCatsList();





// Função que será injetada na página para ADICIONAR gato
function addCatToPage(cat) {
  console.log('Adicionando gato:', cat);

  if (document.querySelector(`[data-cat-id="${cat.id}"]`)) return;

  const wrapper = document.createElement('div');
  wrapper.classList.add('floating-cat');
  wrapper.dataset.catId = cat.id;
  wrapper.style.position = 'fixed';
  wrapper.style.bottom = '10px';
  wrapper.style.right = `${10 + (document.querySelectorAll('.floating-cat').length * 110)}px`;
  wrapper.style.zIndex = '9999';
  wrapper.style.cursor = 'grab';

  const nameDiv = document.createElement('div');
  nameDiv.style.width = 'auto';
  nameDiv.style.display = 'flex';
  nameDiv.style.justifyContent = 'center';
  nameDiv.style.alignItems = 'center';
  nameDiv.style.justifySelf = 'center';
  nameDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
  nameDiv.style.color = '#fefefe';
  nameDiv.style.padding = '5px';
  nameDiv.style.borderRadius = '5px';
  nameDiv.style.fontSize = '12px';
  nameDiv.style.textAlign = 'center';
  nameDiv.textContent = cat.name;

  const img = document.createElement('img');
  img.src = cat.image;
  img.alt = cat.name;
  img.style.width = '120px';
  img.style.height = 'auto';
  img.style.display = 'block';
  
  console.log('URL da imagem:', img.src);

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



// funcao mostrear imagem susto
function mostrarImagemSusto() {
  // Criar overlay escuro
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.zIndex = '99999';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.animation = 'fadeIn 0.2s ease';

  const sustos = [
    'images/susto1.png',
    'images/susto2.png'
  ];

  const imagemAleatoria = sustos[Math.floor(Math.random() * sustos.length)];


  // Criar imagem de susto
  const img = document.createElement('img');
  img.src = imagemAleatoria;
  img.style.maxWidth = '200%';
  img.style.maxHeight = '200%';
  img.style.imageRendering = 'pixelated';
  img.style.animation = 'zoomIn 0.2s ease';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }, 1000);
}
