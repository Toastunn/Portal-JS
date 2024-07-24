const axisList = ["x", "y" ,"z"]
const orthogonals = {
  x: [Vec3i.ZERO.above(), Vec3i.ZERO.below(), Vec3i.ZERO.north(), Vec3i.ZERO.south()],
  y: [Vec3i.ZERO.north(), Vec3i.ZERO.south(), Vec3i.ZERO.east(), Vec3i.ZERO.west()],
  z: [Vec3i.ZERO.above(), Vec3i.ZERO.below(), Vec3i.ZERO.east(), Vec3i.ZERO.west()]
}
const directions = {
  down: Vec3i.ZERO.below(),
  up: Vec3i.ZERO.above(),
  north: Vec3i.ZERO.north(),
  south: Vec3i.ZERO.south(),
  west: Vec3i.ZERO.west(),
  east: Vec3i.ZERO.east()
}

let delay = 0


BlockEvents.placed("kubejs:portal_controller", event => {
  const {player, player: {persistentData: {portalMute}}} = event
  event.block.entity.persistentData.merge({energy: 0, hasEnergyToRun: false, isRunning: false, energyCost: 16000, isFormed: false, status: "efficient", innerBlock: null, axis: ""})
  if(!portalMute.startup || !portalMute.all) return
  paintText(player, "[PORTAL] §b/INFO/§r:", "Initializing System", true, 0)
  let t = 0 
  scheduleInTicks(20, () => {
  for(let n = 0 ; n < 3; n++) {
    scheduleInTicks(n*20, () => {
      t++
      switch (t) {
        case 1:
          paintText(player, "[PORTAL] §b/INFO/§r:", "Initializing System.", false, 0)
          break;
        case 2:
          paintText(player, "[PORTAL] §b/INFO/§r:", "Initializing System..", false, 0)
          break;
        case 3:
          paintText(player, "[PORTAL] §b/INFO/§r:", "Initializing System...", false, 0)
          break;
      }
    })
  }
  scheduleInTicks(100, () => {
  paintText(player, "[PORTAL] §b/INFO/§r:", "Greetings,", true, 0)
  scheduleInTicks(22, () => {  
  paintText(player, "[PORTAL] §b/INFO/§r:", `Greetings, §2${player.username}§r!`, false, 0)
  scheduleInTicks(20, () => {
  paintText(player, "[PORTAL] §b/INFO/§r:", `Greetings, §2${player.username}§r! I am an AI that will guide you through the activation of your very own portal!`, true, player.username.slice().length + 15)
  scheduleInTicks(160, () => {
  paintText(player, "[PORTAL] §b/INFO/§r:", `Click the Portal Controller to validate a constructed portal. The portal can take on any shape, but it must be closed!`, true, 0)
  scheduleInTicks(180, () => {
  paintText(player, "[PORTAL] §b/INFO/§r:", `If you would like to disable my initialization messages, type §c/mute startup§r in the chat!`, true, 0)
  scheduleInTicks(120, () => {
  player.paint({console: {remove: true}})
  })
})})})})})})})

