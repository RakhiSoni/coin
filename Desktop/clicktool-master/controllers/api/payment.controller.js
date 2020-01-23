const express = require('express');
const axios = require('axios');
const constants = require('../../modules/constants');


exports.payWithBTC = async function (req, res, next) {
    try {
        const response = await axios({
          method: 'post', //you can set what request you want to be
          url: `${constants.COINBASE_BASE_URL}/charges`,
          data: {
            //service details, name and description 
            "name": req.body.name,
             "description": req.body.description,
             "local_price": {
               "amount": req.body.amount,
               "currency": "USD"
             },
             "pricing_type": "fixed_price",
             "metadata": {
               //customer's details, customer_id and customer_name
               "customer_id": req.body.userId,
               "customer_name": req.body.name
             },
             //URL to redirect and cancel
             "redirect_url": constants.COINBASE_REDIRECTED_URL,
             "cancel_url": constants.COINBASE_CANCEL_URL
          },
          headers: {
            'Content-Type': 'application/json',  
            'X-CC-Api-Key': constants.COINBASE_API_KEY,
            'X-CC-Version': constants.COINBASE_VERSION
          }
        })
    
        console.log(response.data)
        let result = response.data.data

        const respObj = {
          code:result.code,
          id:result.id,
      // need to redirect the user to this hosted_url
          hosted_url:result.hosted_url
    }
    
        console.log(respObj);
        res.send(JSON.parse(JSON.stringify(response.data)));
      } catch (error) {
        throw Error(error)
      }
};

exports.payentEventById = async function (req, res, next) {
    try {
        const response = await axios({
          method: 'get', //you can set what request you want to be
          url: `${constants.COINBASE_BASE_URL}/events/` + req.params.id,
          headers: {
            //'Content-Type': 'application/json',  
            'X-CC-Api-Key': constants.COINBASE_API_KEY,
            'X-CC-Version': constants.COINBASE_VERSION
          }
        })
    
        res.send(JSON.parse(JSON.stringify(response.data)));
      } catch (error) {
        throw Error(error)
      }
}



exports.payentChargetById = async function (req, res, next) {
  try {
      const response = await axios({
        method: 'get', //you can set what request you want to be
        url: `${constants.COINBASE_BASE_URL}/charges/` + req.params.id,
        headers: {
          //'Content-Type': 'application/json',  
          'X-CC-Api-Key': constants.COINBASE_API_KEY,
          'X-CC-Version': constants.COINBASE_VERSION
        }
      })
  
      res.send(JSON.parse(JSON.stringify(response.data)));
    } catch (error) {
      throw Error(error)
    }
}



exports.resolvePaymentByCode = async function (req, res, next) {
  try {
      const response = await axios({
        method: 'post', //you can set what request you want to be
        url: `${constants.COINBASE_BASE_URL}/` + req.params.id + `/resolve/`,
        headers: {
          'Content-Type': 'application/json',  
          'X-CC-Api-Key': constants.COINBASE_API_KEY,
          'X-CC-Version': constants.COINBASE_VERSION
        }
      })
  
      res.send(JSON.parse(JSON.stringify(response.data)));
    } catch (error) {
      throw Error(error.response.data)
    }
}
 
exports.allPaymentCharge = async function (req, res, next) {
  try {
      const response = await axios({
        method: 'get', //you can set what request you want to be
        url: `${constants.COINBASE_BASE_URL}`,
        headers: {
          'Content-Type': 'application/json',  
          'X-CC-Api-Key': constants.COINBASE_API_KEY,
          'X-CC-Version': constants.COINBASE_VERSION
        }
      })
  
      res.send(JSON.parse(JSON.stringify(response.data)));
    } catch (error) {
      throw Error(error)
    }
}


exports.allPaymentEvents = async function (req, res, next) {
    try {
        const response = await axios({
          method: 'get', //you can set what request you want to be
          url: `${constants.COINBASE_BASE_URL}/events`,
          headers: {
            //'Content-Type': 'application/json',  
            'X-CC-Api-Key': constants.COINBASE_API_KEY,
            'X-CC-Version': constants.COINBASE_VERSION
          }
        })
    
        res.send(JSON.parse(JSON.stringify(response.data)));
      } catch (error) {
        throw Error(error)
      }
}