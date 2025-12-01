// Verificar se a API do Chrome está disponível
// Verificar se a API do Chrome está disponível
if (typeof chrome !== 'undefined' && chrome.storage) {

  // Função para carregar e renderizar os gatos
  function loadCats() {
    chrome.storage.local.get(['allCats'], (result) => {
      const cats = result.allCats || [];
      console.log('Carregando gatos no content.js:', cats); // Para debug

      cats.forEach((cat, index) => {
        // Verificar se o gato já existe na página
        if (document.querySelector(`[data-cat-id="${cat.id}"]`)) return;

        const wrapper = document.createElement('div');
        wrapper.classList.add('floating-cat');
        wrapper.dataset.catId = cat.id;
        wrapper.style.position = 'fixed';
        wrapper.style.bottom = '10px';
        wrapper.style.right = `${10 + (index * 110)}px`;
        wrapper.style.zIndex = '9999';
        wrapper.style.cursor = 'grab';

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
        img.style.width = '120px';
        img.style.height = 'auto';
        img.style.display = 'block';
        
        console.log('URL no content.js:', img.src); // Para debug

        wrapper.appendChild(nameDiv);
        wrapper.appendChild(img);
        document.body.appendChild(wrapper);
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
      console.log('Storage mudou:', changes.allCats); // Para debug
      // Remover gatos antigos
      document.querySelectorAll('.floating-cat').forEach(cat => cat.remove());
      // Carregar novos gatos
      loadCats();
    }
  });
}