BlockEvents.rightClicked("kubejs:portal_controller", event => {
  const { block, block: { level, entity }, player, player: { persistentData: { portalMute } } } = event
  const { validate, linking, linked, all } = portalMute
  if(event.hand == "off_hand") return
  if(!player.isCrouching()) {

    if(player.getItemInHand("main_hand").isEmpty()) {

      if(!validate || !all) return
      let {status, isFormed, energyCost} = block.entity.persistentData
      if(isFormed) {
        if(status == "inefficient") {
          delay += 340
          paintText(player, "[PORTAL]", "§6|WARNING|: Portal is not rectangular! Power consumption may be affected due to inefficient portal form.", true, 0)
          scheduleInTicks(180, () => {
          paintText(player, "[PORTAL]", `§b/INFO/§r: Background calculations estimate an increase of §6${energyCost - 16000} FE/s.`, true, 0)
          })
        }
        scheduleInTicks(delay, () => {
        paintText(player, "[PORTAL]", `§b/INFO/§r: Portal is stable!`, true, 0)
        if(linking) {
          scheduleInTicks(80, () => {
          paintText(player, "[PORTAL]", `§b/INFO/§r: Next, you must insert a wormhole into the interface to commence 4D linking.`, true, 0)
          })
          delay += 140
        }})
        delay += 80
      } else if(status == "too_big") {
        paintText(player, "[PORTAL]", "§4>ERROR<: Portal size exceeds maximum stable size of 100 blocks!", true, 0)
        delay += 100
      } else if(status == "too_many_controllers") {
        paintText(player, "[PORTAL]", "§4>ERROR<: Portal contains more than one interface!", true, 0)
        delay += 100
      } else {
        paintText(player, "[PORTAL]", "§b/INFO/§r: Portal is not formed.", true, 0)
        delay += 100
      }
      scheduleInTicks(delay, () => {
      clearConsole(player)
      })
    } else 

    if(player.getItemInHand("main_hand") == "kubejs:wormhole") {

      let data = entity.persistentData
      let wormhole = player.getItemInHand("main_hand")
      let handW = wormhole.nbt.get("w").asString
      let network = JsonIO.read("kubejs/server_scripts/portalNetwork.json")
      if(data.inventory) {
        let invItem = data.inventory
        let popItem = block.createEntity('item')
        let /**@type {string}}*/ invW = invItem.tag.get("w").asString
        popItem.item = invItem.id
        popItem.item.count = 1
        popItem.item.nbt = {w: invW}
        popItem.motionY = 0.5
        popItem.spawn()
        if(network.get(("-" + invW).toString()) && network.get(invW)) {
          network.remove(networkSign(block) ? invW : ("-" + invW).toString())
        } else {
          network.remove(network.get(invW) ? invW : ("-" + invW).toString())
        }
      }
      level.getBlock(block.pos).entity.persistentData.inventory = wormhole
      wormhole.count--
      let {x, y, z} = block
      network.put(network.get(handW) ? ("-" + handW).toString() : handW, {x: x, y: y, z: z, dimension: Text.of(block.dimension).string})
      JsonIO.write("kubejs/server_scripts/portalNetwork.json", network)

      if(!linking || !all) return
      let linkedBlock = findOtherSide(block)
      paintText(player, "[PORTAL] §b/INFO/§r:", "Searching fourth dimension for joint wormhole", true, 0)
      scheduleInTicks(60, () => {
      paintText(player, "[PORTAL] §b/INFO/§r:", "Searching fourth dimension for joint wormhole.", false, 0)
      scheduleInTicks(25, () => {
      paintText(player, "[PORTAL] §b/INFO/§r:", "Searching fourth dimension for joint wormhole..", false, 0)
      scheduleInTicks(25, () => {
      paintText(player, "[PORTAL] §b/INFO/§r:", "Searching fourth dimension for joint wormhole...", false, 0)
      scheduleInTicks(100, () => {
        if(linkedBlock) {
          paintText(player, "[PORTAL] §b/INFO/§r:", `Link formed with [PORTAL] interface at §a${linkedBlock.x}§r, §a${linkedBlock.y}§r, §a${linkedBlock.z}§r through W layer §6${data.inventory.tag.get("w").asString}§r.`, true, 0)
          if(!data.hasEnergyToRun && !linkedBlock.entity.persistentData.hasEnergyToRun) {
            scheduleInTicks(200, () => {
            paintText(player, "[PORTAL] §b/INFO/§r:", `Both linked interfaces are not supplied with sufficient energy to create a stable bridge.`, true, 0)
            })
            delay += 180
          }else if(!data.hasEnergyToRun) {
            scheduleInTicks(200, () => {
            paintText(player, "[PORTAL] §b/INFO/§r:", `Interface at §a${block.pos.get("x")}§r, §a${block.pos.get("y")}§r, §a${block.pos.get("z")}§r is not supplied with sufficient energy to create a stable bridge.`, true, 0)
            })
            delay += 200
          } else if(!linkedBlock.entity.persistentData.hasEnergyToRun) {
            scheduleInTicks(200, () => {
            paintText(player, "[PORTAL] §b/INFO/§r:", `Interface at §a${linkedBlock.x}§r, §a${linkedBlock.y}§r, §a${linkedBlock.z}§r is not supplied with sufficient energy to create a stable bridge.`, true, 0)
            })
            delay += 200
          } else {
            if(linkedBlock.entity.persistentData.isFormed) {
              scheduleInTicks(200, () => {
              paintText(player, "[PORTAL] §b/INFO/§r:", `Portals are ready to go! Simply click either interface with a Nether Star to ingite it.`, true, 0)
              })
              delay += 200
            } else {
              scheduleInTicks(200, () => {
              paintText(player, "[PORTAL] §b/INFO/§r:", `Portal at §a${linkedBlock.x}§r, §a${linkedBlock.y}§r, §a${linkedBlock.z}§r is not formed!`, true, 0)
              })
              delay += 200
            }

          }
          delay += 200
        } else {
          paintText(player, "[PORTAL] §6|WARNING|§r:", `Failed to find [PORTAL] interface through W layer §6${data.inventory.tag.get("w").asString}§r.`, true, 0)
          scheduleInTicks(120, () => {
          paintText(player, "[PORTAL] §b/INFO/§r:", `Your next step is to create another portal and insert an identical wormhole into it's interface.`, true, 0)
          })
          delay += 280
        }
        scheduleInTicks(delay, () => {
        clearConsole(player)
      })})})})
      })
    } else

    if(player.getItemInHand("main_hand") == "minecraft:nether_star" || player.getItemInHand("off_hand") == "minecraft:nether_star") {
      let { entity: { persistentData: { hasEnergyToRun, isFormed } } } = block
      let linkedBlock = findOtherSide(block)
      if(hasEnergyToRun && isFormed && linkedBlock) {
        let hasEnergyToRun2 = linkedBlock.entity.persistentData.hasEnergyToRun
        let isFormed2 = linkedBlock.entity.persistentData.isFormed
        if(hasEnergyToRun2 && isFormed2) {
          formPortal(block, player)
          formPortal(linkedBlock, player)
          player.getItemInHand("main_hand").count--

          if(!linked || !all) return
          paintText(player, "[PORTAL] §b/INFO/§r:", `Portals are active!`, true, 0)
          scheduleInTicks(80, () => {
          paintText(player, "[PORTAL] §b/INFO/§r:", `To change the destination of a portal within the linked portal, simply click a point of the linked portal with an Ender Pearl.`, true, 0)
          scheduleInTicks(200, () => {
          paintText(player, "[PORTAL] §b/INFO/§r:", `If you would like to get information about a portal, simply click the interface with a Spyglass.`, true, 0)
          scheduleInTicks(200, () => {
          clearConsole(player)
          })})})
        }
      }
    } else

    if(player.getItemInHand("main_hand") == "minecraft:spyglass" || player.getItemInHand("off_hand") == "minecraft:spyglass") {
      let { energyCost, destination } = entity.persistentData
      let linkedBlock = findOtherSide(block)
      player.tell(Text.aqua("-------------[PORTAL]-------------\n").append(
        Text.of(`Calculated FE/s: ${energyCost}\n`).append(
        Text.of(`W coordinate link: ${entity.persistentData.inventory ? entity.persistentData.inventory.tag.get("w").asString : "None"}`)
      )))
      if(linkedBlock) {
        let { innerBlock } = linkedBlock.entity.persistentData
        player.tell(
          Text.aqua(`Linked interface position: ${linkedBlock ? `${linkedBlock.x}, ${linkedBlock.y}, ${linkedBlock.z} in ${linkedBlock.dimension.path}`: "None"}\n`).append(
          Text.aqua(`Target destination: ${destination ? `${destination.x}, ${destination.y}, ${destination.z} in ${linkedBlock.dimension.path}` : `${innerBlock.x}, ${innerBlock.y}, ${innerBlock.z} in ${linkedBlock.dimension.path}`}`)
        ))
      }
    }
  } else {
    if(player.getItemInHand("main_hand").isEmpty()) {
      let data = entity.persistentData
      let network = JsonIO.read("kubejs/server_scripts/portalNetwork.json")
      if(data.inventory) {
        let invItem = data.inventory
        let popItem = block.createEntity('item')
        let /**@type {string}}*/ invW = invItem.tag.get("w").asString
        popItem.item = invItem.id
        popItem.item.count = 1
        popItem.item.nbt = {w: invW}
        popItem.motionY = 0.5
        popItem.spawn()
        if(network.get(("-" + invW).toString()) && network.get(invW)) {
          network.remove(networkSign(block) ? invW : ("-" + invW).toString())
        } else {
          network.remove(network.get(invW) ? invW : ("-" + invW).toString())
        }
        level.getBlock(block.pos).entity.persistentData.remove("inventory")
      }
      JsonIO.write("kubejs/server_scripts/portalNetwork.json", network)
    }
  }
})

