import type { OmeggaPlugin, OL, PS, PC, _OMEGGA_UTILS_IMPORT } from 'omegga/plugin';
import LootTable from './loottable.json';

type Config = { foo: string };
type Storage = { bar: string };

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
	description: 'Noise Terrain',
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
		color: [100, 66, 5],
		material_index: 2,
		position: [0,0,0],
		components: {
			BCD_Interact: {
				bPlayInteractSound: true,
				Message: "",
				ConsoleTag: `loot`     
			}
			BCD_AudioEmitter: {
				AudioDescriptor: 'BA_AMB_Component_Alarm_Scifi_Creepy',
				VolumeMultiplier: 0.5,
				PitchMultiplier: 2,
				InnerRadius: 64,
				MaxDistance: 128,
				bSpatialization: true
			}
			BCD_PointLight: {
				bMatchBrickShape: false,
			    Brightness: 80,
			    Radius: 5,
			    Color: [100,100,100],
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
	// Subscribe to the death events plugin
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
	
    this.omegga.on(
      'interact',
      async ({ player, position, brick_name, message }) => {
        if (message !== 'loot') return;
		const match = brick_name.match(/^2x Cube$/);
        if (!match) return;
		//save the location of this box and delete it
		openBoxLocations.push(position);
		Omegga.writeln(`Bricks.ClearRegion ${position[0]} ${position[1]} ${position[2]} 10 10 10`);
		//pick random item and rarity
		let randomNumber = Math.random()*weightTotal;
		let randomIndex = 0;
		for (let i = 0; randomNumber > 0; i++) {
			randomNumber -= itemIndex[i].chanceWeight;
			randomIndex = i
		}
		let rarity = Math.floor(Math.random()*6);
		let itemSize = 0;
		let itemRarity = '';
		if (rarity < 3) {
			itemSize = itemIndex[randomIndex].scale.common;
			itemRarity = `<color="808080"><font="glacialindifference"><size="24">common</></></>`;
		}
		else if (rarity < 5) {
			itemSize = itemIndex[randomIndex].scale.rare;
			itemRarity = `<color="0080FF"><font="glacialindifference"><size="24">rare</></></>`;
		}
		else {
			itemSize = itemIndex[randomIndex].scale.legendary;
			itemRarity = `<color="FFC000"><font="glacialindifference"><b><size="32">LEGENDARY</></></></>`;
		}
		console.log(`index: ${randomIndex}, item: ${itemIndex[randomIndex].pickup}, size: ${itemSize}`);
		Omegga.middlePrint(player.name,`<size="18">You looted a</><br>${itemRarity}<br><size="18">${itemIndex[randomIndex].name}</>`);
		//load item spawn brick
		const save: WriteSaveObject = {
			author: {
				id: publicUser.id,
                name: 'TypeScript',
            },
            description: 'Noise Terrain',
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
						PickupClass: itemIndex[randomIndex].pickup,
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
					}
			    }              
			}]
		};
		let inputData = {offX: position[0], offY: position[1], offZ: position[2], quiet: true, correctPalette: true, correctCustom: false};
        Omegga.loadSaveData(save,inputData);
      });

    return {};
  }

  async stop() {
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
    if (event === 'roundend') {
      const [{ name }] = args;
      this.omegga.broadcast(`${name} has ended.`)
    }

    if (event === 'roundchange') {
      const [{ name }] = args;
      this.omegga.broadcast(`${name} has reset.`);
	  //change all the opened boxes back to closed boxes
	  if (openBoxLocations.length != 0) {
		  this.omegga.broadcast(`Who opened all these boxes?`)
		  for (let i in openBoxLocations) { //delete the boxes
			  let posX = openBoxLocations[i][0];
			  let posY = openBoxLocations[i][1];
			  let posZ = openBoxLocations[i][2];
			  console.log(`box at ${posX}, ${posY}, ${posZ}`);
			  Omegga.writeln(`Bricks.ClearRegion ${posX} ${posY} ${posZ} 10 10 10`);
		  }
		  for (let i in openBoxLocations) { //regenerate the boxes
			  let posX = openBoxLocations[i][0];
			  let posY = openBoxLocations[i][1];
			  let posZ = openBoxLocations[i][2];
			  let inputData = {offX: posX, offY: posY, offZ: posZ, quiet: true, correctPalette: true, correctCustom: false};
			  Omegga.loadSaveData(lootBrick,inputData);
		  }
		  openBoxLocations.length = 0;
	  }
    }
  }
}
