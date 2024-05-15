import productModel from './models/productModel.js'

class ProductManagerDB {


    async getAllProducts(queryParams = {}) {
        try {
            // Obtener los parámetros de la consulta
            const { page = 1, limit = 10, sort = null, category = null } = queryParams;
    
            // Construir la consulta a la base de datos
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                lean: true
            };
            
            const searchQuery = category ? { category: category.toLowerCase() } : {};

        
            if (sort) {
                if (sort === 'asc') {
                    options.sort = { price: 1 };
                } else if (sort === 'desc') {
                    options.sort = { price: -1 };
                }
            }

            // Obtener los resultados paginados
            const result = await productModel.paginate(searchQuery, options);
    
            // Construir los enlaces de paginación
            const baseURL = "http://localhost:8080/products";
            const prevLink = result.hasPrevPage ? `${baseURL}?page=${result.prevPage}` : null;
            const nextLink = result.hasNextPage ? `${baseURL}?page=${result.nextPage}` : null;
    
            // Devolver los resultados en el formato correcto
            return {
                status: "success",
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: prevLink,
                nextLink: nextLink
            };
        } catch (error) {
            console.error(error.message);
            throw new Error("Error al buscar los productos");
        }
    }
    
    

    async getProductByID(pid) {
        const product = await productModel.findOne({ _id: pid });

        if (!product) throw new Error(`El producto ${pid} no existe!`);

        return product;
    }


    // async createProduct(producto) {
    //     const { title, description, code, price, stock, category, thumbnail } = producto;

    //     if (!title || !description || !code || !price || !stock || !category) {
    //         throw new Error('Error al crear el producto');
    //     }

    //     try {
    //         const result = await productModel.create({ title, description, code, price, stock, category, thumbnail: thumbnail ?? [] });
    //         return result;

    //     } catch (error) {
    //         console.error(error.message);
    //         throw new Error("Error al crear el producto")
    //     }
    // }

    async createProduct(producto) {
        console.log("Datos del producto recibidos:", producto)
        const { title, description, code, price, stock, category, thumbnail } = producto;
        console.log('Datos del producto recibidos:', producto); // Agrega este console.log para verificar los datos del producto recibidos

        // Verifica si alguno de los campos requeridos está vacío
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Error al crear el producto: Uno o más campos requeridos están vacíos');
        }
    
        // Registra el objeto de producto para verificar sus valores
        console.log('Objeto de producto:', producto);
    
        try {
            const result = await productModel.create({ title, description, code, price, stock, category, thumbnail: thumbnail ?? [] });
            return result;
        } catch (error) {
            console.error(error.message);
            throw new Error("Error al crear el producto")
        }
    }
    

    async updateProduct(id, producto) {
        try {
            const result = await productModel.updateOne({ _id: id }, producto);
            return result;

        } catch (error) {
            console.error(error.message);
            throw new Error('Error al actualizar el producto');

        }
    }


    async deleteProduct(productId) {
        try {
            const result = await productModel.deleteOne({ _id: productId});

            if (result.deletedCount === 0) throw new Error(`El producto ${productId} no existe`);

            return result;

        } catch (error) {
            console.error(error.message);
            throw new Error('Error al eliminar el producto');
        }
    }

}

export { ProductManagerDB };






