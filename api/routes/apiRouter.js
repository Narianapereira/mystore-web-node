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


let apiRouter = express.Router()

const endpoint = '/'

const product_list = {
    products:
    [
        { id: 1, description: "Pastel de carne", valor: 5.00},
        { id: 2, descricao: "Pastel de queijo", valor: 3.00},
        { id: 3, descricao: "Pastel de chocolate", valor: 5.00}
        ] 
}

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
    .where('id', produtoId)
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
 })

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
      // Em caso de erro, retorne uma resposta de erro
      console.error(err);
      res.status(500).json({ erro: 'Erro ao processar a solicitação' });
    });
 })
apiRouter.delete(endpoint + 'produtos/:id', (req, res) => { 
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