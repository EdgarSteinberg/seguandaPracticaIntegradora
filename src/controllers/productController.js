import { ProductServiceRespository } from '../repositories/index.js';
import CustomError from '../services/errors/CustomError.js';
import { ErrorCodes} from '../services/errors/enums.js';
import { generateProductIdErrorInfo, generateProductErrorInfo } from '../services/errors/info.js';


class ProductController {
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
            const result = await ProductServiceRespository.getAll(searchQuery, options);

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
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al buscar los productos',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async getProductByID(pid) {
        try {
            const product = await ProductServiceRespository.getById({ _id: pid });
            if (!product) {
                CustomError.createError({
                    name: 'InvalidParamError',
                    cause: `Product ID ${pid} not found`,
                    message: generateProductIdErrorInfo(pid),
                    code: ErrorCodes.INVALID_PARAM
                });
                return;
            }
            return product;
        } catch (error) {
            console.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al buscar el producto',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async createProduct(producto) {
        const { title, description, code, price, stock, category, thumbnail } = producto;

        if (!title || !description || !code || !price || !stock || !category) {
            CustomError.createError({
                name: 'InvalidTypesError',
                cause: generateProductErrorInfo(producto),
                message: 'Error al crear el producto: Uno o más campos requeridos están vacíos',
                code: ErrorCodes.INVALID_TYPES_ERROR
            });
        }

        try {
              
            const result = await ProductServiceRespository.create({ title, description, code, price, stock, category, thumbnail: thumbnail ?? [] });
            return result;
        } catch (error) {
            console.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al crear el producto',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async updateProduct(id, producto) {
        try {
            const result = await ProductServiceRespository.productUpdate({ _id: id }, producto);
            return result;
        } catch (error) {
            console.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al actualizar el producto',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async deleteProduct(productId) {
        try {
            const result = await ProductServiceRespository.productDelete({ _id: productId });
            if (result.deletedCount === 0) {
                CustomError.createError({
                    name: 'InvalidParamError',
                    cause: `Product ID ${productId} not found`,
                    message: `El producto ${productId} no existe`,
                    code: ErrorCodes.INVALID_PARAM
                });
            }
            return result;
        } catch (error) {
            console.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al eliminar el producto',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }
}

export { ProductController };

