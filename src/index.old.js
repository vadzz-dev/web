let currentCity

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
      await apiRemoveCity(userId, id)
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

  setWeather(el, weather)

  favoritesEl.appendChild(city)
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