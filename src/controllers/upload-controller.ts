import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../constants";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../models";
import { authorize } from "../middlewares/authentication";
import { upload } from "../utility";
import { UserService } from "../bl";

@injectable()
export class UploadController extends ControllerBase {
    constructor(@inject('UserService') private readonly userService: UserService){
        super('/upload');
        this.endPoints = [
            {
                method: 'POST',
                path: "profile-picture/{id}",
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.uploadProfilePic as RouteHandlerMethod
            }
        ];

    }


    private uploadProfilePic = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        const file = await req.file()
        if(request.user && file){
            
            let url = await upload(file, req.params.id);
            this.userService.partialUpdate(req.params.id,{pictureUrl: url}, request.user);
            res.send(url);
        }else {
            res.status(404).send({message: 'file not found'});
        }
    }

}