## Setting up
1. Install dependencies 
`npm install`
2. set up DB
`npx prisma migrate dev --name init`
`npx prisma generate`
3. Run the server
`npm run dev`

## API routes
1. `/warehouse` to create customer
```
{
    "name": "warehouse1"
}
```
2. `/products` to create services
```
{
    "name": "product 123",
    "price": 100000,
    "stock": 100,
    "warehouseId": 1
}
```
3. `/purchase` to create stylists
```
{
    "value": 15
}
```
4. `/sales` to create bookings
```
{
    "value": 10
}
```
`/booking/:id/cancel` to cancel booking
