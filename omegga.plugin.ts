import type { OmeggaPlugin, OL, PS, PC, _OMEGGA_UTILS_IMPORT } from 'omegga/plugin';
import LootTable from './loottable.json';

const openBoxLocations = [];
const publicUser = {
	id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
	name: 'Generator',
};
const lootBrick: WriteSaveObject = {
	author: {
		id: publicUser.id,
		name: 'TypeScript',
	},
	description: 'Loot Chest',
	map: 'brs-js example',
	materials: [
		'BMC_Plastic',
		'BMC_Metallic',
		'BMC_Glow',
		'BMC_Glass',
		'BMC_Hologram',
		'BMC_Ghost',
		'BMC_Ghost_Fail'
	],
	brick_owners: [publicUser],
	bricks: [{
		size: [10, 10, 10],
		color: [255, 64, 8],
		material_index: 2,
		position: [0,0,0],
		components: {
			BCD_Interact: {
				bPlayInteractSound: true,
				Message: "",
				ConsoleTag: `LootChest`     
			},
			BCD_AudioEmitter: {
				AudioDescriptor: 'BA_AMB_Component_Alarm_Scifi_Creepy',
				VolumeMultiplier: 0.5,
				PitchMultiplier: 2,
				InnerRadius: 64,
				MaxDistance: 128,
				bSpatialization: true
			},
			BCD_PointLight: {
				bMatchBrickShape: false,
			    Brightness: 80,
			    Radius: 50,
			    Color: [1,1,1,1],
			    bUseBrickColor: true,
			    bCastShadows: false
			}
		}
	}]
};

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  
  async init() {
	// Subscribe to the minigame events plugin
    const minigameEvents = await this.omegga.getPlugin('minigameevents')
    if (minigameEvents) {
      console.log('subscribing to minigameevents')
      minigameEvents.emitPlugin('subscribe')
    } else {
      throw Error("minigameevents plugin is required for this to plugin")
    }
	
	let itemIndex = [];
	let weightTotal = 0;
	for (let i in LootTable) {
		itemIndex.push(LootTable[i]);
		weightTotal += LootTable[i].chanceWeight;
	}
	console.log(`loaded ${itemIndex.length} items with a weighttoal of ${weightTotal}`);
	
	this.omegga.on('cmd:resetlootchests', async (name) => {
		if (this.config["Authorized-Users"].find(p => p.name == name)) {
			resetLootCrates.call(this);
		}
		else {
			this.omegga.whisper(name, 'You do not have permission to use that command');
		}
	});
	
    this.omegga.on(
      'interact',
      async ({ player, position, brick_name, message }) => {
        if (message !== 'LootChest') return;
		const match = brick_name.match(/^2x Cube$/);
        if (!match) return;
		//save the location of this box and delete it
		openBoxLocations.push(position);
		Omegga.writeln(`Bricks.ClearRegion ${position[0]} ${position[1]} ${position[2]} 10 10 10`);
		//pick random item and rarity
		let randomNumber = Math.random()*weightTotal;
		let chosenIndex = 0;
		for (let i = 0; randomNumber > 0; i++) {
			randomNumber -= itemIndex[i].chanceWeight;
			chosenIndex = i
		}
		let itemSize = 1;
		let itemRarity = '';
		let lightColor = [0,0,0,0];
		let lightBrightness = 0;
		if (this.config["Use-Item-Rarities"]){
			let rarity = Math.floor(Math.random()*6);
			if (rarity < 3) {
				itemSize = itemIndex[chosenIndex].scale.common;
				itemRarity = `<color="808080"><font="glacialindifference"><size="24">common</></></>`;
			}
			else if (rarity < 5) {
				itemSize = itemIndex[chosenIndex].scale.rare;
				itemRarity = `<color="0080FF"><font="glacialindifference"><size="24">rare</></></>`;
				lightColor = [0,127,255,127];
				lightBrightness = 40;
			}
			else {
				itemSize = itemIndex[chosenIndex].scale.legendary;
				itemRarity = `<color="FFC000"><font="glacialindifference"><b><size="32">LEGENDARY</></></></>`;
				lightColor = [255,90,25,255];
				lightBrightness = 80;
			}
		}
		console.log(`index: ${chosenIndex}, item: ${itemIndex[chosenIndex].pickup}, size: ${itemSize}`);
		if (this.config["Use-Item-Rarities"]){
			Omegga.middlePrint(player.name,`<size="18">You looted a</><br>${itemRarity}<br><size="18">${itemIndex[chosenIndex].name}</>`);
		} else {
			Omegga.middlePrint(player.name,`<size="18">You looted a</><br><size="18">${itemIndex[chosenIndex].name}</>`);
		}
		//load item spawn brick
		const save: WriteSaveObject = {
			author: {
				id: publicUser.id,
                name: 'TypeScript',
            },
            description: 'Opened Chest',
            map: 'brs-js example',
            materials: [
                'BMC_Plastic',
                'BMC_Metallic',
                'BMC_Glow',
                'BMC_Glass',
                'BMC_Hologram',
                'BMC_Ghost',
                'BMC_Ghost_Fail'
            ],
            brick_owners: [publicUser],
            bricks: [{
                size: [10, 10, 2],
                color: [25, 25, 25],
                position: [0,0,-8],
			    components: {
					BCD_ItemSpawn: {
						PickupClass: itemIndex[chosenIndex].pickup,
						bPickupEnabled: true,
						bPickupRespawnOnMinigameReset: true,
					    PickupMinigameResetRespawnDelay: 0,
					    bPickupAutoDisableOnPickup: true,
					    PickupRespawnTime: 0,
					    PickupOffsetDirection: 4,
					    PickupOffsetDistance: 0.5,
					    PickupRotation: [0,0,0],
					    PickupScale: itemSize,
					    bPickupAnimationEnabled: true,
						PickupAnimationAxis: 2,
						bPickupAnimationAxisLocal: false,
						PickupSpinSpeed: 0.2,
						PickupBobSpeed: 0.1,
						PickupBobHeight: 0.4,
						PickupAnimationPhase: 0,
					},
					BCD_PointLight: {
						bMatchBrickShape: false,
						Brightness: lightBrightness,
						Radius: 50,
						Color: lightColor,
						bUseBrickColor: false,
						bCastShadows: false
					}
			    }              
			}]
		};
		let inputData = {offX: position[0], offY: position[1], offZ: position[2], quiet: true, correctPalette: true, correctCustom: false};
        Omegga.loadSaveData(save,inputData);
      });

    return { registeredCommands: ['resetlootchests'] };
  }

  async stop() {
	openBoxLocations.length = 0;
    // Unsubscribe to the death events plugin
    const minigameEvents = await this.omegga.getPlugin('minigameevents')
    if (minigameEvents) {
      console.log('unsubscribing from minigameevents')
      minigameEvents.emitPlugin('unsubscribe')
    } else {
      throw Error("minigameevents plugin is required for this to plugin")
    }
  }
  
  async pluginEvent(event: string, from: string, ...args: any[]) {
    //console.log(event, from, args)
    //if (event === 'roundend') {
    //  const [{ name }] = args;
    //  this.omegga.broadcast(`${name} has ended.`)
    //}

    if (event === 'roundchange') {
      const [{ name }] = args;
      if (this.config["Debug-Text"]) this.omegga.broadcast(`${name} has reset.`);
	  if (name == 'GLOBAL') return;
	  //change all the opened boxes back to closed boxes
	  resetLootCrates.call(this);
    }
  }
}

var resetLootCrates = function() { //change all the opened boxes back to closed boxes
  if (openBoxLocations.length != 0) {
	  for (let i in openBoxLocations) { //delete the boxes
		  let posX = openBoxLocations[i][0];
		  let posY = openBoxLocations[i][1];
		  let posZ = openBoxLocations[i][2];
		  //console.log(`box at ${posX}, ${posY}, ${posZ}`);
		  Omegga.writeln(`Bricks.ClearRegion ${posX} ${posY} ${posZ} 10 10 10`);
	  }
	  for (let i in openBoxLocations) { //regenerate the boxes
		  let posX = openBoxLocations[i][0];
		  let posY = openBoxLocations[i][1];
		  let posZ = openBoxLocations[i][2];
		  let inputData = {offX: posX, offY: posY, offZ: posZ, quiet: true, correctPalette: true, correctCustom: false};
		  Omegga.loadSaveData(lootBrick,inputData);
	  }
	  if (this.config["Debug-Text"]) 
		 this.omegga.broadcast(`Respawned ${openBoxLocations.length} loot chests.`);
	  openBoxLocations.length = 0;
  }
}