const $BooleanProperty = Java.loadClass('net.minecraft.world.level.block.state.properties.BooleanProperty')
const $LivingEntity = Java.loadClass("net.minecraft.world.entity.LivingEntity")
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

/**
 * @param {Internal.BlockEntityJS} blockEntity 
 */
global.energyCheck = blockEntity => {
  let { level, persistentData: {energy, hasEnergyToRun, isRunning, energyCost} } = blockEntity
  if(hasEnergyToRun && isRunning) {
    if(energy < energyCost) {
      global.destroyPortal(blockEntity.block)
      level.getBlock(blockEntity.blockPos).entity.persistentData.hasEnergyToRun = false

    }
    level.getBlock(blockEntity.blockPos).entity.persistentData.putInt("energy", energy - energyCost)
  }
  if(energy >= energyCost) {
  level.getBlock(blockEntity.blockPos).entity.persistentData.putBoolean("hasEnergyToRun", true)
  }
  if(energy < 0) {
    level.getBlock(blockEntity.blockPos).entity.persistentData.energy = 0
  }
}

/**
 * 
 * @param {Internal.BlockEntityJS} blockEntity 
 */
global.teleportCheck = blockEntity => {
  let { level, blockPos, persistentData: { controller } } = blockEntity
  let controllerBlock = level.getBlock(controller.x, controller.y, controller.z)
  let linkedBlock = global.findOtherSide(controllerBlock)
  if(linkedBlock) {
    let {x, y, z} = controllerBlock.entity.persistentData.destination ? controllerBlock.entity.persistentData.destination : linkedBlock.entity.persistentData.innerBlock
    let entities = level.getEntitiesWithin(AABB.ofBlock(blockPos))
    entities.forEach(entity => {
      if(entity.persistentData.get("recentTeleportJS") == false) {
        entity.teleportTo(linkedBlock.dimension, x + 0.5, y, z + 0.5, linkedBlock.blockState.getValue(BlockProperties.HORIZONTAL_FACING).yaw, entity.pitch)
        if(!(entity instanceof $LivingEntity)) {
          let /**@type {Vec3i}*/vec = directions[linkedBlock.properties.get("facing")]
          entity.addDeltaMovement(Vec3d.ZERO.add(vec.x, vec.y, vec.z))
        }
        entity.persistentData.putBoolean("recentTeleportJS", true)
        Utils.server.scheduleInTicks(30, () => {
        entity.persistentData.putBoolean("recentTeleportJS", false)
        })
      }
    })
  } else if(controllerBlock.entity.persistentData.isRunning) {
    global.destroyPortal(controllerBlock)
  }
}

/**
 * @param {Internal.BlockEntityJS} blockEntity 
 */
global.portalCheck = blockEntity => {
  const {block, block: {level}} = blockEntity
  let success = false
  let /**@type {{area: BlockPos[], frame: BlockPos[]}}*/found;
  axisList.forEach(axis => {
    if(success) return
    orthogonals[axis].forEach(dirOffset => {
      if(success) return
      let offsetBlock = level.getBlock(block.pos.offset(dirOffset))
      if(offsetBlock.id == "minecraft:air" || offsetBlock.id == "kubejs:portal_plane") {
        found = global.findArea(offsetBlock, axis, block)
        if(found) {
        if(found.area) {
          success = true
          level.getBlock(block.pos).entity.persistentData.innerBlock = {x: offsetBlock.x, y: offsetBlock.y, z: offsetBlock.z}
          level.getBlock(block.pos).entity.persistentData.axis = axis
          let /**@type {Internal.Map}*/nbtFrame = JsonIO.read("kubejs/client_scripts/json.json")
          found.frame.forEach((framePos, index) =>{
            nbtFrame.put(index, {x: framePos.x, y: framePos.y, z: framePos.z})
          })
          level.getBlock(block.pos).entity.persistentData.frame = nbtFrame
        }
        }
      }
    })
  })
  let frame = level.getBlock(block.pos).entity.persistentData.frame
  let { persistentData: {isRunning} } = blockEntity
  if(!success && frame) {
    global.despark(frame, level)
  }
  if(isRunning) {
    let linkedBlock = global.findOtherSide(block)
    if(!linkedBlock.entity.persistentData.isRunning) {
      global.destroyPortal(block)
    }
  }
}

