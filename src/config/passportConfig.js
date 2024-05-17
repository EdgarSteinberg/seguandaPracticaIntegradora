import passport from 'passport';
import jwt, { ExtractJwt } from 'passport-jwt';

const JWTStratergy = jwt.Strategy;


const initializatePassport = () => {
 
    // Estrategia de autenticación JWT
    passport.use(
        'jwt',
        new JWTStratergy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: 'coderSecret' 
            },
            async (jwt_payload, done) => {
                try {
                    return done(null, jwt_payload);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
 
};

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.auth ?? null;
    }
    return token;
};


export default initializatePassport;



