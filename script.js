const API_KEY = '305510256a262c0c312bf44cf226eecf'

let currentCity

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((location) => resolve(location.coords), reject);
  })
}

async function getWeatherForCityName(name) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&q=${name}&appid=${API_KEY}`)
  return res.json()
}

async function getWeatherForCityID(id) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&id=${id}&appid=${API_KEY}`)
  return res.json()
}

async function getWeatherForCoords(lat, lon) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`)
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

async function addCity(name) {
  if (name.length === 0) {
    return
  }

  try {
    const weather = await getWeatherForCityName(name)
    const favorites = document.getElementById('favorites')
    const template = document.getElementById('favoriteCity')

    const city = document.importNode(template.content, true)
    console.log(city)

    setWeather(city, weather)

    favorites.appendChild(city)
  } catch (e) {
    console.error(e)
    alert(`Не удалось добваить город "${name}"`)
  }
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
})