import { FastifyReply, FastifyRequest } from 'fastify';
import {FullSystemAccessPrivileges} from '../constants/privileges';

export function hasPermission(...requiredPermissions: string[]){
    return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const user = (req as any).user;

        // Checking if privilege exists
        if(!user || !Array.isArray(user.privileges)) {
            reply.status(403).send({message : "Forbidden. No privilege assigned."});
            return;
        }

        // Grant access if user has full system access
        if (user.privileges.includes(FullSystemAccessPrivileges.code)) {
            return; // access granted
        }

        // Checking if there is at least one permission
        const hasPermission = requiredPermissions.some((perm) => 
            user.privileges.includes(perm)
        );

        if(!hasPermission){
            reply.status(403).send({message : "Forbidden. Insufficient permissions."});
        }
    };
}
