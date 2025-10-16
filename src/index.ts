import express from 'express';
import cookieParser from 'cookie-parser';
import warehouseRoute from './routes/warehouseRoute';
import productsRoute from './routes/productsRoute';
import salesRoute from './routes/salesRoute';
import purchaseRoute from './routes/purchaseRoute';
import authRoute from './routes/authRoute';
import session from 'express-session';
import { sessionAuth } from './middleware/cookieJwtAuth';
import MySQLStoreFactory from 'express-mysql-session';

const app = express();
const port = 3000;
const MySQLStore = MySQLStoreFactory(session as any);
app.use(express.json());
const sessionStore = new MySQLStore({
  host: process.env.HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
app.use(
  session({
    secret: process.env.SECRET as string,
    resave: false,
    store: sessionStore,
    saveUninitialized: true,
  })
);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/auth', authRoute);
app.use('/warehouse', sessionAuth, warehouseRoute);
app.use('/products', sessionAuth, productsRoute);
app.use('/purchase', sessionAuth, purchaseRoute);
app.use('/sales', sessionAuth, salesRoute);
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
