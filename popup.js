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

  //gato fantasma
  {
    preview: 'images/img-padrao/gato-fantasma.png',
    animation: 'images/gatos/animation-1/fantasma/gato-fantasma1.png'
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
      const nomesSusto = ['megumi', 'megumao', 'megu', 'megumote'];

      if (nomesSusto.includes(name.toLowerCase())) {
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

          
            //url das animações -> antes de injetar
            const animationIdle1 = newCat.image;
            let animationCarried = animationIdle1.replace('animation-1', 'animation-2');
            let animationIdle3 = null;



            // //verificar quais os gatos que tem a animação 3
            // if (animationIdle1.includes('preto.png') && !animationIdle1.includes('branco')) {
            //   animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('preto.png', 'gato-preto-deitado.png');
            // } else if (animationIdle1.includes('branco.png') && !animationIdle1.includes('manchas') && !animationIdle1.includes('mancha') && !animationIdle1.includes('malhado')) {
            //   animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('branco.png', 'gato-branco-deitado.png');
            // } else if (animationIdle1.includes('siames.png')) {
            //   animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('siames.png', 'gato-siames-deitado.png');
            // }

            //verificar quais os gatos que tem a animação 3
            if (animationIdle1.includes('preto.png') && !animationIdle1.includes('branco')) {
              animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('preto.png', 'gato-preto-deitado.png');
            } 

            else if (animationIdle1.includes('branco.png') && !animationIdle1.includes('manchas') && !animationIdle1.includes('mancha') && !animationIdle1.includes('malhado')) {
              animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('branco.png', 'gato-branco-deitado.png');
            } 
            
            else if (animationIdle1.includes('siames.png')) {
              animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('siames.png', 'gato-siames-deitado.png');
            }
            
            else if (animationIdle1.includes('branco-manchas-pretas.png')) {
              animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('branco-manchas-pretas.png', 'branco-manchas-pretas-deitado.png');
            }
            
            else if (animationIdle1.includes('gato-branco-mancha-laranja-preto.png')) {
              animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('gato-branco-mancha-laranja-preto.png', 'gato-branco-mancha-laranja-preto-deitado.png');
            }
            
            else if (animationIdle1.includes('branco-malhado-cinza.png')) {
              animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('branco-malhado-cinza.png', 'gato-cinza-malhado-deitado.png');
            }
            
            else if (animationIdle1.includes('gato-laranja.png')) {
              animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('gato-laranja.png', 'gato-laranja-deitado.png');
            }




            // ANIMAÇÃO 4 : caixa papelao
            let animationIdle4 = null;
            if (animationIdle1.includes('preto.png') && !animationIdle1.includes('branco')) {
              animationIdle4 = animationIdle1.replace('animation-1', 'animation-4').replace('preto.png', 'gato-preto-caixa.png');
            } 
            
            else if (animationIdle1.includes('branco.png')) {
              animationIdle4 = animationIdle1.replace('animation-1', 'animation-4').replace('branco.png', 'gato-branco-caixa.png');
            }
            
            else if (animationIdle1.includes('siames.png')) {
              animationIdle4 = animationIdle1.replace('animation-1', 'animation-4').replace('siames.png', 'gato-siames-caixa.png');
            }

            else if (animationIdle1.includes('branco-manchas-pretas.png')) {
              animationIdle4 = animationIdle1.replace('animation-1', 'animation-4').replace('branco-manchas-pretas.png', 'gato-branco-manchas-pretas-caixa.png');
            }

            else if (animationIdle1.includes('gato-branco-mancha-laranja-preto.png')) {
              animationIdle4 = animationIdle1.replace('animation-1', 'animation-4').replace('gato-branco-mancha-laranja-preto.png', 'gato-branco-manchas-laranjas-pretas-caixa.png');
            }

            else if (animationIdle1.includes('gato-laranja.png')) {
              animationIdle4 = animationIdle1.replace('animation-1', 'animation-4').replace('gato-laranja.png', 'gato-laranja-caixa.png');
            }

            else if (animationIdle1.includes('branco-malhado-cinza.png')) {
              animationIdle4 = animationIdle1.replace('animation-1', 'animation-4').replace('branco-malhado-cinza.png', 'gato-malhado-cinza-caixa.png');
            }



            //ANIMAÇÃO 5: dormindo
            let animationIdle5 = null;
            if (animationIdle1.includes('preto.png') && !animationIdle1.includes('branco')) {
              animationIdle5 = animationIdle1.replace('animation-1', 'animation-5').replace('preto.png', 'gato-preto-dormindo.png');
            } 
            
            else if (animationIdle1.includes('branco.png') && !animationIdle1.includes('manchas') && !animationIdle1.includes('mancha') && !animationIdle1.includes('malhado')) {
              animationIdle5 = animationIdle1.replace('animation-1', 'animation-5').replace('branco.png', 'gato-branco-dormindo.png');
            }

            else if (animationIdle1.includes('siames.png') && !animationIdle1.includes('manchas') && !animationIdle1.includes('mancha') && !animationIdle1.includes('malhado')) {
              animationIdle5 = animationIdle1.replace('animation-1', 'animation-5').replace('siames.png', 'gato-siames-dormindo.png');
            }

            else if (animationIdle1.includes('branco-malhado-cinza.png') && !animationIdle1.includes('manchas') && !animationIdle1.includes('mancha') && !animationIdle1.includes('malhado')) {
              animationIdle5 = animationIdle1.replace('animation-1', 'animation-5').replace('branco-malhado-cinza.png', 'gato-malhado-cinza-dormindo.png');
            }

           



            //ajustar a animação 2 dos gatos
            if (animationCarried.includes('preto.png') && !animationCarried.includes('branco')) {
              animationCarried = animationCarried.replace('preto.png', 'gato-preto-carregado.png');
            } else if (animationCarried.includes('branco.png') && !animationCarried.includes('manchas') && !animationCarried.includes('mancha') && !animationCarried.includes('malhado')) {
              animationCarried = animationCarried.replace('branco.png', 'gato-branco-carregado.png');
            } else if (animationCarried.includes('siames.png')) {
              animationCarried = animationCarried.replace('siames.png', 'gato-siames-carregado.png');
            } else if (animationCarried.includes('gato-branco-mancha-laranja-preto.png')) {
              animationCarried = animationCarried.replace('gato-branco-mancha-laranja-preto.png', 'gato-branco-mancha-laranja-preto-carregado.png');
            } else if (animationCarried.includes('branco-manchas-pretas.png')) {
              animationCarried = animationCarried.replace('branco-manchas-pretas.png', 'gato-branco-preto-carregado.png');
            } else if (animationCarried.includes('gato-laranja.png')) {
              animationCarried = animationCarried.replace('gato-laranja.png', 'gato-laranja-carregado.png');
            } else if (animationCarried.includes('branco-malhado-cinza.png')) {
              animationCarried = animationCarried.replace('branco-malhado-cinza.png', 'gato-branco-malhado-carregado.png');
            }



            //resolver URLs com chrome.runtime.getURL()
            const catWithResolvedUrls = {
              ...newCat,
              image: chrome.runtime.getURL(animationIdle1),
              animationIdle1: chrome.runtime.getURL(animationIdle1),
              animationIdle3: animationIdle3 ? chrome.runtime.getURL(animationIdle3) : null,
              animationIdle4: animationIdle4 ? chrome.runtime.getURL(animationIdle4) : null,
              animationIdle5: animationIdle5 ? chrome.runtime.getURL(animationIdle5) : null,
              animationCarried: chrome.runtime.getURL(animationCarried)
            };

            
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: addCatToPage,
              args: [catWithResolvedUrls]
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
//funcao é injetada na página, nao tem acesso a chrome.runtime.getURL()
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

  const nameDiv = document.createElement('div');
  nameDiv.style.width = 'auto';
  nameDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
  nameDiv.style.color = '#fefefe';
  nameDiv.style.padding = '5px';
  nameDiv.style.borderRadius = '5px';
  nameDiv.style.fontSize = '12px';
  nameDiv.style.textAlign = 'center';
  nameDiv.style.pointerEvents = 'none';
  nameDiv.textContent = cat.name;

  const img = document.createElement('img');
  img.alt = cat.name;
  img.style.width = '120px';
  img.style.height = 'auto';
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  img.style.userSelect = 'none';
  img.draggable = false;

  // URLs já vêm resolvidas no objeto cat
  const animationIdle1 = cat.animationIdle1;
  const animationIdle3 = cat.animationIdle3;
  const animationIdle4 = cat.animationIdle4;
  const animationIdle5 = cat.animationIdle5;
  const animationCarried = cat.animationCarried;


  //escolher animação aleatória quando o gato é adicioado
  // let currentIdleAnimation = animationIdle1;
  // if (animationIdle3) {
  //   currentIdleAnimation = Math.random() < 0.5 ? animationIdle1 : animationIdle3;
  // }
  let currentIdleAnimation = animationIdle1;
  const availableAnimations = [animationIdle1];
  if (animationIdle3) availableAnimations.push(animationIdle3);
  if (animationIdle4) availableAnimations.push(animationIdle4);

  if (availableAnimations.length > 1) {
    currentIdleAnimation = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
  }


  img.src = currentIdleAnimation;

  wrapper.appendChild(nameDiv);
  wrapper.appendChild(img);
  document.body.appendChild(wrapper);

  let isDragging = false;
  let hasMoved = false;
  let offsetX, offsetY;
  let lastX = 0;
  let animationInterval = null;


  //posiciona o gato
  setTimeout(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['catPositions'], (result) => {
        const positions = result.catPositions || {};
        if (positions[cat.id]) {
          wrapper.style.left = positions[cat.id].left;
          wrapper.style.top = positions[cat.id].top;
          wrapper.style.bottom = 'auto';
          wrapper.style.right = 'auto';
        } else {
          wrapper.style.bottom = '10px';
          wrapper.style.right = `${10 + (document.querySelectorAll('.floating-cat').length - 1) * 110}px`;
        }
      });
    } else {
      wrapper.style.bottom = '10px';
      wrapper.style.right = `${10 + (document.querySelectorAll('.floating-cat').length - 1) * 110}px`;
    }
  }, 100);




