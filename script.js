class Repository {
    constructor(data) {
        this.name = data.name;
        this.owner = data.owner.login;
        this.stars = data.stargazers_count;
        this.id = data.id;
    }
}

function createMyElement( myTag, myClass) {
    const element = document.createElement(myTag);
    if (myClass) {
        element.classList.add(myClass);
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

function createLayout() {
    const wrapper = createMyElement('div', 'wrapper');

    const title = createMyElement('h1');
    title.textContent = 'Search GitHub repositories';
    wrapper.appendChild(title);

    return wrapper;
}

function createForm() {
    const searchForm = createMyElement('div', 'search-form');

    const searchInput = createMyElement('input', 'search-form__input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Type to search...';
    searchInput.addEventListener('keyup', debounce(searchRepos, 300));

    searchForm.appendChild(searchInput);
    
    return searchForm;
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
    item.setAttribute('data-id', `${obj.id}`)
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

function pushNewCard(data) {
    const cards = getCards();
    if (!cards[data.id]) {
        cards[data.id] = new Repository(data);
        if (Object.keys(cards).length === 1) {
            const storage = createStorage();
            storage.firstChild.prepend(fillStorage(cards[data.id]))
            document.querySelector('.wrapper').appendChild(storage);
        } else {
            document.querySelector('.storage__list').prepend(fillStorage(cards[data.id]));
        }
        localStorage.setItem('cards', JSON.stringify(cards));
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
        const data = await res.json();
        const resultList = createMyElement('ul', 'search-form__list');
        data.items.forEach( data => {
            const resultItem = createMyElement('li', 'search-form__item');
            resultItem.textContent = `${data.name}`;
            resultItem.addEventListener('click', () => pushNewCard(data));
            resultList.appendChild(resultItem);
        } )
        document.querySelector('.search-form').appendChild(resultList);
    }
}

const wrapper = createLayout();
const form = createForm();

wrapper.appendChild(form);

initLocalData(wrapper);

document.body.prepend(wrapper);
