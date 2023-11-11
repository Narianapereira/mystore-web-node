const express = require('express')

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

apiRouter.get(endpoint + 'products', function (req, res) {
    res.status(200).json (product_list)
})

module.exports = apiRouter;