import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';

import { Location } from 'interfaces/location.interface';
import { LocationService } from 'services/location.service';
import path from 'path';
import fs from 'fs';
import { MulterRequest } from 'interfaces/Multer';

@Service()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  public getLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllLocationsData: Location[] = await this.locationService.findAllLocations();
      res.status(200).json({ data: findAllLocationsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

 

  public uploadLocation = async (req: Request, res: Response, next: NextFunction) => {

    console.log(req.body)
    try {
      const create: Location = await this.locationService.createLocations(req.body);
      res.status(200).json({ data: create, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

}