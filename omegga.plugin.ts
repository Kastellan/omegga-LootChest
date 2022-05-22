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
    // Write your plugin!
    this.omegga.on(
      'interact',
      async ({ player, position, message }) => {
        if (message !== 'loot') return;
        Omegga.middlePrint(player.name,`You looted`);
      });

    return {};
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}