//   if (animationIdle3 || animationIdle4) {
//   animationInterval = setInterval(() => {
//     if (!isDragging) {
//       const availableAnimations = [animationIdle1];
//       if (animationIdle3) availableAnimations.push(animationIdle3);
//       if (animationIdle4) availableAnimations.push(animationIdle4);
      
//       currentIdleAnimation = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
//       img.src = currentIdleAnimation;
//     }
//   }, 5000 + Math.random() * 5000);
// }
    if (animationIdle3 || animationIdle4) {
      animationInterval = setInterval(() => {
        if (!isDragging) {
          const availableAnimations = [animationIdle1];
          if (animationIdle3) availableAnimations.push(animationIdle3);
          if (animationIdle4) availableAnimations.push(animationIdle4);
          
          // Se animation-5 existe e está em animation-3, pode ativar animation-5
          if (animationIdle5 && currentIdleAnimation === animationIdle3 && Math.random() < 0.3) {
            currentIdleAnimation = animationIdle5;
          } else {
            currentIdleAnimation = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
          }
          
          img.src = currentIdleAnimation;
        }
      }, 5000 + Math.random() * 5000);
    }


  wrapper.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    hasMoved = false;
    lastX = e.clientX;
    wrapper.style.cursor = 'grabbing';
    
    img.src = animationCarried;
    img.style.transform = 'scaleX(1)';
    
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

    const direction = e.clientX - lastX;
    if (direction > 0) {
      img.style.transform = 'scaleX(1)';
    } else if (direction < 0) {
      img.style.transform = 'scaleX(-1)';
    }
    lastX = e.clientX;
    
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
    
    //volta para a animação anterior apos soltar o mouse
    img.src = currentIdleAnimation;
    img.style.transform = 'scaleX(1)';


    // Salvar posição
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['catPositions'], (result) => {
        const positions = result.catPositions || {};
        positions[cat.id] = {
          left: wrapper.style.left,
          top: wrapper.style.top
        };
        chrome.storage.local.set({ catPositions: positions });
      });
    }
  });



  // Som ao clicar
  wrapper.addEventListener('click', (e) => {
    if (hasMoved) {
      hasMoved = false;
      return;
    }
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const audio = new Audio(chrome.runtime.getURL('audio/miado.mp3'));
      audio.volume = 0.4;
      audio.play().catch(() => console.log('Erro ao tocar miado'));
      
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 2000);
    }
  });


  // Limpar interval
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === wrapper && animationInterval) {
          clearInterval(animationInterval);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true });
}



