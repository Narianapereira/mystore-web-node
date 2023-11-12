const express = require('express')
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
      host: '172.17.0.2', // Conection docker container to local testing
      password: '37141719nrp',
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


apiRouter.get(endpoint + 'products', (req, res) => {
    knex.select('*').from('product')
    .then( products => res.status(200).json(products) )
    .catch(err => {
    res.status(500).json({
    message: 'Erro ao recuperar produtos - ' + err.message })
    })
})

apiRouter.get(endpoint + 'products/:id', (req, res) => {
    const productId = req.params.id;

    knex.select('*')
    .from('product')
    .where('id', productId)
    .then(products => {
      if (products.length > 0) {
        res.status(200).json(products[0]);
      } else {
        res.status(500).json({ message: 'Produto não encontrado' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Erro ao processar a solicitação' });
    });
})

apiRouter.post(endpoint + 'products', (req, res) => {
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
  

apiRouter.put(endpoint + 'products/:id', (req, res) => { 
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

apiRouter.delete(endpoint + 'products/:id', (req, res) => { 
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

module.exports = apiRouter;