export type EventListener<Data> = (data: Data) => void;

import { remove } from "lodash";

export class EventSetup<Data> {
  private name: string;
  private listeners: EventListener<Data>[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addListener(listener: EventListener<Data>) {
    this.listeners.push(listener);
  }

  removeListener(listenerToRemove: EventListener<Data>) {
    remove(this.listeners, (listener) => listener === listenerToRemove);
  }

  fire(data: Data) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
}
