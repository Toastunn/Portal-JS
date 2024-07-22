PlayerEvents.loggedIn(event => {
  const { player, player : {persistentData} } = event
    if (!persistentData.firstjoin || persistentData.firstjoin == false) {
      player.persistentData.put("portalMute", {startup: true, validate: true, linking: true, linked: true, all: true})
      player.persistentData.putBoolean("recentTeleportJS", false)
      persistentData.firstjoin = true
    }
})