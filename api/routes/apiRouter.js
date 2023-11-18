const express = require('express')
const bcrypt = require('bcryptjs') 
const jwt = require('jsonwebtoken') 


  const knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: {
        require: false,
        rejectUnauthorized: false, 
      },
    debug: true,
  });

  
  /*const knex = require('knex')({
    client: 'pg',
    connection: {
      host: 'localhost', // Conection docker container to local testing
      password: 'ADMIN',
      user: 'postgres',
      database: 'postgres',
      port: 5432, 
    },
    ssl: {
      require: false,
      rejectUnauthorized: false,
    },
    debug: true,
  });*/
  


let apiRouter = express.Router()

const endpoint = '/'

let checkToken = (req, res, next) => {
  let authToken = req.headers["authorization"]
  if (!authToken) {
    res.status(401).json({ message: 'Token de acesso requerida' })
  }
  else {
    let token = authToken.split(' ')[1]
    req.token = token
  }
  jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
    if (err) {
      res.status(401).json({ message: 'Acesso negado' })
      return
    }
    req.usuarioId = decodeToken.id
    next()
  })
}

let isAdmin = (req, res, next) => {
  knex
    .select('*').from('usuario').where({ id: req.usuarioId })
    .then((usuarios) => {
      if (usuarios.length) {
        let usuario = usuarios[0]
        let roles = usuario.roles.split(';')
        let adminRole = roles.find(i => i === 'ADMIN')
        if (adminRole === 'ADMIN') {
          next()
          return
        }
        else {
          res.status(403).json({ message: 'Role de ADMIN requerida' })
          return
        }
      }
    })
    .catch(err => {
      res.status(500).json({
        message: 'Erro ao verificar roles de usuário - ' + err.message
      })
    })
} 

apiRouter.get(endpoint + 'products', checkToken, (req, res) => {
    knex.select('*').from('product')
    .then( products => res.status(200).json(products) )
    .catch(err => {
    res.status(500).json({
    message: 'Erro ao recuperar produtos - ' + err.message })
    })
})

apiRouter.get(endpoint + 'products/:id', checkToken, (req, res) => {
    const productId = req.params.id;

    knex.select('*')
    .from('product')
    .where('id', productId)
    .then(products => {
      if (products.length > 0) {
        res.status(200).json(products[0]);
      } else {
        res.status(404).json({ message: 'Produto não encontrado' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Erro ao processar a solicitação' });
    });
})

apiRouter.post(endpoint + 'products', checkToken, isAdmin, (req, res) => {
    const newProduct = req.body;
  
    if (!newProduct) {
      return res.status(400).json({ error: 'Os dados do produto são obrigatórios' });
    }
  
    knex('product')
      .insert(newProduct)
      .returning('*')
      .then(created => {
        res.status(201).json(created[0]);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
      });
  });
  

apiRouter.put(endpoint + 'products/:id', checkToken, isAdmin, (req, res) => { 
    const productId = req.params.id;
  const updatedData = req.body;

  knex('product')
    .where('id', productId)
    .update(updatedData)
    .returning('*')  
    .then(updated => {
      if (updated.length > 0) {
        res.status(200).json(updated[0]);
      } else {
        res.status(404).json({ message: 'Produto não encontrado' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao processar a solicitação' });
    });
 })

apiRouter.delete(endpoint + 'products/:id', checkToken, isAdmin, (req, res) => { 
    const productId = req.params.id;

  knex('product')
    .where('id', productId)
    .del()
    .returning('*')  
    .then(excluded => {
      if (excluded.length > 0) {
        res.status(200).json(excluded[0]);
      } else {
        res.status(404).json({ message: 'Produto não encontrado' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Erro ao processar a solicitação' });
    });
 })

apiRouter.post(endpoint + 'usuario/register', (req, res) => {
  knex('usuario')
    .insert({
      name: req.body.name,
      login: req.body.login,
      password: bcrypt.hashSync(req.body.password, 8),
      email: req.body.email
    }, ['id'])
    .then((result) => {
      let usuario = result[0]
      res.status(200).json({ "id": usuario.id })
      return
    })
    .catch(err => {
      res.status(500).json({
        message: 'Erro ao registrar usuario - ' + err.message
      })
    })
})

apiRouter.post(endpoint + 'usuario/login', (req, res) => {
  knex
    .select('*').from('usuario').where({ login: req.body.login })
    .then(usuarios => {
      if (usuarios.length) {
        let usuario = usuarios[0]
        let checkSenha = bcrypt.compareSync(req.body.password, usuario.password)
        if (checkSenha) {
          var tokenJWT = jwt.sign({ id: usuario.id },
            process.env.SECRET_KEY, {
            expiresIn: 3600
          })
          res.status(200).json({
            id: usuario.id,
            login: usuario.login,
            name: usuario.name,
            roles: usuario.roles,
            token: tokenJWT
          })
          return
        }
      }

      res.status(403).json({ message: 'Login ou senha incorretos' })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Erro ao verificar login - ' + err.message
      })
    })
})

module.exports = apiRouter;