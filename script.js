const formSearch = document.querySelector(".form-search"),
    inputCitiesFrom = document.querySelector(".input__cities-from"),
    dropdownCitiesFrom = document.querySelector(".dropdown__cities-from"),
    // inputCitiesTo = document.querySelector(".input__cities-to"),
    // dropdownCitiesTo = document.querySelector(".dropdown__cities-to"),
    inputDateDepart = document.querySelector(".input__date-depart"),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets');

// Данные
const citiesApi = "http://api.travelpayouts.com/data/ru/cities.json",
    // const citiesApi = "dataBase/cities.json",
    proxy = "https://cors-anywhere.herokuapp.com/",
    API_KEY = "291dbf9184cd4d343ee21931e509f01e",
    calendar = "http://engine.hotellook.com/api/v2/lookup.json",
    MAX_COUNT = 10;

let city = [];

// Функции

const getData = (url, callback) => {
    document.querySelector(".load").style.display = "block";
    const request = new XMLHttpRequest();

    request.open("GET", url);

    request.addEventListener("readystatechange", () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
            callback(request.response);
        } else {
            console.error(request.status);
        }
    });

    request.send();
};

//ПОКАЗАТЬ СПИСОК ГОРОДОВ СОВПАДАЮЩУЮ С ЗНАЧЕНИЕМ ПОЛЯ ВВОДА
const showCity = (input, list) => {
    list.textContent = "";

    if (input.value !== "") {

        const filterCity = city.filter(item => {
            for (let i = 0; i < item.name.length; i++) {
                if (item.name[i].hasOwnProperty("RU")) {
                    return item.name[i].RU[0].name.toLowerCase().startsWith(input.value.toLowerCase());
                }
            }
        });

        filterCity.forEach(item => {
            const li = document.createElement("li");
            li.classList.add("dropdown__city");

            for (let i = 0; i < item.name.length; i++) {
                if (item.name[i].hasOwnProperty("RU")) {
                    li.textContent = item.name[i].RU[0].name;
                    break;
                }
            }
            list.append(li);
        });
    }
};

const selectCity = (event, input, list) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === "li") {
        input.value = target.textContent;
        list.textContent = "";
    }
};



const createCard = (data) => {

    const ticket = document.createElement('a');
    let hotel_name = data.name.en.split(' ');
    ticket.href = `https://search.hotellook.com/hotels?
    destination=${data.name.en}
    &=1
    &adults=1
    &hotelId=${data.id}
    &cityId=${data.cityId}`
    ticket.target = "_blank"

    ticket.classList.add('ticket');

    let name = data.name.hasOwnProperty('ru') ? data.name.ru : data.name.en;
    let address = data.address.hasOwnProperty('ru') ? data.address.ru : data.address.en;

    //СОЗДАНИЕ БЛОКА С ФОТО
    let photos = document.createElement("div");
    photos.classList.add("photos");

    //СОЗДАНИЕ КАРТИНОК И ПОМЕЩЕНИЕ ИХ В БЛОК С ФОТО
    data.photos.forEach(item => {
        if (item.height == 240 && item.width == 320) {
            let photo = document.createElement("img");
            photo.classList.add("photo");
            photo.src = item.url;
            photos.insertAdjacentElement('beforeend', photo);
        }
    });

    // console.log(photos);

    const deep = document.createElement('div');

    if (data) {
        deep.insertAdjacentHTML('beforeend', `
            <h3>${name}</h3>
            <p>Адрес: ${address}</p>
            <p>Время заселения: ${data.checkIn}</p>
            <p>Время выселения: ${data.checkOut}</p>
            <p>Минимальная цена ночи: ${data.pricefrom}$</p>
            <p>Рейтинг: ${Math.trunc(data.rating / 10)}.${data.rating % 10}</p>
        `);
        deep.appendChild(photos);
    } else {
        deep = '<h3>К сожалению на текущую дату билетов не нашлось!</h3>';
    }

    ticket.insertAdjacentHTML('afterbegin', deep.innerHTML);
    // console.log(ticket);
    return ticket;
};

const renderHotelDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
};

const renderHotel = (data) => {
    otherCheapTickets.style.display = 'block';
    let n = 0;
    for (let i = 0; i < data.length && n < MAX_COUNT; i++) {

        //ОТЕЛИ БЕЗ ФОТО НЕ ВЫВОДЯТСЯ
        // if () {
        if (
            data[i].hasOwnProperty("photos") &&
            data[i].photos != 0 &&
            data[i].hasOwnProperty("pricefrom") &&
            data[i].pricefrom != 0 &&
            data[i].rating != 0
        ) {
            console.log("pricefrom = " + data[i].pricefrom + "$");
            n++;
            console.log(data[i]);

            const ticket = createCard(data[i]);
            otherCheapTickets.append(ticket);
        }
    }
};

// Обработчики событий

//ОТКУДА

inputCitiesFrom.addEventListener("input", () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesFrom.addEventListener("click", event => {
    selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

formSearch.addEventListener("submit", event => {
    event.preventDefault();
    otherCheapTickets.innerHTML = "";

    const cityFrom = city.find(item => {
        for (let i = 0; i < item.name.length; i++) {
            if (item.name[i].hasOwnProperty("RU")) {
                return item.name[i].RU[0].name === inputCitiesFrom.value;
            }
        }
    });

    if (cityFrom) {
        const city_hotel = cityFrom.id;
        const requestData =
            `https://engine.hotellook.com/api/v2/static/hotels.json?locationId=${city_hotel}&token=${API_KEY}`;
        getData(requestData, data => {

            let hotels_ = JSON.parse(data);
            // console.log(hotels_);

            console.log(hotels_.hotels);
            hotels_.hotels.forEach(item => {
                // console.log(item.link);

            })
            renderHotel(hotels_.hotels);
            document.querySelector(".load").style.display = "none";
        });
    } else {
        alert('Введите корректное название города!');
    }

});

// // Вызовы функций

const aaa = "https://engine.hotellook.com/api/v2/lookup.json?query=detol";
const CITY = "https://engine.hotellook.com/api/v2/static/locations.json?token=" + API_KEY;
const hotels = "http://engine.hotellook.com/api/v2/static/hotels.json?locationId=1675940&token=" + API_KEY;

getData(CITY, data => {
    city = JSON.parse(data);
    console.log(city);
    document.querySelector(".load").style.display = "none";
});