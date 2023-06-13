# Ricebowl API

This RESTful web service designed to support the operations of a food store application. It serves as the backbone of a food store system, handling various functionalities related to managing food products, customer orders, and user authentication.

This project use:

- Node.js v18.16.0
- Express
- MongoDB
- Cloudinary
- Pug (template engine)

## Features

- **Product Management**: The API allows for the creation, retrieval, update, and deletion of food products. It provides endpoints to add new products, view product details, update product information, and remove products from the inventory.
- **Order Processing**: The API enables the management of customer orders. It provides endpoints to place new orders, retrieve order details, update order status, and track the progress of orders. It also calculates order totals.
- **User Authentication**: The API supports user authentication to ensure secure access to protected endpoints. It integrates with industry-standard authentication mechanism, JSON Web Tokens (JWT), allowing users to authenticate and authorize their requests.
- **Search and Filtering**: The API provides search and filtering capabilities to help users find specific products based on various criteria. It supports queries such as searching for products by name.

## Usage

### Authentication:

- #### Register:

  Send POST request to:

  `/auth/login`

  With request body:

      {
      	full_name: user full name
      	email: userEmail@email.com,
      	password: userpassword,
      	role: user or admin (default: user)
      }

- #### Login:

  Send POST request to:

  `/auth/login`

  with request body:

      {
      	email: userEmail@email.com,
      	password: userpassword
      }

  and "authorization" request header:

  `Authorization: Bearer [userToken]`

- #### Logout

  Send POST request to:

  `/auth/logout`

  with `Authorization: Bearer [userToken]` header.

- #### Get User Data

  Send GET request to:

  `/auth/profile`

  with `Authorization: Bearer [userToken]` header.

### Products and orders handling:

From this point, `Authorization: Bearer [userToken]` is rerquired for every request.

Guest (not-logged in) users will only able to view the products.

#### Product

Add, update, delete is **restricted** to user with **admin** role only.

- ##### View Products

  GET `/api/products` or with optional skip and limit for pagination and filters which can be passed as query.

  Possible queries:

  - skip=Number
  - limit=Number
  - search=String
  - category=String
  - tags[]=String

- ##### Add Product

  POST `/api/products` with body:

      {
      	name: productName,
      	description: productDescription,
      	price: 9999,
      	image: image.jpg (file),
      	category: categoryName,
      	tags[]: tagName
      }

  Allowed image format:

  - .png
  - .jpg
  - .jpeg
  - .gif

- ##### Update Product

  PUT `/api/products/[product-id]` with body that specifies which field(s) is going to be updated and it's new value. Example:

      {
      	name: productName,
      	price: 9999,
      	image: newImage.png
      }

- ##### Delete Product
  DELETE `/api/products/[product-id]`

#### Category

All `/api/categories` endpoints is **restricted** to **admin** only

- ##### View Categories

  GET `/api/categories`

- ##### Add Category

  POST `/api/categories` with a body containing:

      {
      	name: categoryName
      }

- ##### Update Category

  PUT `/api/categories/[category-id]` with a body:

      {
      	name: newCategoryName
      }

- ##### Delete Category
  DELETE `/api/categories/[category-id]`

#### Tag

All `/api/tags` endpoints is **restricted** to **admin** only

- ##### View Tags

  GET `/api/tags`

- ##### Add Tag

  POST `/api/tags` with a body containing:

      {
      	name: tagName
      }

- ##### Update Tag

  PUT `/api/tags/[tag-id]` with a body:

      {
      	name: newTagName
      }

- ##### Delete Tag
  DELETE `/api/tags/[tag-id]`

#### Delivery Address

All logged in users have access to every delivery address endpoints.

**Field specific authorization** is in effect for update and delete operation. So users only authorized to update and delete what's belong to them.

- ##### View delivery addresses

  GET `/api/delivery-addresses`

- ##### Add delivery address

  POST `/api/delivery-addresses` with body:

      {
      	label: addressLabel (ex: Alamat Rumah),
      	kelurahan: kelurahanName,
      	kecamatan: kecamatanName,
      	kota: kotaOrKabupatenName,
      	provinsi: provinsiName,
      	detail: addressDetails (street, block, unit number)
      }

- ##### Update delivery address

  PUT `/api/delivery-addresses/[address-id]` with body:

      {
      	label: newAddressLabel (ex: Alamat Rumah),
      	kelurahan: newKelurahanName,
      	kecamatan: newKecamatanName,
      	kota: newKotaOrKabupatenName,
      	provinsi: newProvinsiName,
      	detail: AddressDetails (street, block, unit number)
      }

- ##### Delete delivery address
  DELETE `/api/delivery-addresses/[address-id]`

#### Cart

\*Subject to changes. It's possible a controller for updating cart is added in the future. So user can update their cart instead of creating new cart everytime.

- ##### View cart

  GET `/api/cart`

- ##### Add cart

  POST `/api/cart` with body:

      [
      	{
      		product: productId,
      		quantity: 9999
      	},
      	{
      		product: productId,
      		quantity: 9999
      	}
      ]

- ##### Delete cart
  DELETE `/api/cart/[cart-id]`

#### Order

Field specific authorization is in effect for delete operation.

Admin is the only one who can do update on orders, and it's only for updating delivery_status.

- ##### View orders

  GET `/api/order`

- ##### Add order

  POST `/api/order` with body:

      {
      	delivery_address: addressId
      }

- ##### Update order

  PUT `/api/order/[order-id]` with body:

      {
      	delivery_status:  deliveryStatus
      }

  delivery_status enums:

  - Menunggu pembayaran
  - Diproses
  - Dalam pengiriman

- ##### Delete order
  DELETE `/api/order/[order-id]`

#### Invoice

For now, the invoice is not styled yet. Stylings will be implemented in future.

Invoice is rendered with pug using data from Order.

Field specific authorization is in effect.

- ##### View invoice

  GET `/api/invoice/[order-id]`

  Pay attention to the params. It's using order id. There is no invoice id.
