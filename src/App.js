import { Api } from "./Api.js";

export class App {
  constructor() {
    this.api = new Api()
    this.userId = null
    this.currentCity = null
    this.favorites = []
  }
  
  setWeatherData(el, weather) {
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

  setFavoriteData(el, weather) {
    el.setAttribute('data-city-id', weather.id)
    el.querySelector('.weather-remove')
      .addEventListener('click', e => this.removeFavorite(weather.id))

    this.setWeatherData(el, weather)
  }

  async createFavoriteBlock(weatherCallback) {
    const favoritesEl = document.getElementById('favorites')
    const template = document.getElementById('favoriteCity')
  
    favoritesEl.appendChild(document.importNode(template.content, true))
    const city = favoritesEl.lastElementChild
  
    const weather = await weatherCallback()
    if (weather !== null) {
      this.setFavoriteData(city, weather)
    } else {
      favoritesEl.removeChild(city)
    }
  }

  removeFavoriteBlock(id) {
    const favoritesEl = document.getElementById('favorites')

    const city = favoritesEl.querySelector(`.weather[data-city-id="${id}"]`)
    if (city !== null) {
      favoritesEl.removeChild(city)
    }
  }

  async addFavoriteCallback(name) {
    if (name.length === 0) {
      alert('Введите название города')
      return null
    }

    const weather = await this.api.getWeatherForCityName(name)
    if (weather.id === undefined) {
      alert('Город не найден')
      return null
    }

    if (this.favorites.includes(weather.id)) {
      alert('Город уже добавлен')
      return null
    }
    
    try {
      this.api.addFavorite(this.userId, weather.id)
    } catch (e) {
      console.error(e)
      alert(e.message)

      return null
    }

    return weather
  }

  addFavorite(name) {
    this.createFavoriteBlock(() => this.addFavoriteCallback(name))
  }

  async removeFavorite(id) {
    this.removeFavoriteBlock(id)

    this.favorites = this.favorites.filter(el => el !== id)

    try {
      await this.api.removeFavorite(this.userId, id)
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((location) => resolve(location.coords), reject)
    })
  }

  async getWeatherHere() {
    if (this.currentCity !== null) {
      return this.api.getWeatherForCityID(currentCity)
    } else {
      try {
        const coords = await this.getCurrentLocation()
        return this.api.getWeatherForCoords(coords.latitude, coords.longitude)
      } catch(e) {
        return this.api.getWeatherForCityName('Moscow')
      }
    }
  }

  async updateWeatherHere() {
    const weatherHere = document.getElementById('weatherHere')
    weatherHere.classList.add('loading')

    const weather = await this.getWeatherHere()
    this.currentCity = weather.id

    this.setWeatherData(weatherHere, weather)

    weatherHere.classList.remove('loading')
  }

  async loadUser() {
    this.userId = localStorage.getItem('user_id')
    if (this.userId === null) {
      this.userId = await this.api.register()
      localStorage.setItem('user_id', this.userId)
    }
  }

  async loadFavorites() {
    this.favorites = await this.api.getFavorites(this.userId)

    this.favorites.forEach(city => {
      this.createFavoriteBlock(() => this.api.getWeatherForCityID(city))
    })
  }

  bindButtons() {
    for (const el of document.getElementsByClassName('update-location')) {
      el.addEventListener('click', () => this.updateWeatherHere())
    }

    document.querySelector('.add-city')
      .addEventListener('submit', (e) => {
        e.preventDefault()
        this.addFavorite(e.target.elements['city'].value)
        e.target.elements['city'].value = ''
      })
  }

  async start() {
    await this.loadUser()
    await this.loadFavorites()
    await this.updateWeatherHere()

    this.bindButtons()
  }
}