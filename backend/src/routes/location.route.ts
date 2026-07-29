import { Router } from 'express';
import { LocationController } from '@controllers/location.controller';
import { Routes } from '@interfaces/routes.interface';
import { upload } from '@utils/multerConfig';
import { Container } from 'typedi';
import path from 'path';
export class LocationRoute implements Routes {
  public path = '/';
  public router = Router();
  private locationController = Container.get(LocationController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}api/locations`, this.locationController.getLocations);
    this.router.post(`${this.path}api/locations/upload`, this.locationController.uploadLocation);
  }
}
