import { inject, injectable } from "tsyringe";
import { UserService } from "./user-service";
import { MultipartFile } from "@fastify/multipart";
import { upload } from "../utility"
import { ITokenUser } from "../models";

@injectable()
export class UploadService {
    constructor(@inject('UserService') private readonly userService: UserService){
    }

    uploadProfilePicture = async (file: MultipartFile, userId: string, contextUser: ITokenUser): Promise<string> => {
        let url = await upload(file, userId);
        await this.userService.partialUpdate(userId, {pictureUrl: url}, contextUser);
        return url;
    }
}