BlockEvents.rightClicked("kubejs:portal_plane", event => {
  const { block, block: { level, entity: { persistentData: { controller } } }, player, player: { persistentData: { portalMute: { linked, all } } } } = event
  if(player.getItemInHand("main_hand") == "minecraft:ender_pearl") {
    let controllerBlock = level.getBlock(controller.x, controller.y, controller.z)
    let linkedBlock = findOtherSide(controllerBlock)
    if(linkedBlock) {
      linkedBlock.entity.persistentData.put("destination", {x: block.x, y: block.y, z: block.z})
      player.getItemInHand("main_hand").count--
      if(!linked || !all) return
      paintText(player, "[PORTAL] §b/INFO/§r:", `Portal destination will now tend to be at §a${block.x}, ${block.y}, ${block.z}§r.`, true, 0)
      scheduleInTicks(120, () => {
      clearConsole(player)
      })
    }
  }
})

BlockEvents.broken(event => {
  const { block, block: { level } } = event
  switch (block.id) {
    case "kubejs:portal_controller":
      let {entity: {persistentData: {isRunning, inventory, innerBlock, axis, isFormed}}} = block
      if(isRunning) {
        destroyPortal(block, block)
      }
      if(inventory) {
        let network = JsonIO.read("kubejs/server_scripts/portalNetwork.json")
        let invItem = inventory
        let popItem = block.createEntity('item')
        let /**@type {string}}*/ invW = invItem.tag.get("w").asString
        popItem.item = invItem.id
        popItem.item.count = 1
        popItem.item.nbt = {w: invW}
        popItem.motionY = 0.5
        popItem.spawn()
        if(network.get(("-" + invW).toString()) && network.get(invW)) {
          network.remove(networkSign(block, inventory) ? invW : ("-" + invW).toString())
        } else {
          network.remove(network.get(invW) ? invW : ("-" + invW).toString())
        }
        JsonIO.write("kubejs/server_scripts/portalNetwork.json", network)
      }
      if(isFormed) {
        let initBlock = level.getBlock(innerBlock.x, innerBlock.y, innerBlock.z)
        level.setBlock(block.pos, Block.id("kubejs:portal_controller").blockState, 3, 512)
        let frame = findArea(initBlock, axis, block, false)
        level.setBlock(block.pos, Block.id("minecraft:air").blockState, 3, 512)
        despark(frame, level)
      }
      break;
    case "kubejs:portal_frame":
      let facing;
      for(const property in block.properties) {
        let value = block.properties[property]
        if(value.toString() == "true") {
          facing = property
        }
      }
      let portalPlane = level.getBlock(block.pos.offset(directions[facing]))
      if(portalPlane.id == "kubejs:portal_plane") {
        let {x, y, z} = portalPlane.entity.persistentData.controller
        let controllerBlock1 = level.getBlock(x, y ,z)
        destroyPortal(controllerBlock1, block)
      }

    case "kubejs:portal_plane":
      let {entity: {persistentData: {controller}}} = block
      let controllerBlock = level.getBlock(controller.x, controller.y, controller.z)
      if(controllerBlock) {
        destroyPortal(controllerBlock)
      }
      break;
  }
})