StartupEvents.registry("block", event => {
  event.create("portal_controller", 'cardinal')
    .property($BooleanProperty.create('up'))
    .property($BooleanProperty.create('down'))
    .property($BooleanProperty.create('north'))
    .property($BooleanProperty.create('east'))
    .property($BooleanProperty.create('south'))
    .property($BooleanProperty.create('west'))
    .defaultState(state => {
      booleanBlockstateSetup(state)
    })
    .soundType("lodestone")
    .hardness(2.5)
    .resistance(4)
    .tagBlock('minecraft:mineable/pickaxe')
    .tagBlock('minecraft:needs_diamond_tool')
    .blockEntity(entityInfo => {
      entityInfo.attachCapability(CapabilityBuilder.ENERGY.customBlockEntity()
        .canExtract(() => false)
        .canReceive(() => true)
        .receiveEnergy((blockEntity, amount, simulate) => {
          let energy = blockEntity.persistentData.getInt("energy")
          let received = Math.min(4000000 - energy, amount)
          if(!simulate) {
            blockEntity.persistentData.putInt("energy", energy + received)
          }
          return received
        })
        .getEnergyStored(blockEntity => {
          return blockEntity.persistentData.getInt("energy")
        })
        .getMaxEnergyStored(() => 4000000)
      )
      entityInfo.serverTick(20, 0, blockEntity => {
        global.energyCheck(blockEntity)
        global.portalCheck(blockEntity)
      })
    })
    .displayName("Portal Interface")

  event.create("portal_frame")
    .property($BooleanProperty.create('up'))
    .property($BooleanProperty.create('down'))
    .property($BooleanProperty.create('north'))
    .property($BooleanProperty.create('east'))
    .property($BooleanProperty.create('south'))
    .property($BooleanProperty.create('west'))
    .defaultState(state => {
      booleanBlockstateSetup(state)
    })
    .soundType("metal")
    .hardness(2)
    .resistance(3)
    .textureAll("kubejs:block/portal_frame")
    .requiresTool(true)
    .tagBlock('minecraft:mineable/pickaxe')
    .tagBlock('minecraft:needs_iron_tool')
    .model('kubejs:block/portal_frame/frame')
    .displayName("Spark Ring Block")
    
  event.create("portal_plane")
    .property(BlockProperties.AXIS)
    .placementState(ctx => {
      ctx.set(BlockProperties.AXIS, ctx.nearestLookingDirection.axis)
    })
    .hardness(-1)
    .resistance(10000)
    .textureAll("kubejs:block/portal_plane")
    .fullBlock(false)
    .noCollision()
    .notSolid()
    .renderType("translucent")
    .blockEntity(entityInfo => {
      entityInfo.serverTick(4, 0, (blockEntity) => {
        global.teleportCheck(blockEntity)
      })
    })
    .displayName("Portal")
})

/**
 * @param {Internal.BlockStateModifyCallbackJS} state 
 */
function booleanBlockstateSetup(state) {
  state.properties.forEach(property => {
    if(property instanceof $BooleanProperty) {
      state.cycle(property)
    }
  })
}

/**
 * @param {Internal.BlockContainerJS} initBlock 
 * @param {string} axis
 * @param {Internal.BlockContainerJS} controller 
 */
global.findArea = (initBlock, axis, controller) => {
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
  let energyCost;
  if(badCorners.length != 0) {
    energyCost = badCorners.length * 1000 + 16000
    level.getBlock(controller.pos).entity.persistentData.status = "inefficient"
  } else {
    energyCost = 16000
    level.getBlock(controller.pos).entity.persistentData.status = "efficient"
  }
  level.getBlock(controller.pos).entity.persistentData.putInt("energyCost", energyCost)
  level.getBlock(controller.pos).entity.persistentData.isFormed = true
  global.addSparks(done, axis, level, frame)
  return {area: done, frame: frame}
}

