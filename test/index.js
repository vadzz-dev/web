(async () => {
  mocha.setup('bdd')

  await import('./App.js')

  mocha.run()
})()
