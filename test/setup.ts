import {computed} from 'mobx';

import {IDictionary, Record, Store} from '../src';

// tslint:disable:max-classes-per-file

export class User extends Record {
  public static type: string = 'user';

  public firstName: string;
  public lastName: string;

  @computed get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export class Event extends Record {
  public static type: string = 'events';
  public static refs = {
    image: 'images',
    images: 'images',
    organisers: 'organisers',
  };

  public name: string;
  public organisers: Array<Organiser>;
  public images: Array<Image>;
  public image: Image;
  public imagesLinks: IDictionary<string>;
}

export class Image extends Record {
  public static type: string = 'images';
  public static refs = {event: 'events'};

  public name: string;
  public event: Event;
}

export class Organiser extends User {
  public static type = 'organisers';
  public static refs = {image: 'images'};

  public image: Image;
}

export class Photo extends Record {
  public static type = 'photo';
  public static defaults = {
    selected: false,
  };

  public selected: boolean;
}

export class TestStore extends Store {
  public static types = [User, Event, Image, Organiser, Photo];

  public user: Array<User>;
  public events: Array<Event>;
  public images: Array<Image>;

  public organisers: Array<Organiser>;
  public photo: Array<Photo>;
}
