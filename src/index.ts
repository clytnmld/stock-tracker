import express from 'express';
import cookieParser from 'cookie-parser';
import warehouseRoute from './routes/warehouseRoute';
import productsRoute from './routes/productsRoute';
import salesRoute from './routes/salesRoute';
import purchaseRoute from './routes/purchaseRoute';
import authRoute from './routes/authRoute';
import { cookieJwtAuth } from './middleware/cookieJwtAuth';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/warehouse', cookieJwtAuth, warehouseRoute);
app.use('/products', cookieJwtAuth, productsRoute);
app.use('/purchase', cookieJwtAuth, purchaseRoute);
app.use('/sales', cookieJwtAuth, salesRoute);
app.use('/auth', authRoute);
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
