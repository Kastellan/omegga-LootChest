import type { OmeggaPlugin, OL, PS, PC } from 'omegga/plugin';

type Config = { foo: string };
type Storage = { bar: string };

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
    this.omegga.on(
      'interact',
      async ({ player, position, brick_name, message }) => {
        if (message !== 'loot') return;
		const match = brick_name.match(/^2x Cube$/);
        if (!match) return;
        Omegga.middlePrint(player.name,`You looted`);
		Omegga.writeln(`Bricks.ClearRegion ${position[0]} ${position[1]} ${position[2]} 10 10 10`);
      });

    return {};
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}