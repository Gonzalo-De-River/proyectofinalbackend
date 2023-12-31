const { mongoURL } = require('./config/config');
const express = require('express');
const { Server } = require('socket.io');
const { connectionSocket } = require('./utils/soket.io');
const handlebars = require('express-handlebars');
const router = require('./routes/index.router');
const server = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const FileStore = require('session-file-store');
const mongoconnect = require('connect-mongo');
const mongoose = require('mongoose');
const productModel = require('./dao/models/products.model');
const { init } = require('./dao/models/users.model');
const { initPassaport } = require('./utils/passport.config');
const passport = require('passport');
const errorList = require('./middlewares/errors');
const { mdwlLogger } = require('./config/winston');
const { faker } = require('@faker-js/faker');
mongoose.set('strictQuery', false);
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const cors = require('cors');
const PORT = process.env.PORT || 8080;
const FileStorage = FileStore(session);


const httpServer = server.listen(PORT, () => console.log('Servidor listo escuchando en puerto ${PORT}'));


server.use(
  cors({
    credentials: true,
    origin: 'https://frontend-gonzalo-riva.netlify.app',
  })
);

const config = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      description: 'API Eccomerce',
    },
  },
  apis: [`${__dirname}/docs/**/*yml`],
};

const spec = swaggerJsDoc(config);
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));


server.engine('handlebars', handlebars.engine());
server.set('views', __dirname + '/views');
server.set('view engine', 'handlebars');


server.use(cookieParser());


server.use(express.static(__dirname + '/public'));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  session({
    store: mongoconnect.create({

      mongoUrl: process.env.MONGOURL,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 60 * 60,
    }),
    secret: 'secretCode',
    resave: true,
    saveUninitialized: true,
  })
);


server.use(errorList);
initPassaport();
server.use(passport.initialize());
server.use(passport.session());

server.use(mdwlLogger);


server.use('/', router);

const test = async () => {
  await mongoose.connect(process.env.MONGOURL);
  console.log('Su conexion a la base fue exitosa');
};

test();
connectionSocket(httpServer);