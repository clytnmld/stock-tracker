import express from 'express';
import warehouseRoute from './routes/warehouseRoute';
import productsRoute from './routes/productsRoute';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/warehouse', warehouseRoute);
app.use('/products', productsRoute);
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
