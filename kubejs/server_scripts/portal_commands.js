ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(
    Commands.literal('mute')
    .executes(c => mute(c.source.player, "help"))
    .then(Commands.argument('type', Arguments.STRING.create(event))
      .executes(c => mute(c.source.player, Arguments.STRING.getResult(c, 'type')))
    )
  )
  /**
   * 
   * @param {Internal.Player} player 
   * @param {string} type 
   */
  const mute = (player, type) => {
    switch (type) {
      case "startup":
        player.persistentData.portalMute.put("startup", false)
        break;
      case "validate":
        player.persistentData.portalMute.put("validate", false)
        break;
      case "linking":
        player.persistentData.portalMute.put("linking", false)
        break;
      case "linked":
        player.persistentData.portalMute.put("linked", false)
        break;
      case "all":
        player.persistentData.portalMute.put("all", false)
        break;
      case "help":
      default:
        player.tell(
        Text.gold("-----------------------------------------------------\n").append(
        Text.gold("Possible options of §c/mute§6 command: \n").append(
        Text.gold("§c/mute startup§6: Disables the initialization messages of [PORTAL].\n").append(
        Text.gold("§c/mute validate§6: Disables the validation messages of [PORTAL].\n").append(
        Text.gold("§c/mute linking§6: Disables the fouth dimension linking messages of [PORTAL].\n").append(
        Text.gold("§c/mute linked§6: Disables the final confirmation messages of [PORTAL].\n").append(
        Text.gold("§c/mute all§6: Disables all messages of [PORTAL]."))))))))
    }
    return 1
  }
  event.register(
    Commands.literal('unmute')
    .executes(c => unmute(c.source.player, "help"))
    .then(Commands.argument('type', Arguments.STRING.create(event))
      .executes(c => unmute(c.source.player, Arguments.STRING.getResult(c, 'type')))
    )
  )
  /**
   * 
   * @param {Internal.ServerPlayer} player 
   * @param {string} type 
   */
  const unmute = (player, type) => {
    switch (type) {
      case "startup":
        player.persistentData.portalMute.put("startup", true)
        break;
      case "validate":
        player.persistentData.portalMute.put("validate", true)
        break;
      case "linking":
        player.persistentData.portalMute.put("linking", true)
        break;
      case "linked":
        player.persistentData.portalMute.put("linked", true)
        break;
      case "all":
        player.persistentData.portalMute.put("all", true)
        break;
      case "help":
      default:
        player.tell(
        Text.gold("-----------------------------------------------------\n").append(
        Text.gold("Possible options of §c/unmute§6 command: \n").append(
        Text.gold("§c/unmute startup§6: Enables the initialization messages of [PORTAL].\n").append(
        Text.gold("§c/unmute validate§6: Enables the validation messages of [PORTAL].\n").append(
        Text.gold("§c/unmute linking§6: Enables the fouth dimension linking messages of [PORTAL].\n").append(
        Text.gold("§c/unmute linked§6: Enables the final confirmation messages of [PORTAL].\n").append(
        Text.gold("§c/unmute all§6: Enables all messages of [PORTAL]."))))))))
    }
    return 1
  }
})