import { Router, Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
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
import isValid from '../../validation/validation.middleware';
import { validate, ValidationError } from 'class-validator';
import { BadRequestException } from '../../exceptions/http-exceptions/bad-request.exception';

class ModulesRouter extends MyRouter {
  private readonly modulesService: ModulesService = new ModulesService();

  constructor(router = Router()) {
    super(router);

    this.router.get(
      '/modules',
      async (req: Request, res: Response): Promise<Response<ResponseType>> => {
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
      },
    );

    this.router.post(
      '/modules',
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<Response<ResponseType> | void> => {
        //there outside from here in one service - start
        const newModuleCreateEntity: CreateModuleReqDto = plainToInstance(
          CreateModuleReqDto,
          req.body,
        );

        const error: BadRequestException | undefined =
          await isValid<CreateModuleReqDto>(newModuleCreateEntity);
        if (error) return next(error);
        // -end.

        const createResponse: Module = await this.modulesService.addModule(
          newModuleCreateEntity,
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
      },
    );
  }
}

export default ModulesRouter;
