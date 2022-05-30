# omegga-LootChest
A typed safe plugin for [omegga](https://github.com/brickadia-community/omegga).

Simple loot chests for all your item looting needs.

## Install
`omegga install gh:Kastellan/LootChest`

## How To Use
Only works with ONE minigame. (Loot chests will respawn whenever ANY minigame restarts.)

Add yourself to 'Authorized-Users' in config in order to use the /resetlootchests command.

To make a loot chest, create a 2x2 cube and give it an Interact component with the 'Print to Console' field set to 'LootChest'.
All chests respawn as a glowing gold cube (with a light and audio component). I suggest taking one of these and duping them to make your starting chests.

Use /resetlootchests to reset all loot chests in the server.

## Known Issues
- Only works with one minigame.
- A loot chest that gets deleted while opened will respawn (chests need to be deleted while closed to really get rid of them).

## Planned Features
- Despawn/respawn time + config options for these
- Config option to disable lights
- Support for more rarity tiers?
- Multiple minigame support? 
