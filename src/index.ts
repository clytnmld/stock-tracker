import express from 'express';
import warehouseRoute from './routes/warehouseRoute';
import productsRoute from './routes/productsRoute';
import salesRoute from './routes/salesRoute';
import purchaseRoute from './routes/purchaseRoute';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/warehouse', warehouseRoute);
app.use('/products', productsRoute);
app.use('/purchase', purchaseRoute);
app.use('/sales', salesRoute);
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
