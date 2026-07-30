import { Service } from 'typedi';

import { Location } from 'interfaces/location.interface';
import { LocationModel } from '@models/location.model';
import { isEmpty } from '@utils/util';
import { generateRandomString } from '@utils/util';
import path from 'path';

@Service()
export class LocationService {
  public async findAllLocations(): Promise<Location[]> {
    const location: Location[] = await LocationModel.find().sort({ createdAt: -1 });
    return location;
  }

  public async createLocations(data): Promise<Location> {
    console.log(data);
    try {
      const location: Location = await new LocationModel(data);
      return location;
    } catch {}
  }
}
