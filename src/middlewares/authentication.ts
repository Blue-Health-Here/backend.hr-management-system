import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { ExtendedRequest, ITokenUser } from '../models';
import { AppError } from '../utility/app-error';

config();

export const authorize = (req: ExtendedRequest, res: FastifyReply, done: HookHandlerDoneFunction) => {
  // Extract the token from the request headers, query parameters, or cookies
  let token = req.cookies['auth_token'] ?? req.headers.authorization;
  if(token?.includes("Bearer")) token = token.split(" ")[1];
  if (!token) {
    throw new AppError('Unauthorized Request', '401');
  }

  try {
    // Verify the token using your secret key
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY || '',{ ignoreExpiration: false });

    // Attach the decoded user data to the request object
    let user = decodedToken;
    req.user = user as ITokenUser;
    
    if(req.activityLog) req.activityLog.addUserDetails(req.user);

    done();
  } catch (error) {
    res.clearCookie('auth_token',{sameSite: 'lax', secure: true,httpOnly: true, path: '/'})
    throw new AppError('Unauthorized Request', '401');
  }
};
