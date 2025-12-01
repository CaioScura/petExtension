// Verificar se a API do Chrome está disponível
if (typeof chrome !== 'undefined' && chrome.storage) {

  // Função para carregar e renderizar os gatos
  function loadCats() {
    chrome.storage.local.get(['allCats', 'catPositions'], (result) => {
      const cats = result.allCats || [];
      const positions = result.catPositions || {};
      console.log('Carregando gatos no content.js:', cats);

      cats.forEach((cat, index) => {
        // Verificar se o gato já existe na página
        if (document.querySelector(`[data-cat-id="${cat.id}"]`)) return;

        const wrapper = document.createElement('div');
        wrapper.classList.add('floating-cat');
        wrapper.dataset.catId = cat.id;
        wrapper.style.position = 'fixed';
        wrapper.style.zIndex = '9999';
        wrapper.style.cursor = 'grab';
        wrapper.style.userSelect = 'none';

        // Usar posição salva ou posição padrão
        if (positions[cat.id]) {
          wrapper.style.left = positions[cat.id].left;
          wrapper.style.top = positions[cat.id].top;
          wrapper.style.bottom = 'auto';
          wrapper.style.right = 'auto';
        } else {
          wrapper.style.bottom = '10px';
          wrapper.style.right = `${10 + (index * 110)}px`;
        }

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
        img.src = chrome.runtime.getURL(cat.image);
        img.alt = cat.name;
        img.style.width = '120px';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.pointerEvents = 'none';
        img.style.userSelect = 'none';
        img.draggable = false;

        // Guardar as URLs das animações
        const animationIdle = cat.image;
        let animationCarried = cat.image.replace('animation-1', 'animation-2');
        
        // Ajustar nome do arquivo PNG
        if (animationCarried.includes('preto.png')) {
          animationCarried = animationCarried.replace('preto.png', 'gato-preto-carregado.png');
        } else if (animationCarried.includes('branco.png')) {
          animationCarried = animationCarried.replace('branco.png', 'gato-branco-carregado.png');
        } else if (animationCarried.includes('siames.png')) {
          animationCarried = animationCarried.replace('siames.png', 'gato-siames-carregado.png');
        } else if (animationCarried.includes('branco-manchas-pretas.png')) {
          animationCarried = animationCarried.replace('branco-manchas-pretas.png', 'gato-branco-preto-carregado.png');
        }

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
          hasMoved = false; // Reset da flag
          wrapper.style.cursor = 'grabbing';
          
          // Trocar para animação de carregado
          img.src = chrome.runtime.getURL(animationCarried);
          
          const rect = wrapper.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
          
          wrapper.style.zIndex = '99999';
        });

        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          
          e.preventDefault();
          e.stopPropagation();
          
          hasMoved = true; // Marcou que houve movimento
          
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
          img.src = chrome.runtime.getURL(animationIdle);

          // Salvar posição no storage e notificar outras abas
          const newPosition = {
            left: wrapper.style.left,
            top: wrapper.style.top
          };

          chrome.storage.local.get(['catPositions'], (result) => {
            const positions = result.catPositions || {};
            positions[cat.id] = newPosition;
            chrome.storage.local.set({ catPositions: positions }, () => {
              console.log('Posição salva:', cat.id, newPosition);
            });
          });
        });

        // Adicionar som ao clicar no gato (SÓ se não arrastou)
        wrapper.addEventListener('click', (e) => {
          // Não tocar som se arrastou
          if (hasMoved) {
            hasMoved = false; // Reset
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
      });
    });
  }

  // Carregar gatos quando a página estiver pronta
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCats);
  } else {
    loadCats();
  }

  // Escutar mudanças no storage
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.allCats) {
      console.log('Storage mudou:', changes.allCats);
      // Remover gatos antigos
      document.querySelectorAll('.floating-cat').forEach(cat => cat.remove());
      // Carregar novos gatos
      loadCats();
    }
  });
}