/**
 * Schedules the execution of code to a later time
 * @param {number} ticks 
 * @param {Internal.ScheduledEvents$Callback} callback 
 */
function scheduleInTicks(ticks, callback) {
  Utils.server.scheduleInTicks(ticks, callback)
}

/**
 * 
 * @param {Internal.Player} player The player to display the text to
 * @param {string} sender A string showing who sent the message. Ex: [SERVER] or <username>
 * @param {string} message The message that follows the sender string
 * @param {boolean} progressiveDisplay If the message should be displayed all at once, or one letter after the other. 
 * @param {number} pdStart The zero-based character index of the message at which the progressive display should start

 */
function paintText(player, sender, message, progressiveDisplay, pdStart) {
  let n = pdStart
  for(let count = 0; count < message.length + 1; count++) {
    scheduleInTicks(count, () => {
      player.paint({
        console: {
          type: "text",
          text: Text.of(sender + " " + message.slice(0, progressiveDisplay ? n : message.length)).string,
          scale: 0.7,
          x: 2,
          y: -25,
          alignX: "left",
          alignY: "bottom",
          draw: "always"
        }
      })
      n++
    })
    if(!progressiveDisplay) {count = message.length + 1; n = message.length + 1}
  }
}

/**
 * 
 * @param {Internal.Player} player The player to remove the text from
 */
