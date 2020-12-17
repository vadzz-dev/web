export class Api {
  static URL = 'https://shrouded-beach-77512.herokuapp.com'

  async getWeatherForCityName(name) {
    const res = await fetch(`${Api.URL}/weather/city?q=${name}`)
    return res.json()
  }

  async getWeatherForCityID(id) {
    const res = await fetch(`${Api.URL}/weather/id?id=${id}`)
    return res.json()
  }

  async getWeatherForCoords(lat, lon) {
    const res = await fetch(`${Api.URL}/weather/coords?lat=${lat}&lon=${lon}`)
    return res.json()
  }

  async register() {
    const res = await fetch(`${Api.URL}/register`)
    return (await res.json()).id
  }

  async getFavorites(user) {
    const res = await fetch(`${Api.URL}/favorites?user=${user}`)
    return res.json()
  }

  addFavorite(user, city) {
    return fetch(`${Api.URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, city })
    })
  }

  removeFavorite(user, city) {
    return fetch(`${Api.URL}/favorites`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, city })
    })
  }
}
