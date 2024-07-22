PlayerEvents.tick(event => {
  if(Utils.server.tickCount % 20 != 0) return
  const {player} = event
  let items = player.inventory.getAllItems()
  items.forEach(item => {
    if(item != 'kubejs:wormhole') {return}
    if(!item.nbt) {return}
    if(item.nbt.contains("temp")) {
      item.setNbt({w: randomInt()})
    }
  })
})

function randomInt() {
  let mathSpam = Math.ceil(Math.random() * 1000)
  let nTicks = Utils.server.tickCount
  let random = (`${Math.ceil(mathSpam > nTicks ? mathSpam % nTicks: nTicks % mathSpam)}` + `${Utils.random.nextInt(0, Math.ceil( Math.random()*1000))}`) * Math.floor(Math.random() * 1000)
  return random.toFixed(0)
}
