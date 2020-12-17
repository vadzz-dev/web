import { App } from "../src/App.js";
import { Api } from "../src/Api.js";

const expect = chai.expect

describe('App', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#loadFavorites', () => {
    it('Should create 3 blocks', async () => {
      sandbox.stub(Api.prototype, 'getFavorites').returns([1, 2, 3])
      sandbox.stub(Api.prototype, 'getWeatherForCityID').returns({ id: 1 })
      const createBlock = sandbox.stub(App.prototype, 'createFavoriteBlock').callsArg(0)
  
      const app = new App()
      await app.loadFavorites()
  
      expect(createBlock.callCount).to.equal(3)
    })
  })

  describe('#addFavorite', () => {
    it('Should call api.addFavorite once', async () => {
      const addFavorite = sandbox.stub(Api.prototype, 'addFavorite').returns([1, 2, 3])

      sandbox.stub(Api.prototype, 'getWeatherForCityName').returns({ id: 1 })
      sandbox.stub(App.prototype, 'createFavoriteBlock').callsArg(0)
  
      const app = new App()
      sandbox.stub(app, 'userId').value('test_user')

      await app.addFavorite('Moscow')
  
      expect(addFavorite.callCount).to.equal(1)
      expect(addFavorite.calledWith('test_user', 1)).to.equal(true)
    })

    it('Should fail (empty name)', async () => {
      const addFavorite = sandbox.stub(Api.prototype, 'addFavorite')

      sandbox.stub(Api.prototype, 'getWeatherForCityName').returns({ id: 1 })
      sandbox.stub(App.prototype, 'createFavoriteBlock').callsArg(0)
      const alertStub = sandbox.stub(window, 'alert')
  
      const app = new App()
      sandbox.stub(app, 'userId').value('test_user')

      await app.addFavorite('')
  
      expect(addFavorite.called).to.equal(false)
      expect(alertStub.callCount).to.equal(1)
      expect(alertStub.calledWith('Введите название города')).to.equal(true)
    })

    it('Should fail (city not found)', async () => {
      const addFavorite = sandbox.stub(Api.prototype, 'addFavorite')

      sandbox.stub(Api.prototype, 'getWeatherForCityName').returns({})
      sandbox.stub(App.prototype, 'createFavoriteBlock').callsArg(0)
      const alertStub = sandbox.stub(window, 'alert')
  
      const app = new App()
      sandbox.stub(app, 'userId').value('test_user')

      await app.addFavorite('Moscow')
  
      expect(addFavorite.called).to.equal(false)
      expect(alertStub.callCount).to.equal(1)
      expect(alertStub.calledWith('Город не найден')).to.equal(true)
    })

    it('Should fail (city already added)', async () => {
      const addFavorite = sandbox.stub(Api.prototype, 'addFavorite')

      sandbox.stub(Api.prototype, 'getWeatherForCityName').returns({ id: 1 })
      sandbox.stub(App.prototype, 'createFavoriteBlock').callsArg(0)
      const alertStub = sandbox.stub(window, 'alert')
  
      const app = new App()
      sandbox.stub(app, 'userId').value('test_user')
      sandbox.stub(app, 'favorites').value([ 1 ])
      
      await app.addFavorite('Moscow')
  
      expect(addFavorite.called).to.equal(false)
      expect(alertStub.callCount).to.equal(1)
      expect(alertStub.calledWith('Город уже добавлен')).to.equal(true)
    })
  })

  describe('#removeFavorite', () => {
    it('Should call api.removeFavorite once', async () => {
      const removeFavorite = sandbox.stub(Api.prototype, 'removeFavorite')
      sandbox.stub(App.prototype, 'removeFavoriteBlock')
  
      const app = new App()
      sandbox.stub(app, 'userId').value('test_user')

      await app.removeFavorite(1)
  
      expect(removeFavorite.callCount).to.equal(1)
      expect(removeFavorite.calledWith('test_user', 1)).to.equal(true)
    })
  })
})
