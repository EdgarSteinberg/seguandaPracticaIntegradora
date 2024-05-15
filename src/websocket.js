import { ProductManagerDB } from "./dao/productManagerDB.js";
import { MessagesManagerDB } from "./dao/messagesManagerDB.js";
import { CartManagerDB } from "./dao/cartManagerDB.js";
const Manager = new ProductManagerDB();
const Message = new MessagesManagerDB();
const CartManager = new CartManagerDB();


export default (io) => {
    io.on("connection", (socket) => {
        //console.log("Nuevo cliente conectado ------>", socket.id);
3

        socket.on("nuevoProducto", async data => {
            console.log("Recibido nuevo producto: ", data);

            const newProduct = await Manager.createProduct(data);
            // Agregar el ID generado al objeto de datos antes de emitir el evento
            const dataWithID = { id: newProduct.id, ...data };

            console.log("Producto enviado al cliente: ", dataWithID);

            socket.emit("productoAgregado", dataWithID);
        });

        // Escuchar evento para eliminar un producto
        socket.on("eliminarProducto", async productId => {
            try {
                console.log("Recibida solicitud para eliminar el producto del servidor con ID:", productId);

                await Manager.deleteProduct(productId);

                socket.emit("productoEliminado", productId);
            } catch (error) {
                console.error("Error al eliminar el producto:", error.message);
                // Aquí puedes decidir cómo manejar el error, por ejemplo, enviar un mensaje de error al cliente
                socket.emit("errorEliminarProducto", error.message);
            }
        });


        //socket chat
        socket.on("nuevoMensaje", async data => {
            console.log(data)
            await Message.createMessages(data);

            io.emit("nuevoMensaje", data);
        });

        
        socket.on('agregarProductoAlCarrito', async ({ productId }) => {
            console.log('ID del producto recibido:', productId);
            try {
                // Crear un nuevo carrito
                const cart = await CartManager.createCart();
        
                // Obtener el ID del carrito creado
                const cid = cart._id;
        
                // Agregar el producto al carrito utilizando el ID del carrito y el ID del producto
                const updatedCart = await CartManager.addProductByID(cid, productId);
        
                // Emitir un evento de confirmación al cliente con el carrito actualizado
                socket.emit('productoAgregadoAlCarrito', updatedCart);
            } catch (error) {
                console.error('Error al agregar el producto al carrito:', error);
                // Enviar un mensaje de error al cliente si es necesario
            }
        });

    });
}