function clearConsole(player) {
  player.paint({console: {remove: true}})
  delay = 0
}
/**
 * Searches an array containing x y z type vectors (or blockpos) to see if a vector is within it
 * @param {Vec3i[]} array 
 * @param {Vec3i} searchVec 
 */
function contains(array, searchVec) {
  let bool = false
  array.forEach(vec => {
    if(vec.compareTo(searchVec) == 0) bool = true
  })
  return bool
}

/**
 * 
 * @param {Internal.BlockContainerJS} block 
 * @returns {Internal.BlockContainerJS | false}
 */
function findOtherSide(block) {
  let /**@type {string}}*/invW = block.entity.persistentData.inventory.tag.get("w").asString
  let network = JsonIO.read("kubejs/server_scripts/portalNetwork.json")
  if(network.get(("-" + invW).toString())) {
    let checkCoords = network.get(invW)
    let checkPos = BlockPos.ZERO.offset(checkCoords.x, checkCoords.y, checkCoords.z)
    let /**@type {{x: number, y: number, z: number, dimension: ResourceLocation}}*/linkedData = network.get(checkPos.compareTo(block.pos) == 0 ? ("-" + invW).toString() : invW)
    let linkedBlock = Utils.server.getLevel(linkedData.dimension).getBlock(linkedData.x ,linkedData.y, linkedData.z)
    if(linkedBlock.id == "kubejs:portal_controller" && linkedBlock.entity.persistentData.inventory.tag.get("w").asString == invW) {
      return linkedBlock
    }
  }
  return false
}

/**
 * @param {Internal.BlockContainerJS} block
 * @param {Internal.Tag} inventory 
 */
function networkSign(block, inventory) {
  let /**@type {string}}*/invW = inventory ? inventory.tag.get("w").asString : block.entity.persistentData.inventory.tag.get("w").asString
  let network = JsonIO.read("kubejs/server_scripts/portalNetwork.json")
  let checkCoords = network.get(invW)
  let checkPos = BlockPos.ZERO.offset(checkCoords.x, checkCoords.y, checkCoords.z)
  let bool = checkPos.compareTo(block.pos) == 0
  return bool
}

/**
 * @param {Internal.BlockContainerJS} block 
 * @param {Internal.Player} player 
 */
function formPortal(block, player) {
  const { level, pos, entity: { persistentData, persistentData: { axis } }} = block
  let {x, y, z} = persistentData.innerBlock
  let offBlock = level.getBlock(x, y, z)
  let area = findArea(offBlock, axis, block, true)
  area.forEach((blockPos, index) => {
    scheduleInTicks(index, () => {
      level.setBlock(blockPos, Block.id("kubejs:portal_plane").with("axis", axis).blockState, 3, 512)
      level.getBlock(blockPos).entity.persistentData.put("controller", {x: pos.x, y: pos.y, z: pos.z})
    })
  })
  level.getBlock(pos).entity.persistentData.isRunning = true
  player.runCommandSilent(`playsound minecraft:block.beacon.power_select ambient @s ~ ~ ~ 3 0.8`)
}

/**
 * @param {Internal.BlockContainerJS} initBlock 
 * @param {string} axis
 * @param {Internal.BlockContainerJS} controller 
 * @param {boolean} findArea true to return area, false to return frame
 */
