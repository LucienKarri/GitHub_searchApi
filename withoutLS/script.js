function createMyElement( myTag, myClass) {
    const element = document.createElement(myTag);
    if (myClass) {
        element.className = myClass;
    }
    return element;
}

const debounce = (fn, debounceTime) => {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout( () => {
            fn.apply(this, args);
        }, debounceTime )
    }
}

function createStorage() {
    const storageNode = createMyElement('div', 'storage');
    const list = createMyElement('ul', 'storage__list');

    storageNode.appendChild(list);
    storageNode.addEventListener('click', (e) => {
        if (e.target.classList.contains('card__dropdown')) {
            removeCard(e.target.closest('.storage__item').dataset.id);
        }
    })
    return storageNode;
}

function fillStorage(node) {
    const item = createMyElement('li', 'storage__item');
    item.setAttribute('data-id', node.dataset.id);
    const card = createCard(node);
    item.appendChild(card);
    return item;
}

function createCard(node) {
    const card = createMyElement('div', 'card');

    const cardInfo = createMyElement('div', 'card__info');

    const infoName = createMyElement('span');
    infoName.textContent = `Name: ${node.dataset.name}`;
    cardInfo.appendChild(infoName);

    const infoOwner = createMyElement('span');
    infoOwner.textContent = `Owner: ${node.dataset.owner}`;
    cardInfo.appendChild(infoOwner);

    const infoStars = createMyElement('span');
    infoStars.textContent = `Stars: ${node.dataset.stars}`;
    cardInfo.appendChild(infoStars);

    card.appendChild(cardInfo);

    const cardButton = createMyElement('button', 'card__dropdown');
    card.appendChild(cardButton);

    return card;
}

function removeCard(id) {
    document.querySelector(`.storage__item[data-id = '${id}']`).remove();
    if (document.querySelector(`.search-form__item[data-id = '${id}']`)) {
        document.querySelector(`.search-form__item[data-id = '${id}']`).lastChild.remove();
    }
    if (!document.querySelector('.storage__item')) {
        document.querySelector('.storage').remove();
    }
}

function clearResult() {
    document.querySelector('.search-form__list').removeEventListener('click', pushNewCard);
    document.querySelector('.search-form__list').remove();
    document.querySelector('.search-form__input').value = '';
}

function pushNewCard(event) {
    const element = event.target.closest('.search-form__item');
    const card = document.querySelector(`.storage__item[data-id = '${element.dataset.id}']`);
    if (!card) {
        if (!document.querySelector('.storage')) {
            const storage = createStorage();
            storage.firstChild.prepend(fillStorage(element))
            document.querySelector('.wrapper').appendChild(storage);
        } else {
            document.querySelector('.storage__list').prepend(fillStorage(element));
        }
        clearResult();
    }
    if (event.target.classList.contains('search-form__dropdown')) {
        removeCard(element.dataset.id);
        element.lastChild.remove();
        clearResult();
    }
}

function createSearchItem(data) {
    const resultItem = createMyElement('li', 'search-form__item');
    resultItem.setAttribute('data-name', data.name);
    resultItem.setAttribute('data-owner', data.owner.login);
    resultItem.setAttribute('data-stars', data.stargazers_count);
    resultItem.setAttribute('data-id', data.id);

    const resultText = createMyElement('span');
    resultText.textContent = data.name;
    resultItem.appendChild(resultText);

    if (document.querySelector(`.storage__item[data-id = '${data.id}']`)) {
        const btn = createMyElement('button', 'search-form__dropdown');
        btn.textContent = 'delete';
        resultItem.appendChild(btn);
    }

    return resultItem;
}

async function searchRepos() {
    if (this.value) {
        const res = await fetch(`https://api.github.com/search/repositories?q=${this.value}&per_page=5`);
        if (res.status === 200) {
            const data = await res.json();
            if (document.querySelector('.search-form__list')) {
                document.querySelector('.search-form__list').remove();
            };
            const resultList = createMyElement('ul', 'search-form__list');
            data.items.forEach( data => {
                const resultItem = createSearchItem(data);
                resultList.appendChild(resultItem);
            } );
            document.querySelector('.search-form').appendChild(resultList);
            document.querySelector('.search-form__list').addEventListener('click', pushNewCard);
        } else {
            alert(`Request execution error.\nRequest Status: ${res.status}\nPlease try again later.`);
        };
    } else if (document.querySelector('.search-form__list')) {
        document.querySelector('.search-form__list').remove();
    };
}

const searchLine = document.querySelector('.search-form__input');

searchLine.addEventListener('keyup', debounce(searchRepos, 300));
