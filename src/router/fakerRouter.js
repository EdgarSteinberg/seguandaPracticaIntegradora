// import { Router } from 'express';
// import { generateProduct } from '../utils/fakerUtil.js';

// const router = Router();

// router.get('/', async (req, res) => {
//     const products = [];

//     for(let i = 0 ; i < 100; i++){
//         products.push(generateProduct());
//     }

//     res.send({
//         status: 'success',
//         payload: products
//     });
// });

// export default router;

// routes/apiRouter.js
import { Router } from 'express';
import { getMockedProducts } from '../utils/fakerUtil.js';

const router = Router();

router.get('/mockingproducts', async (req, res) => {
    const products = getMockedProducts();
    res.send({
        status: 'success',
        payload: products
    });
});

export default router;