function findArea(initBlock, axis, controller, findArea) {
  let /**@type {BlockPos[]} */ next = []
  let /**@type {BlockPos[]} */ current = []
  let /**@type {BlockPos[]} */ done = []
  let /**@type {BlockPos[]} */ frame = []
  let /**@type {BlockPos[]} */ badCorners = []
  let fail = false
  const { level } = initBlock
  current.push(initBlock.pos)
  while(current.length != 0) {
    current.forEach(pos => {
      if(fail == true) return null
      orthogonals[axis].forEach(offset => {
        if(fail == true) return null
        let offPos = pos.offset(offset)
        let offBlock = level.getBlock(offPos)
        if(offBlock.id == "minecraft:air" || offBlock.id == "kubejs:portal_plane") {
          if(!global.contains(done, offPos) && !global.contains(current, offPos) && !global.contains(next, offPos))
            next.push(offPos)
        } else if(offBlock.id == "kubejs:portal_frame" || offBlock.id == "kubejs:portal_controller") {
          if(!global.contains(frame, offPos)) {
            frame.push(offPos)
          } else {
            badCorners.push(offPos);
          }
          if(offBlock.id == "kubejs:portal_controller") {
            if(controller.pos.compareTo(offPos) != 0){
              level.getBlock(controller.pos).entity.persistentData.status = "too_many_controllers"
              level.getBlock(controller.pos).entity.persistentData.isFormed = false
              fail = true
              return null
            }
          }
        } else {
          level.getBlock(controller.pos).entity.persistentData.isFormed = false
          fail = true
          return null
        }
      })
    })
    if(fail == true) return null

    if(next.length > 15) {
      return null
    }
    if(done.length > 100) {
      level.getBlock(controller.pos).entity.persistentData.status = "too_big"
      level.getBlock(controller.pos).entity.persistentData.isFormed = false
      return null
    }
    current.forEach(pos => {
      done.push(pos);
    })
    current = []
    next.forEach(pos => {
      current.push(pos);
    })
    next = []
  }
  if(findArea) {
    return done
  } else {
    return frame
  }
}

/**
 * @param {Internal.BlockContainerJS} block
 * @param {Internal.BlockContainerJS} brokenBlock a block in the frame that is broken
 */
function destroyPortal(block, brokenBlock) {
  const { entity: { persistentData, persistentData: { axis } }, level } = block
  let inCoords = persistentData.innerBlock
  let innerBlock = level.getBlock(inCoords.x, inCoords.y, inCoords.z)

  let /**@type {BlockPos[]}*/ area
  if(brokenBlock) {
    level.setBlock(brokenBlock.pos, brokenBlock.blockState, 3, 512)
    area = findArea(innerBlock, axis, block, true)
    level.removeBlock(brokenBlock.pos, false)
    if(brokenBlock.pos.compareTo(block.pos) != 0) {
      level.getBlock(block.pos).entity.persistentData.isRunning = false
      level.getBlock(block.pos).entity.persistentData.remove("destination")
    }
  } else {
    area = findArea(innerBlock, axis, block, true)
    level.getBlock(block.pos).entity.persistentData.isRunning = false
    level.getBlock(block.pos).entity.persistentData.remove("destination")
  }
  
  area.forEach((blockPos, index) => {
    Utils.server.scheduleInTicks(index, () => {
      level.setBlock(blockPos, Block.id("minecraft:air").blockState, 3, 512)
    })
  })
  let {x, y, z} = block
  let entities = level.getEntitiesWithin(AABB.ofBlocks(block.pos.offset(8, 8, 8), block.pos.offset(-8,-8,-8)))
  entities.forEach(entity => {
    if(entity.type == "minecraft:player") {
      entity.runCommandSilent(`playsound block.beacon.deactivate ambient @s ${x} ${y} ${z} 2 0.8`)
      return
    }
  })
}

/**
 * @param {Internal.Level} level 
 * @param {Internal.CompoundTag} frame 
 */
function despark(frame, level) {
  let /**@type {BlockPos[]}*/framePosArray = []
  frame.forEach(framePos => {
    let {x, y ,z} = framePos
    framePosArray.push(BlockPos.ZERO.offset(x, y ,z))
  })
  framePosArray.forEach(pos => {
    let block = level.getBlock(pos)
    if(block.id == "kubejs:portal_controller") {
      let direction = block.properties.get("facing")
      level.setBlock(pos, Block.id(block.id, {facing: direction}).blockState, 3, 512)
    } else if(block.id == "kubejs:portal_frame") {
      level.setBlock(pos, Block.id(block.id).blockState, 3, 512)
    }
  })
}
