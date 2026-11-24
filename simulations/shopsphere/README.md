# ShopSphere

ShopSphere is the backend of a small online store. It manages products, shopping carts and orders.

You have joined the ShopSphere backend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
src/
├── index.js               # starts the HTTP server
├── app.js                 # builds the Express app and mounts routes
├── data/seed.js           # sample products used when the server starts
├── lib/errors.js          # error types shared by every service
├── repositories/          # in-memory storage for products, carts and orders
├── services/              # business rules (this is where most work happens)
│   ├── productService.js
│   ├── cartService.js
│   └── orderService.js
└── routes/                # HTTP endpoints that call the services
tests/                     # automated tests for the services
```

## Running the project

```bash
npm install
npm start        # http://localhost:4000
npm test         # runs the test suite
```

## API overview

| Method | Path | Purpose |
|---|---|---|
| GET | `/products` | List products (optional `?q=` search, or `?inStock=true`) |
| POST | `/products` | Create a product |
| GET | `/carts/:cartId` | View a cart and its total |
| POST | `/carts/:cartId/items` | Add a product to a cart |
| POST | `/orders` | Check out a cart |
| POST | `/orders/:orderId/cancel` | Cancel an order and restock its items |

## Conventions

- Services contain the business rules. Routes only translate HTTP to service calls.
- Invalid input throws a `ValidationError`. Missing records throw a `NotFoundError`.
- Prices are stored in paise (integer), never as floating-point rupees.
