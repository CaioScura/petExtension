// const catImages = [
//   'images/gato1.png',
//   'images/gato2.png',
//   'images/gato3.png',
// ];

const catImages = [
  //gato preto
  {
    preview: 'images/img-padrao/gato-preto-sentado.png',
    animation: 'images/gatos/animation-1/preto.png'
  },

  //gato branco
  {
    preview: 'images/img-padrao/gato-branco-sentado.png',
    animation: 'images/gatos/animation-1/branco.png'
  },

  //gato siames
  {
    preview: 'images/img-padrao/gato-siames-sentado.png',
    animation: 'images/gatos/animation-1/siames.png'
  },

  //gato branco e preto
  {
    preview: 'images/img-padrao/gato-brancopreto-sentado.png',
    animation: 'images/gatos/animation-1/branco-manchas-pretas.png'
  },

  //gato branco manchas laranjas e pretas
  {
    preview: 'images/img-padrao/gato-branco-mancha-laranja-preto-sentado.png',
    animation: 'images/gatos/animation-1/gato-branco-mancha-laranja-preto.png'
  },

  //gato laranja
  {
    preview: 'images/img-padrao/gato-laranja-sentado.png',
    animation: 'images/gatos/animation-1/gato-laranja.png'
  },

  //gato branco costas malhada cinza
  {
    preview: 'images/img-padrao/branco-malhado-cinza.png',
    animation: 'images/gatos/animation-1/branco-malhado-cinza.png'
  },
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



//carrega os gatos salvos no popup
function loadSavedCats() {
  chrome.storage.local.get(['allCats'], (result) => {
    const cats = result.allCats || [];
    container.innerHTML = '';

    cats.forEach(cat => {
      displayCatInPopup(cat);
    });
  });
}



//exibe o gato no popup
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
  img.src = cat.preview || cat.image; 
  catDiv.appendChild(img);

  container.appendChild(catDiv);
}



