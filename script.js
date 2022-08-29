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

function fillStorage(obj) {
    const item = createMyElement('li', 'storage__item');
    item.setAttribute('data-id', obj.id)
    const card = createCard(obj);
    item.appendChild(card);
    return item;
}

function createCard({name, owner, stars}) {
    const card = createMyElement('div', 'card');

    const cardInfo = createMyElement('div', 'card__info');

    const infoName = createMyElement('span');
    infoName.textContent = `Name: ${name}`;
    cardInfo.appendChild(infoName);

    const infoOwner = createMyElement('span');
    infoOwner.textContent = `Owner: ${owner}`;
    cardInfo.appendChild(infoOwner);

    const infoStars = createMyElement('span');
    infoStars.textContent = `Stars: ${stars}`;
    cardInfo.appendChild(infoStars);

    card.appendChild(cardInfo);

    const cardButton = createMyElement('button', 'card__dropdown');
    card.appendChild(cardButton);

    return card;
}

function removeCard(id) {
    const cards = JSON.parse(localStorage.getItem('cards'));
    delete cards[id];
    localStorage.setItem('cards', JSON.stringify(cards));
    document.querySelector(`[data-id = '${id}']`).remove();
    if (Object.keys(cards).length === 0) {
        document.querySelector('.storage').remove();
    }
}

function getCards() {
    if (!localStorage.getItem('cards')) {
        localStorage.setItem('cards', JSON.stringify({}));
    }
    return JSON.parse(localStorage.getItem('cards'));
}

function pushNewCard(event) {
    const cards = getCards();
    if (!cards[event.target.getAttribute('data-id')]) {
        cards[event.target.getAttribute('data-id')] = {
            name: event.target.getAttribute('data-name'),
            owner: event.target.getAttribute('data-owner'),
            stars: event.target.getAttribute('data-stars'),
            id: event.target.getAttribute('data-id'),
        };
        if (Object.keys(cards).length === 1) {
            const storage = createStorage();
            storage.firstChild.prepend(fillStorage(cards[event.target.getAttribute('data-id')]))
            document.querySelector('.wrapper').appendChild(storage);
        } else {
            document.querySelector('.storage__list').prepend(fillStorage(cards[event.target.getAttribute('data-id')]));
        }
        localStorage.setItem('cards', JSON.stringify(cards));
        document.querySelector('.search-form__list').removeEventListener('click', pushNewCard);
        document.querySelector('.search-form__list').remove();
        document.querySelector('.search-form__input').value = '';
    }
}

function initLocalData(layout) {
    if (Object.keys(getCards()).length !== 0) {
        const storage = createStorage();
        const cards = getCards();
        for (let key in cards) {
            storage.firstChild.prepend(fillStorage(cards[key]));
        }
        layout.appendChild(storage);
    }
}

async function searchRepos() {
    if (document.querySelector('.search-form__list')) {
        document.querySelector('.search-form__list').remove();
    }
    if(this.value){
        const res = await fetch(`https://api.github.com/search/repositories?q=${this.value}&per_page=5`);
        if (res.status === 200) {
            const data = await res.json();
            const resultList = createMyElement('ul', 'search-form__list');
            data.items.forEach( data => {
                const resultItem = createMyElement('li', 'search-form__item');
                resultItem.textContent = data.name;
                resultItem.setAttribute('data-name', data.name);
                resultItem.setAttribute('data-owner', data.owner.login);
                resultItem.setAttribute('data-stars', data.stargazers_count);
                resultItem.setAttribute('data-id', data.id);
                resultList.appendChild(resultItem);
            } )
            document.querySelector('.search-form').appendChild(resultList);
            document.querySelector('.search-form__list').addEventListener('click', pushNewCard);
        } else {
            alert(  `Request execution error.\nRequest Status: ${res.status}\nPlease try again later.`);
        }
    }
}

const layout = document.querySelector('.wrapper');
const searchLine = document.querySelector('.search-form__input');

searchLine.addEventListener('keyup', debounce(searchRepos, 300));
initLocalData(layout);
