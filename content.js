window.addEventListener('message', event => {
  if (event.data.type === 'ADD_CAT') {
    const { image, name } = event.data.cat;

    const existing = document.querySelector(`.floating-cat[data-name="${name}"]`);
    if (existing) return;

    const catDiv = document.createElement('div');
    catDiv.className = 'floating-cat';
    catDiv.dataset.name = name;

    const nameContainer = document.createElement('div');
    nameContainer.className = 'cat-name-container';

    const span = document.createElement('span');
    span.textContent = name;
    span.className = 'cat-name';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-cat';
    removeBtn.onclick = () => {
      if (confirm(`Remover o gato "${name}"?`)) {
        catDiv.remove();
      }
    };

    nameContainer.appendChild(span);
    nameContainer.appendChild(removeBtn);
    catDiv.appendChild(nameContainer);

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL(image);
    img.style.width = '100px';
    catDiv.appendChild(img);

    document.body.appendChild(catDiv);
  }
});

chrome.storage.local.get("selectedCat", (data) => {
  if (!data.selectedCat) return;

  const existing = document.getElementById("floating-cat");
  if (existing) return;

  const { name, image } = data.selectedCat;

  const cat = document.createElement("div");
  cat.id = "floating-cat";
  cat.style.position = "fixed";
  cat.style.bottom = "10px";
  cat.style.right = "10px";
  cat.style.zIndex = "9999";
  cat.style.cursor = "pointer";

  const img = document.createElement("img");
  img.src = image;
  img.alt = name;
  img.style.width = "100px";
  img.style.height = "auto";

  cat.appendChild(img);
  document.body.appendChild(cat);
});