//adiciona os gatos
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
    image: catImages[currentIndex].animation
  };

  
  //busca todos os gatos salvos
  chrome.storage.local.get(['allCats'], (result) => {
    const cats = result.allCats || [];
    cats.push(newCat);


    chrome.storage.local.set({ allCats: cats }, () => {
      //adiciona o gato no popup
      displayCatInPopup(newCat);
      nameInput.value = '';

      //toca o audio
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

      //gatos em todas as abas
      chrome.tabs.query({}, (tabs) => {
  tabs.forEach(tab => {


    //verifica se a aba pode receber scripts(páginas do chrome:// nao pode receber)
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

//remove o gato
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


//carregar gaots ao abrir o popup
loadSavedCats();





//função para toggle (minimizar e maximizar) a lista de gatos
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
      
      //icone de maximizar
      iconMinimize.style.display = 'none';
      iconMaximize.style.display = 'block';
    } else {
      
      //icone de minimizar
      iconMinimize.style.display = 'block';
      iconMaximize.style.display = 'none';
    }

    // Salvar estado
    chrome.storage.local.set({ catsListMinimized: isMinimized });
  });
}


//inicializar toggle da lista
initializeToggleCatsList();





//funcao que adiciona o gato na pagina
function addCatToPage(cat) {
  console.log('Adicionando gato:', cat);

  if (document.querySelector(`[data-cat-id="${cat.id}"]`)) return;

  const wrapper = document.createElement('div');
  wrapper.classList.add('floating-cat');
  wrapper.dataset.catId = cat.id;
  wrapper.style.position = 'fixed';
  wrapper.style.zIndex = '9999';
  wrapper.style.cursor = 'grab';
  wrapper.style.userSelect = 'none';


  // Carregar posição salva ou usar posição padrão
  chrome.storage.local.get(['catPositions'], (result) => {
    const positions = result.catPositions || {};
    if (positions[cat.id]) {
      wrapper.style.left = positions[cat.id].left;
      wrapper.style.top = positions[cat.id].top;
      wrapper.style.bottom = 'auto';
      wrapper.style.right = 'auto';
    } else {
      wrapper.style.bottom = '10px';
      wrapper.style.right = `${10 + (document.querySelectorAll('.floating-cat').length * 110)}px`;
    }
  });

  const nameDiv = document.createElement('div');
  nameDiv.style.width = 'auto';
  // nameDiv.style.display = 'flex';
  // nameDiv.style.justifyContent = 'center';
  // nameDiv.style.alignItems = 'center';
  nameDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
  nameDiv.style.color = '#fefefe';
  nameDiv.style.padding = '5px';
  nameDiv.style.borderRadius = '5px';
  nameDiv.style.fontSize = '12px';
  nameDiv.style.textAlign = 'center';
  nameDiv.style.pointerEvents = 'none';
  nameDiv.textContent = cat.name;

  const img = document.createElement('img');
  img.src = cat.image;
  img.alt = cat.name;
  img.style.width = '120px';
  img.style.height = 'auto';
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  img.style.userSelect = 'none';
  img.draggable = false;

  
  //url das animações colocadas mas acima
  const animationIdle = cat.image;
  let animationCarried = cat.image.replace('animation-1', 'animation-2');
  


 //ajusta o nome para png
if (animationCarried.includes('preto.png') && !animationCarried.includes('branco')) {
    animationCarried = animationCarried.replace('preto.png', 'gato-preto-carregado.png');
} 
else if (animationCarried.includes('branco.png') && !animationCarried.includes('manchas') && !animationCarried.includes('mancha') && !animationCarried.includes('malhado')) {
    animationCarried = animationCarried.replace('branco.png', 'gato-branco-carregado.png');
} 
else if (animationCarried.includes('siames.png')) {
    animationCarried = animationCarried.replace('siames.png', 'gato-siames-carregado.png');
}
else if (animationCarried.includes('gato-branco-mancha-laranja-preto.png')) {
    animationCarried = animationCarried.replace('gato-branco-mancha-laranja-preto.png', 'gato-branco-mancha-laranja-preto-carregado.png');
}
else if (animationCarried.includes('branco-manchas-pretas.png')) {
    animationCarried = animationCarried.replace('branco-manchas-pretas.png', 'gato-branco-preto-carregado.png');
}
else if (animationCarried.includes('gato-laranja.png')) {
    animationCarried = animationCarried.replace('gato-laranja.png', 'gato-laranja-carregado.png');
}
else if (animationCarried.includes('branco-malhado-cinza.png')) {
    animationCarried = animationCarried.replace('branco-malhado-cinza.png', 'gato-branco-malhado-carregado.png');
}



  console.log('Animação idle:', animationIdle);
  console.log('Animação carregado:', animationCarried);

  wrapper.appendChild(nameDiv);
  wrapper.appendChild(img);
  document.body.appendChild(wrapper);


  let isDragging = false;
let hasMoved = false;
let offsetX, offsetY;

wrapper.addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  isDragging = true;
  hasMoved = false;
  wrapper.style.cursor = 'grabbing';
  

  //troca para a animação de estar sendo carregado
  img.src = animationCarried;
  
  const rect = wrapper.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  
  wrapper.style.zIndex = '99999';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  hasMoved = true;
  
  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;
  
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;
  wrapper.style.bottom = 'auto';
  wrapper.style.right = 'auto';
});

document.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  isDragging = false;
  wrapper.style.cursor = 'grab';
  wrapper.style.zIndex = '9999';
  
  // Voltar para animação idle
  img.src = animationIdle;

  // Salvar posição no storage
  chrome.storage.local.get(['catPositions'], (result) => {
    const positions = result.catPositions || {};
    positions[cat.id] = {
      left: wrapper.style.left,
      top: wrapper.style.top
    };
    chrome.storage.local.set({ catPositions: positions });
  });
});




//adiciona som ao clicar no gato(apenas o click)
wrapper.addEventListener('click', (e) => {
  // Não tocar som se arrastou
  if (hasMoved) {
    hasMoved = false;
    return;
  }
  
  const audio = new Audio(chrome.runtime.getURL('audio/miado.mp3'));
  audio.volume = 0.4;
  audio.play().catch(() => console.log('Erro ao tocar miado'));
  
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 2000);
});
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
