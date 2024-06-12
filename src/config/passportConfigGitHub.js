import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const SECRET_ID = process.env.GITHUB_CLIENT_SECRET;
const SECRET_KEY = process.env.SECRET_KEY;

const initializeGitHubPassport = () => {
    passport.use(
        'github',
        new GitHubStrategy(
            {
                clientID: CLIENT_ID,
                clientSecret: SECRET_ID,
                callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(profile);
                    const email = profile._json.email || `${profile._json.login}@github.com`;
    
                    let user = await userModel.findOne({ $or: [{ email }, { username: profile.username }] }).lean();
    
                    if (!user) {
                        user = await userModel.create({
                            first_name: profile._json.name || profile.username,
                            last_name: '',
                            email,
                            age: 18,
                            password: '',
                            username: profile.username,
                        });
                    }
    
                    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
                    done(null, { ...user, token });
                } catch (error) {
                    done(error);
                }
            }
        )
    );
    

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await userModel.findById(id);
        done(null, user);
    });
};

export default initializeGitHubPassport;
