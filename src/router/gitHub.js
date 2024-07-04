// import { Router } from 'express'

// import passport from 'passport';
// const router = Router();

// router.get("/", passport.authenticate('github', { scope: ['user.email'] }) ,(req, res) => {
//     res.cookie('auth', req.user.token, { maxAge: 60 * 60 * 1000})
// })
// router.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {

//     const token = req.user;
//     console.log('Token recibido en el callback:', token);

//     res.cookie('auth', req.user.token, { maxAge: 60 * 60 * 1000 }).redirect('/');


// });

// export default router;


// import { Router } from 'express';
// import passport from 'passport';

// const router = Router();

// router.get("/", passport.authenticate('github', { scope: ['user.email'] }), (req,res) => {
//     res.cookie('auth', token, { maxAge: 60 * 60 * 1000 }).redirect('/');
// });

// router.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
//     const { user, token } = req.user;
//     console.log('Token recibido en el callback:', token);

//     res.cookie('auth', token, { maxAge: 60 * 60 * 1000 }).redirect('/');
// });

// export default router;


// import { Router } from 'express';
// import passport from 'passport';

// const router = Router();

// router.get("/", passport.authenticate('github', { scope: ['user.email'] }), (req,res) => {
//     if (req.user) {
//         const {  token } = req.user;
//         console.log('Token recibido en el callback:', token);
//         res.cookie('auth', token, { maxAge: 60 * 60 * 1000 }).redirect('/');
//     } else {
//         res.redirect('/login');
//     }
// });

// router.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
//     if (req.user) {
//         const {  token } = req.user;
//         console.log('Token recibido en el callback:', token);
//         res.cookie('auth', token, { maxAge: 60 * 60 * 1000 }).redirect('/');
//     } else {
//         res.redirect('/login');
//     }
// });

// export default router;
import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login', session: false }), (req, res) => {
    if (req.user && req.user.token) {
        res.cookie('auth', req.user.token, { maxAge: 60 * 60 * 1000 }).redirect('/');
    } else {
        res.redirect('/login');
    }
});

export default router;
