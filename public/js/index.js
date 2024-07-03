const socket = io();


document.addEventListener('DOMContentLoaded', function () {

    const formulario = document.getElementById('formulario');
    if (formulario) {
        formulario.addEventListener('submit', function (event) {
            event.preventDefault();
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const price = document.getElementById('price').value;
            const code = document.getElementById('code').value;
            const stock = document.getElementById('stock').value;
            const category = document.getElementById('category').value;
            //const owner = document.getElementById('owner').value;
            const ownerInput = document.getElementById('owner');
            const owner = ownerInput ? ownerInput.value : 'admin'; // Set owner to 'admin' if not present


            const nuevoProducto = {
                title: title,
                description: description,
                price: price,
                code: code,
                stock: stock,
                category: category,
                owner: owner
            };


            socket.emit('nuevoProducto', nuevoProducto,);
            //socket.emit('nuevoProducto', nuevoProducto,user);
            document.getElementById('formulario').reset();
        });

        socket.on('productoAgregado', (nuevoProducto) => {
            console.log('Datos del nuevo producto:', nuevoProducto);
            const listaProductos = document.getElementById('listaProductos');
            const nuevoElementoProducto = document.createElement('div');
            nuevoElementoProducto.classList.add('products');
            nuevoElementoProducto.id = nuevoProducto.id;
            nuevoElementoProducto.innerHTML = `
                <h2>${nuevoProducto.title}</h2>
                <p>Descripción: ${nuevoProducto.description}</p>
                <p>Precio: $ ${nuevoProducto.price}</p>
                <p>Código: ${nuevoProducto.code}</p>
                <p>category: ${nuevoProducto.category}</p>
                <img src="${nuevoProducto.thumbnail}" alt="${nuevoProducto.description}">
                
                <br>
                <button class="delete" data-productid="${nuevoProducto.id}" >Eliminar</button>
            `;
            listaProductos.appendChild(nuevoElementoProducto);
        });
    }

   
    const listaProductos = document.getElementById('listaProductos');
    const currentUserEmail = document.querySelector('.currentUserEmail').value;
    const currentUserRole = document.getElementById('currentUserRole').value;
   // const productOwnerEmail = document.querySelector('.user-email').value
    if (listaProductos) {
        listaProductos.addEventListener('click', function (event) {
            const deleteButton = event.target.closest('.delete');
            
            if (deleteButton) {
                const productId = deleteButton.getAttribute('data-productid');
                const productOwnerEmail = deleteButton.closest('.products').querySelector('.user-email').value;
                
                console.log('Correo electrónico del usuario autenticado:', currentUserEmail, "role", currentUserRole);
                console.log('Correo electrónico del propietario del producto:', productOwnerEmail);

                const productElement = deleteButton.closest('.products');
                if (productElement) {
                    productElement.remove();
                    console.log('Producto eliminado del DOM:', productId, "con email", currentUserRole);
                } else {
                    console.error('El producto con ID', productId, 'no se encontró en el DOM.');
                }
                socket.emit('eliminarProducto', { productId, currentUserEmail, currentUserRole, productOwnerEmail });
            }
        });
    }

});


document.addEventListener('DOMContentLoaded', function () {
    const addToCartButtons = document.querySelectorAll('.agregar');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = button.getAttribute('data-productid'); // Obtener el ID del producto desde el atributo data-productid del botón
            console.log('Producto ID:', productId);
            try {
                // Emitir un evento para agregar el producto al carrito
                socket.emit('agregarProductoAlCarrito', { productId });
            } catch (error) {
                console.error('Error al enviar la solicitud:', error);
                alert('Error al conectar con el servidor');
            }
        });
    });

    socket.on('productoAgregadoAlCarrito', () => {
        Swal.fire({
            title: "¡Producto agregado al carrito!",
            text: "¡Excelente elección!",
            icon: "success"
        });
    });
});



