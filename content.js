// Verificar se a API do Chrome está disponível
if (typeof chrome !== 'undefined' && chrome.storage) {



  //funcao para carregar e renderizar os gatos na pagina
  function loadCats() {
    chrome.storage.local.get(['allCats', 'catPositions'], (result) => {
      const cats = result.allCats || [];
      const positions = result.catPositions || {};
      console.log('Carregando gatos no content.js:', cats);

      cats.forEach((cat, index) => {

        //verifica se ja existe
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


        //guarda as urls das animações
        const animationIdle1 = cat.image;
        let animationCarried = cat.image.replace('animation-1', 'animation-2');
        
       

        //verifica se o gato tem animation 3
        let animationIdle3 = null;
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
          animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('branco-manchas-pretas.png', 'gato-siames-deitado.png');
        }
        
        else if (animationIdle1.includes('gato-branco-mancha-laranja-preto.png')) {
          animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('gato-branco-mancha-laranja-preto.png', 'gato-branco-mancha-laranja-preto-deitado.png');
        }
        
        else if (animationIdle1.includes('branco-malhado-cinza.png')) {
          animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('branco-malhado-cinza.png', 'gato-cinza-malhado-deitado.png');
        }
        
        else if (animationIdle1.includes('gato-laranja.png.png')) {
          animationIdle3 = animationIdle1.replace('animation-1', 'animation-3').replace('gato-laranja.png.png', 'gato-laranja-deitado.png');
        }


        //verifica se o gato tem animation 4
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
        //verifica se o gato tem animation 5 (só pode ativar após animation-3)
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



        //ANIMACAO 6: banho
        //verifica se o gato tem animation 6 (só pode ativar após animation-1)
        let animationIdle6 = null;
        if (animationIdle1.includes('preto.png') && !animationIdle1.includes('branco')) {
          animationIdle6 = animationIdle1.replace('animation-1', 'animation-6').replace('preto.png', 'gato-preto-banho.png');
        } 

        else if (animationIdle1.includes('branco.png') && !animationIdle1.includes('manchas') && !animationIdle1.includes('mancha') && !animationIdle1.includes('malhado')) {
          animationIdle6 = animationIdle1.replace('animation-1', 'animation-6').replace('branco.png', 'gato-branco-banho.png');
        }

        else if (animationIdle1.includes('siames.png')) {
          animationIdle6 = animationIdle1.replace('animation-1', 'animation-6').replace('siames.png', 'gato-siames-banho.png');
        }

        else if (animationIdle1.includes('gato-branco-mancha-laranja-preto.png')) {
          animationIdle6 = animationIdle1.replace('animation-1', 'animation-6').replace('gato-branco-mancha-laranja-preto.png', 'gato-branco-mancha-preta-laranja-banho.png');
        }

        else if (animationIdle1.includes('branco-manchas-pretas.png')) {
          animationIdle6 = animationIdle1.replace('animation-1', 'animation-6').replace('branco-manchas-pretas.png', 'gato-branco-manchas-pretas-banho.png');
        }

        


        


        //ajustar nome do arquivo PNG para animation-2
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
        else if (animationCarried.includes('gato-fantasma.png')) {
            animationCarried = animationCarried.replace('gato-fantasma.png', 'fantasma/gato-fantasma1.png');
        }



        //escolher animações aleatoria ao adicionar na tela, caso tenha animation-3
        // let currentIdleAnimation = animationIdle1;
        // if (animationIdle3) {
        //   currentIdleAnimation = Math.random() < 0.5 ? animationIdle1 : animationIdle3;
        // }
        //escolher animações aleatoria ao adicionar na tela
        let currentIdleAnimation = animationIdle1;
        const availableAnimations = [animationIdle1];
        if (animationIdle3) availableAnimations.push(animationIdle3);
        if (animationIdle4) availableAnimations.push(animationIdle4);

        if (availableAnimations.length > 1) {
          currentIdleAnimation = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
        }


        img.src = chrome.runtime.getURL(currentIdleAnimation);

        wrapper.appendChild(nameDiv);
        wrapper.appendChild(img);
        document.body.appendChild(wrapper);





        let isDragging = false;
        let hasMoved = false;
        let offsetX, offsetY;
        let lastX = 0;
        let animationInterval = null;

        
    

        // adicionei animação 5, caso esteja na animação 3
        //alternar as animações aleatoriamente
        // if (animationIdle3 || animationIdle4) {
        //   animationInterval = setInterval(() => {
        //     if (!isDragging) {
        //       const availableAnimations = [animationIdle1];
        //       if (animationIdle3) availableAnimations.push(animationIdle3);
        //       if (animationIdle4) availableAnimations.push(animationIdle4);
              
        //       //se a animation-5 existe e está em animation-3, pode ativar animation-5
        //       if (animationIdle5 && currentIdleAnimation === animationIdle3 && Math.random() < 0.3) {
        //         currentIdleAnimation = animationIdle5;
        //       } else {
        //         currentIdleAnimation = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
        //       }
              
        //       img.src = chrome.runtime.getURL(currentIdleAnimation);
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
              }
              // Se animation-6 existe e está em animation-1, pode ativar animation-6
              else if (animationIdle6 && currentIdleAnimation === animationIdle1 && Math.random() < 0.3) {
                currentIdleAnimation = animationIdle6;
              } 
              else {
                currentIdleAnimation = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
              }
              
              img.src = chrome.runtime.getURL(currentIdleAnimation);
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
          
          img.src = chrome.runtime.getURL(animationCarried);
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
          
          

          //voltar para a animação anterior
          img.src = chrome.runtime.getURL(currentIdleAnimation);
          img.style.transform = 'scaleX(1)';


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


        
        //adiciona o audio quando clica no gato
        wrapper.addEventListener('click', (e) => {

          //se arrastou nao toca o audio
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


        // Limpar interval quando o gato for removido
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
      });
    });
  }



  //carregar os gatos nas paginas
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