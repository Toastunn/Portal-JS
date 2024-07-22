ItemEvents.tooltip((e) => {
  e.addAdvanced('kubejs:wormhole', (item, isAdvanced, text) => {
    text.add(Text.of('§6W§r coordinate: ').append(Text.aqua(item.nbt.get('w').asString)))
  })
  //for convenience
  e.addAdvanced(Ingredient.all, (item, advanced, text) => {
    if (e.alt && item.nbt && advanced) {
      text.add(Text.of('NBT: ').append(Text.prettyPrintNbt(item.nbt)))
    }
  })
});