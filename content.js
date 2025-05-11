chrome.storage.local.get(['cat', 'catName'], (result) => {
    if (result.cat && result.catName) {
      const img = document.createElement('img');
      img.src = chrome.runtime.getURL(`images/${result.cat}.png`);
      img.style.position = 'fixed';
      img.style.bottom = '10px';
      img.style.right = '10px';
      img.style.width = '100px';
      img.title = result.catName;
      document.body.appendChild(img);
    }
  });
  