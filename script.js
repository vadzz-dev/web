const API_URL = 'https://shrouded-beach-77512.herokuapp.com'

let currentCity

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((location) => resolve(location.coords), reject)
  })
}

async function getWeatherForCityName(name) {
  const res = await fetch(`${API_URL}/weather/city?q=${name}`)
  return res.json()
}

async function getWeatherForCityID(id) {
  const res = await fetch(`${API_URL}/weather/id?id=${id}`)
  return res.json()
}

async function getWeatherForCoords(lat, lon) {
  const res = await fetch(`${API_URL}/weather/coords?lat=${lat}&lon=${lon}`)
  return res.json()
}

function setWeather(el, weather) {
  el.querySelector('.weather-city').textContent = weather.name
  el.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`
  el.querySelector('.weather-temperature .value').textContent = Math.round(weather.main.temp)
  el.querySelector('.weather-list .wind-speed').textContent = weather.wind.speed
  el.querySelector('.weather-list .wind-direction').textContent = weather.wind.deg
  el.querySelector('.weather-list .cloudness').textContent = weather.clouds.all
  el.querySelector('.weather-list .pressure').textContent = weather.main.pressure
  el.querySelector('.weather-list .humidity').textContent = weather.main.humidity
  el.querySelector('.weather-list .coords-lat').textContent = weather.coord.lat
  el.querySelector('.weather-list .coords-lon').textContent = weather.coord.lon
}

function removeCity(id) {
  const favoritesEl = document.getElementById('favorites')

  const city = favoritesEl.querySelector(`.weather[data-city-id="${id}"]`)
  if (city !== null) {
    favoritesEl.removeChild(city)
  }
  
  favorites = favorites.filter(el => el !== id)

  try {
    const userId = localStorage.getItem('user_id')
    if (userId) {
      fetch(`${API_URL}/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: userId,
          city: id
        })
      })
    }
  } catch (e) {
    alert(e)
  }
}

async function addCity(name) {
  if (name.length === 0) {
    return
  }

  const favoritesEl = document.getElementById('favorites')
  const template = document.getElementById('favoriteCity')

  favoritesEl.appendChild(document.importNode(template.content, true))
  const city = favoritesEl.lastElementChild

  try {
    const weather = await getWeatherForCityName(name)
    if (weather.id === undefined) {
      alert('Город не найден')
      favoritesEl.removeChild(city)
      return
    }

    if (favorites.includes(weather.id)) {
      alert('Город уже добавлен')
      favoritesEl.removeChild(city)
      return
    }

    city.setAttribute('data-city-id', weather.id)
    city.querySelector('.weather-remove')
      .addEventListener('click', e => removeCity(weather.id))

    setWeather(city, weather)

    favorites.push(weather.id)

    let userId = localStorage.getItem('user_id')
    if (!userId) {
      const res = await fetch(`${API_URL}/register`)
      userId = (await res.json()).id
      localStorage.setItem('user_id', userId)
    }

    await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: userId,
        city: weather.id
      })
    })
  } catch (e) {
    favoritesEl.removeChild(city)
    
    console.error(e)
    alert(`Не удалось добавить город "${name}"`)
  }
}

async function loadCity(id) {
  const weather = await getWeatherForCityID(id)
  const favoritesEl = document.getElementById('favorites')
  const template = document.getElementById('favoriteCity')

  const city = document.importNode(template.content, true)

  const el = city.children[0]

  el.setAttribute('data-city-id', weather.id)
  el.querySelector('.weather-remove')
    .addEventListener('click', e => removeCity(weather.id))

  setWeather(el, weather)

  favoritesEl.appendChild(city)
}

async function updateWeatherHere() {
  const weatherHere = document.getElementById('weatherHere')
  weatherHere.classList.add('loading')

  let weather
  if (currentCity !== undefined) {
    weather = await getWeatherForCityID(currentCity)
  } else {
    try {
      const coords = await getCurrentLocation()
      weather = await getWeatherForCoords(coords.latitude, coords.longitude)
    } catch(e) {
      weather = await getWeatherForCityName('Moscow')
    }
  }

  currentCity = weather.id
  setWeather(weatherHere, weather)

  weatherHere.classList.remove('loading')
}

window.addEventListener('load', async () => {
  for (const el of document.getElementsByClassName('update-location')) {
    el.addEventListener('click', updateWeatherHere)
  }

  document.querySelector('.add-city')
    .addEventListener('submit', (e) => {
      e.preventDefault()
      console.log(e.target.elements['city'])
      addCity(e.target.elements['city'].value)
    })
  
  updateWeatherHere()

  try {
    const userId = localStorage.getItem('user_id')
    if (userId) {
      const res = await fetch(`${API_URL}/favorites?user=${userId}`)
      favorites = await res.json()
    }
  } catch (e) {
    console.error(e)
  }

  if (!Array.isArray(favorites)) {
    favorites = []
  }

  favorites.forEach(id => loadCity(id))
})