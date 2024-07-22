ServerEvents.highPriorityData(event => {
  event.addJson("kubejs:damage_type/nullexplosion", {
    "effects": "hurt",
    "exhaustion": 0.5,
    "message_id": "nullExplosion",
    "scaling": "when_caused_by_living_non_player"
  })
})
EntityEvents.hurt(event => {
  if (event.source.getType().toString() == 'nullExplosion') {
    event.cancel()
  }
})