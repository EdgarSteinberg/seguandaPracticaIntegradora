import { Router } from 'express';

import { ProductController } from '../controllers/productController.js';
import { CartController } from '../controllers/cartController.js';
import { MessagesController } from '../controllers/messageController.js';

import { authenticate, publicRoute } from '../middlewares/auth.js'
import { authorization } from '../middlewares/authorization.js';


const Manager = new ProductController();
const CartManager = new CartController();
const Messages = new MessagesController();

const router = Router();

//Ruta Home y Products
router.get('/', authenticate, (req, res) => {
    res.redirect('/products');
});


router.get("/products", authenticate, async (req, res) => {
    try {
        // Obtener los parámetros de la consulta
        const queryParams = {
            page: req.query.page,
            limit: req.query.limit,
            sort: req.query.sort,
            category: req.query.category,
            query: {} // Puedes añadir un objeto de consulta si es necesario
        };

        // Obtener todos los productos con los parámetros de la consulta
        const result = await Manager.getAllProducts(queryParams);

        // Renderizar la vista con los productos y los enlaces de paginación
        res.render(
            "home",
            {
                title: "Coder Ecommerce",
                products: result.payload,
                style: "index.css",
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.prevLink,
                nextLink: result.nextLink,
                user: req.user
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error al obtener los productos");
    }
});

router.get("/products/:pid", authenticate , authorization('user'), async (req, res) => {
    const result = await Manager.getProductByID(req.params.pid)

    res.render("product",
        {
            title: " Productos",
            product: result,
            style: "index.css"
        });
});

//Ruta Realtimeproduct
router.get("/realTimeProducts", authenticate, authorization("admin"), async (req, res) => {
    const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        category: req.query.category,
        query: req.query.query
    };

    try {
        let allProduct = await Manager.getAllProducts(queryParams);

        res.render(
            "realTimeProduct",
            {
                title: "Coder Ecommerce",
                products: allProduct.payload, // Accede al array de productos en el payload
                style: "index.css"
            });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).send("Error al obtener los productos en tiempo real");
    }
});

//Ruta Chat
router.get("/chat", authenticate, authorization("user"), async (req, res) => {
    const allMessage = await Messages.getAllMessages();

    res.render(
        "chat",
        {
            title: "Coder Chat",
            chats: allMessage,
            style: "index.css"
        });
});

//Rutar Cart
router.get("/carts/:cid", authenticate, async (req, res) => {
    try {
        const cart = await CartManager.getCartById(req.params.cid);
        //console.log(cart);
        res.render(
            "carts",
            {
                title: "Carrito Compras",
                cart: cart,
                style: "index.css"
            });
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


//Ruta Login Register Logout
router.get("/login", publicRoute, (req, res) => {
    res.render(
        'login',
        {
            title: "Coder Login",
            style: 'index.css',
            //failLogin: req.session.failLogin ?? false 
        });
});

router.get("/register", publicRoute, (req, res) => {
    res.render(
        'register',
        {
            title: 'Coder Register',
            style: 'index.css',
            //failRegister: req.session.failRegister ?? false
        });
});

router.get('/profile', authenticate, (req, res) => {
    res.render(
        'profile',
        {
            title: 'Coder Perfil',
            style: 'index.css',
            //user: req.cookies

            user: req.user
        });
});

router.get('/notFound', authenticate, (req, res) => {
    res.render(
        'notFound',
        {
            title: 'Coder Not Found',
            style: 'index.css',
            //user: req.cookies

            user: req.user
        });
});

export default router;