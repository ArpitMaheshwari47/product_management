const productModel = require("../models/productModel")
const { isValid, isValidbody, nameRegex, objectid} = require("../validator/validator");

//==============================================create api=============================================
const createProduct = async function (req, res) {
    try {
        let data = req.body
       if (!isValidbody(data)) {
            return res.status(400).send({ status: false, message: "plz enter some keys and values in the data" })
        }
        console.log(data)
        let { title, description, category, price, isDeleted } = data

        //title validation
        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title is in incorrect format" })
            let isUniqueTitle = await productModel.findOne({ title: title });
            if (isUniqueTitle) {
                return res.status(400).send({ status: false, message: "This title is being used already" })
            }
        } else return res.status(400).send({ status: false, message: "title must be present" })


        //description validation
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "description is in incorrect format" })
        } else return res.status(400).send({ status: false, message: "description must be present" })

        if(category){
            if (!isValid(category)) return res.status(400).send({ status: false, message: "category is in incorrect format" })
        }

        //price validation
        if (!price || price == 0 ) return res.status(400).send({ status: false, message: "price cannot be empty" })
        if (!Number(price))  return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
        data.price = Number(price).toFixed(2)

        if(isDeleted) {
            if(!(isDeleted == "true" || isDeleted == "false" || typeof isDeleted === "boolean"))
                return res.status(400).send({ status: false, message: "isDeleted should be Boolean or true/false" })
            if(isDeleted == true || isDeleted == "true") data.deletedAt = new Date
        }

        const createdProduct = await productModel.create(data)

        return res.status(201).send({ status: true,message: 'Success', data: createdProduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getProductByQuery = async function(req, res) {
    try {
        let query = req.query;  

        let {name,category, priceGreaterThan ,priceLessThan, priceSort} = query

        let filter = {
            isDeleted: false
        }

        //to do substring name
        if(name){
            if (!isValid(name)) return res.status(400).send({ status: false, message: "name is in incorrect format" })
            filter["title"] = {"$regex": name};
        }
        if(category){
            if (!isValid(category)) return res.status(400).send({ status: false, message: "categoryis in incorrect format" })
            filter["category"] = {"$regex": category};
        }

        if(priceGreaterThan){
            if (!Number(priceGreaterThan))  return res.status(400).send({ status: false, message: "priceGreaterThan should be in valid number/decimal format" })
            filter["price"] = { $gte: priceGreaterThan }
        }

        if(priceLessThan){
            if (!Number(priceLessThan))  return res.status(400).send({ status: false, message: "priceLessThan should be in valid number/decimal format" })
            filter["price"] = { $lte: priceLessThan }
        }
 
        if(priceGreaterThan && priceLessThan){
            if (!Number(priceGreaterThan))  return res.status(400).send({ status: false, message: "priceGreaterThan should be in valid number/decimal format" })
            if (!Number(priceLessThan))  return res.status(400).send({ status: false, message: "priceLessThan should be in valid number/decimal format" })
            filter["price"] = {$gte: priceGreaterThan, $lte: priceLessThan}
        }

        const foundProducts = await productModel.find(filter).select({__v:0 })

        if(!priceSort)  priceSort = 1
        if(priceSort == 1) {
            foundProducts.sort((a,b) => {
                return a.price - b.price
            })
        }
        else if(priceSort == -1) {
            foundProducts.sort((a,b) => {
                return b.price - a.price
            })
        }
        else return res.status(400).send({ status: false, message: "priceSort should be 1 or -1" })
             
        if(foundProducts.length == 0) return res.status(404).send({ status: false, message: "no product found for the given query"})

        return res.status(200).send({ status: "true",message: 'Success', data: foundProducts})
  
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getProductById = async function(req, res) {
    try {
        let productId = req.params.productId
        if(!productId)  return res.status(400).send({ status: false, message: "ProductId is required" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Incorrect productId" })
        if (!productId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect productId" })

        let product = await productModel.findById(productId)
        if(!product || product.isDeleted == true)    return res.status(404).send({ status: false, message: "Product not found" })

        return res.status(200).send({ status: true,message: 'Success', data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateProduct = async function(req, res) {
    try {
        let productId = req.params.productId
        let data = req.body

        if(!productId)  return res.status(400).send({ status: false, message: "ProductId is required" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Incorrect productId" })
        if (!productId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect productId" })

        let product = await productModel.findById(productId)
        if(!product || product.isDeleted == true)    return res.status(404).send({ status: false, message: "Product not found" })

        if (!isValidbody(data)) return res.status(400).send({ status: false, message: "Please provide data to update" })
        let {title, description,category, price, isDeleted} = data

        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title is in incorrect format" })
            let isUniqueTitle = await productModel.findOne({ title: title });
            if (isUniqueTitle) {
                return res.status(400).send({ status: false, message: "This title is being used already" })
            }
        }

        
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "description is in incorrect format" })
        }

        if (category) query.category = category

        
        if (price && !Number(price)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
        data.price = Number(price).toFixed(2)

        if(isDeleted) {
            if(!(isDeleted == "true" || isDeleted == "false" || typeof isDeleted === "boolean"))
                return res.status(400).send({ status: false, message: "isDeleted should be Boolean or true/false" })
            if(isDeleted == true || isDeleted == "true") data.deletedAt = new Date
        }


        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, data, { new: true })
        return res.status(200).send({ status: true,message: 'Success', data: updatedProduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteProductsById = async function(req, res) {
    try {
        let productId = req.params.productId
        if(!productId)  return res.status(400).send({ status: false, message: "ProductId is required" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Incorrect productId" })
        if (!productId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect productId" })

        let product = await productModel.findOneAndUpdate({_id: productId, isDeleted: false}, {$set:{isDeleted: true, deletedAt: new Date}}, {new: true}).select({__v: 0})    

        if(!product) return res.status(404).send({ status: false, message: "Product not found" })

        return res.status(200).send({ status: true, message:"Success", data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getProductById, updateProduct, getProductByQuery, deleteProductsById }