//funcao injetada para remover o gato
function removeCatFromPage(catId) {
  const catElement = document.querySelector(`[data-cat-id="${catId}"]`);
  if (catElement) {
    catElement.remove();
  }
}



// funcao mostrear imagem susto
function mostrarImagemSusto() {
  const sustos = [
    'images/susto1.png',
    'images/susto2.png',
    'images/susto3.png',
    'images/susto4.png'
  ];

  const imagemAleatoria = sustos[Math.floor(Math.random() * sustos.length)];
  const imagemUrl = chrome.runtime.getURL(imagemAleatoria);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && !tabs[0].url.startsWith('chrome://') && !tabs[0].url.startsWith('chrome-extension://')) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: mostrarSustoNaPagina,
        args: [imagemUrl]
      }).catch(() => {
        console.log('Não foi possível mostrar susto na página');
      });
    }
  });
}


function mostrarSustoNaPagina(imagemUrl) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.2s ease';

  const img = document.createElement('img');
  img.src = imagemUrl;
  img.style.maxWidth = '200%';
  img.style.maxHeight = '200%';
  img.style.imageRendering = 'pixelated';
  img.style.transform = 'scale(4.5)';
  img.style.transition = 'transform 0.2s ease';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '1';
    img.style.transform = 'scale(1)';
  }, 10);

  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }, 1000);
}