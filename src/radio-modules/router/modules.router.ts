import { Router, Request, Response, NextFunction } from 'express';
import MyRouter from '../../app-router/my-router.abstract';
import ModulesService from '../services/modules.service';
import {
  ResponseStatus,
  ResponseCode,
} from '../../app-types/response-status.enum';
import Module from '../entity/module';
import ModuleDtoMapper from '../dto/module-dto.mapper';
import { ResponseType } from '../../app-types/response.type';
import CreateModuleReqDto from '../dto/create-module-req.dto';
import getValidationService from '../../validation/validation.service';
import ModuleRoutes from '../routes';

class ModulesRouter extends MyRouter {
  private readonly modulesService: ModulesService = new ModulesService();

  constructor(router = Router()) {
    super(router);

    this.router.get(
      ModuleRoutes.MODULES,
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<Response<ResponseType> | void> => {
        try {
          const allModules: Module[] = await this.modulesService.getModules();
          return res.status(ResponseCode.OK).json({
            status: ResponseStatus.OK,
            code: ResponseCode.OK,
            message: 'Modules fetched correctly.',
            data: {
              modules: allModules.map((module: Module) =>
                new ModuleDtoMapper(module).mapModuleForResponse(),
              ),
            },
          });
        } catch (err) {
          next(err);
        }
      },
    );

    this.router.post(
      ModuleRoutes.MODULES,
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<Response<ResponseType> | void> => {
        try {
          const [newModuleCreateEntity, error] = await getValidationService(
            CreateModuleReqDto,
            req.body,
          ).validateAndGetInstance();
          if (error) return next(error);

          const createResponse: Module = await this.modulesService.addModule(
            newModuleCreateEntity as CreateModuleReqDto,
          );

          return res.status(ResponseCode.ADDED).json({
            status: ResponseStatus.OK,
            code: ResponseCode.ADDED,
            message: 'Module added',
            data: {
              addedModule: new ModuleDtoMapper(
                createResponse,
              ).mapModuleForResponse(),
            },
          });
        } catch (err) {
          next(err);
        }
      },
    );
  }
}

export default ModulesRouter;