/**
 * 
 * @param {BlockPos[]} area 
 * @param {BlockPos[]} frame 
 * @param {string} axis 
 * @param {Internal.Level} level 
 */
global.addSparks = (area, axis, level, frame) => {
  frame.forEach(framePos => {
    let block = level.getBlock(framePos)
    let faceDirs = JsonIO.read("kubejs/client_scripts/json.json")
    area.forEach(air => {
      orthogonals[axis].forEach(offDir => {
        if(air.subtract(framePos).compareTo(offDir) == 0) {
          if(block.id == "kubejs:portal_controller") {
            faceDirs.put("facing", block.properties.get("facing"))
          }
          for(const face in directions) {
            let offDir2 = directions[face]
            if(offDir2.compareTo(offDir) == 0) {
              faceDirs.put(face, true)
            }
          }
        }
      })
    })
    level.setBlock(framePos, Block.id(block.id, faceDirs).blockState,3, 512)
  })
}

/**
 * Searches an array containing x y z type vectors (or blockpos) to see if a vector is within it
 * @param {Vec3i[]} array 
 * @param {Vec3i} searchVec 
 */
global.contains = (array, searchVec) => {
  let bool = false
  array.forEach(vec => {
    if(vec.compareTo(searchVec) == 0) bool = true
  })
  return bool
}

/**
 * @param {Internal.Level} level 
 * @param {Internal.CompoundTag} frame 
 */
global.despark = (frame, level) => {
  let /**@type {BlockPos[]}*/framePosArray = []
  frame.allKeys.forEach(index => {
    let {x, y ,z} = frame[index]
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

/**
 * 
 * @param {Internal.BlockContainerJS} block 
 * @returns {Internal.BlockContainerJS | false}
 */
global.findOtherSide = (block) => {
  if(block.entity.persistentData.inventory) {
    let /**@type {string}}*/invW = block.entity.persistentData.inventory.tag.get("w").asString
    let network = JsonIO.read("kubejs/server_scripts/portalNetwork.json")
    if(network.get(("-" + invW).toString()) && network.get(invW)) {
      let checkCoords = network.get(invW)
      let checkPos = BlockPos.ZERO.offset(checkCoords.x, checkCoords.y, checkCoords.z)
      let /**@type {{x: number, y: number, z: number, dimension: ResourceLocation}}*/linkedData = network.get(checkPos.compareTo(block.pos) == 0 ? ("-" + invW).toString() : invW)
      let linkedBlock = Utils.server.getLevel(linkedData.dimension).getBlock(linkedData.x ,linkedData.y, linkedData.z)
      if(linkedBlock.id == "kubejs:portal_controller" && linkedBlock.entity.persistentData.inventory.tag.get("w").asString == invW) {
        return linkedBlock
      }
    }
  }
  return false
}

/**
 * @param {Internal.BlockContainerJS} block 
 */
global.destroyPortal = (block) => {
  const { entity: { persistentData, persistentData: { axis } }, level } = block
  let inCoords = persistentData.innerBlock
  let innerBlock = level.getBlock(inCoords.x, inCoords.y, inCoords.z)
  let /**@type {BlockPos[]}*/ area = global.findArea(innerBlock, axis, block).area
  area.forEach((blockPos, index) => {
    Utils.server.scheduleInTicks(index, () => {
      level.setBlock(blockPos, Block.id("minecraft:air").blockState, 3, 512)
    })
  })
  level.getBlock(block.pos).entity.persistentData.isRunning = false
  level.getBlock(block.pos).entity.persistentData.remove("destination")
  let {x, y, z} = block
  let entities = level.getEntitiesWithin(AABB.ofBlocks(block.pos.offset(8, 8, 8), block.pos.offset(-8,-8,-8)))
  entities.forEach(entity => {
    if(entity.type == "minecraft:player") {
      entity.runCommandSilent(`playsound block.beacon.deactivate ambient @s ${x} ${y} ${z} 2 0.8`)
      return
    }
  })
}