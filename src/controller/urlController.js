const urlModel = require("../model/urlModel")
const redisService=require("../redis/redisServices")
const shortid = require('shortid')


const isValid = function(value){
    if(typeof value ==undefined ||  value ==null)return false
    if(typeof value==='string'&&value.trim().length===0) return false
    return true
}

const baseUrl = 'http://localhost:3000'

const createUrl = async function(req,res){
  try{  
   let data=req.body 
    
    const {longUrl} = data
   let keys=Object.keys(data)
    if (keys.length==0) {return res.status(400).send({status: false, message: "please iput Some data"})}

if(!isValid(longUrl))
{return res.status(400).send({status:false, message: "please input longUrl"})}

if(!(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(longUrl)))
    return res.status(400).send({status:false, message: "please enter a valid URL"})


if(keys.length>0){
if(!(keys.length==1 && keys== 'longUrl'))
 return res.status(400).send({status:false, message: "only longUrlfield is allowed"})
}
let cachedData = await redisService.GET_ASYNC(`${longUrl}`)
        if(cachedData) {
            console.log("redis work...")
            return res.status(201).send({ status : true, data : JSON.parse(cachedData)})
        }
       

    let urlCode = shortid.generate().toLowerCase()

                const shortUrl = baseUrl + '/' + urlCode
                data.shortUrl=shortUrl
                data.urlCode=urlCode
    
                const checkRes = await urlModel.findOne({ longUrl: longUrl})
               if(checkRes){
                const url123 = {longUrl:checkRes.longUrl,shortUrl:checkRes.shortUrl,urlCode:checkRes.urlCode}
                console.log("mongoDb")
                {return res.status(201).send({status:true,data:url123})}
               }
           const url1 = await urlModel.create(data)
           const url12 = {longUrl:longUrl,shortUrl:shortUrl,urlCode:urlCode}
           await redisService.SET_ASYNC(`${url12.longUrl}`, JSON.stringify(url12),'EX',60*60*24) 
           
           await redisService.SET_ASYNC(`${url12.urlCode}`, url12.longUrl,'EX',60*60*24)
           
          console.log("mongodb...")
               return res.status(201).send({status:true, data:url12})
  

}catch (err) {
           
           return res.status(500).send({status:false,msg:'Server Error'})
        }
    
}

let getUrl = async function (req, res) {
  try{
    const urlCode = req.params.urlCode
             if(urlCode.length != 9){
             return res.status(400).send({ status : false, message : "Please enter a valid urlCode !"});
            }

            const getRedisRes = await redisService.GET_ASYNC(`${urlCode}`);
            if (getRedisRes) {
                console.log("redis work...")
                return res.redirect(301, getRedisRes);
            }
            let finalData = await urlModel.findOne({urlCode:urlCode})
            console.log(finalData)
            if(!finalData){return res.status(404).send({status:false, message: " data not found"})}
            console.log("mongoDB work...")
            let url = finalData.longUrl
            return res.status(301).redirect(url)

}catch(err){
   return res.status(500).send({status:false,error:err.message})
}
}


module.exports.createUrl = createUrl
module.exports.getUrl = getUrl


// const urlModel = require("../model/urlModel")
// const shortid = require('shortid')
// const validUrl = require('valid-url')



// const isValid = function(value){
//     if(typeof value ==undefined ||  value ==null)return false
//     if(typeof value==='string'&&value.trim().length===0) return false
//     return true
// }

// const baseUrl = 'http://localhost:3000'

// const createUrl = async function(req,res){
//   try{  
//     data=req.body 
    
//     const {longUrl} = data
//    let keys=Object.keys(data)
//     if (keys.length==0) {return res.status(400).send({status: false, message: "please iput Some data"})}

// if(!isValid(longUrl))
// {return res.status(400).send({status:false, message: "please input longUrl"})}

// if(!(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(longUrl)))
//     return res.status(400).send({status:false, message: "please enter a valid URL"})


// if(keys.length>0){
// if(!(keys.length==1 && keys== 'longUrl'))
//  return res.status(400).send({status:false, message: "only longUrlfield is allowed"})
// }


//     let urlCode = shortid.generate()
// urlCode = await uniqueUrlCode(urlCode);

//                 const shortUrl = baseUrl + '/' + urlCode
//                 data.shortUrl=shortUrl
//                 data.urlCode=urlCode

//            const url1 = await urlModel.create(data)
//            const url12 = await urlModel.findOne(data).select({longUrl:1,shortUrl:1,urlCode:1,_id:0})
          
//                return res.status(201).send({status:true, data:url12})

// async function uniqueUrlCode(urlCode) {
//     const checkRes = await urlModel.findOne({ urlCode : urlCode});
//     if(checkRes != null) {
        
//     let urlCode = shortid.generate()
//         uniqueUrlCode(urlCode);
//     }
//     else{
//         return urlCode;
//     }
// }

// }catch (err) {
           
//            return res.status(500).send({status:false,msg:'Server Error'})
//         }
    
// }




// const urlModel = require("../model/urlModel")
// const shortid = require('shortid')
// const redis = require("redis");
// const { promisify } = require("util");

// //Connect to redis
// const redisClient = redis.createClient(
//   16272,
//   "redis-16272.c270.us-east-1-3.ec2.cloud.redislabs.com",
//   { no_ready_check: true }
// );
// redisClient.auth("YxXeB3X3LQs5mWpQPhh7blyl6RpvOzTO", function (err) {
//   if (err) throw err;
// });

// redisClient.on("connect", async function () {
//   console.log("Connected to Redis..");
// });



// 1. connect to the server
// 2. use the commands :

// Connection setup for redis

// const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
// const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
//const MSET_ASYNC = promisify(redisClient.MSET).bind(redisClient);



// const isValid = function(value){
//     if(typeof value ==undefined ||  value ==null)return false
//     if(typeof value==='string'&&value.trim().length===0) return false
//     return true
// }

// const baseUrl = 'http://localhost:3000'

// const createUrl = async function(req,res){
//   try{  
//    let data=req.body 
    
//     const {longUrl} = data
//    let keys=Object.keys(data)
//     if (keys.length==0) {return res.status(400).send({status: false, message: "please iput Some data"})}

// if(!isValid(longUrl))
// {return res.status(400).send({status:false, message: "please input longUrl"})}

// if(!(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(longUrl)))
//     return res.status(400).send({status:false, message: "please enter a valid URL"})


// if(keys.length>0){
// if(!(keys.length==1 && keys== 'longUrl'))
//  return res.status(400).send({status:false, message: "only longUrlfield is allowed"})
// }
// let cachedData = await GET_ASYNC(`${longUrl}`)
//         if(cachedData) {
//             console.log("redis work...")
//             return res.status(201).send({ status : true, data : JSON.parse(cachedData)})
//         }
       

//     let urlCode = shortid.generate().toLowerCase()

//                 const shortUrl = baseUrl + '/' + urlCode
//                 data.shortUrl=shortUrl
//                 data.urlCode=urlCode
    
//                 const checkRes = await urlModel.findOne({ longUrl: longUrl})
//                if(checkRes){
//                 const url123 = {longUrl:checkRes.longUrl,shortUrl:checkRes.shortUrl,urlCode:checkRes.urlCode}
//                 {return res.status(201).send({status:true,data:url123})}
//                }
//            const url1 = await urlModel.create(data)
//            const url12 = {longUrl:longUrl,shortUrl:shortUrl,urlCode:urlCode}
//            await SET_ASYNC(`${url12.longUrl}`, JSON.stringify(url12)) 
//            await SET_ASYNC(`${url12.urlCode}`, url12.longUrl)
//another way of line 244 and 244
// await redisService.MSET_ASYNC(
//     dataRes.longUrl, JSON.stringify(dataRes),
//     dataRes.urlCode, dataRes.longUrl
// );
           
//           console.log("mahir")
//                return res.status(201).send({status:true, data:url12})
  

// }catch (err) {
           
//            return res.status(500).send({status:false,msg:'Server Error'})
//         }
    
// }

// let getUrl = async function (req, res) {
//   try{
//     const urlCode = req.params.urlCode
//              if(urlCode.length != 9){
//              return res.status(400).send({ status : false, message : "Please enter a valid urlCode !"});
//             }

//             const getRedisRes = await GET_ASYNC(`${urlCode}`);
//             if (getRedisRes) {
//                 console.log("redis work...")
//                 return res.redirect(301, getRedisRes);
//             }
//             let finalData = await urlModel.findOne({urlCode:urlCode})
//             console.log(finalData)
//             if(!finalData){return res.status(404).send({status:false, message: " data not found"})}
//             console.log("mongoDB work...")
//             let url = finalData.longUrl
//             return res.status(301).redirect(url)

// }catch(err){
//    return res.status(500).send({status:false,error:err.message})
// }
// }


// module.exports.createUrl = createUrl
// module.exports.getUrl = getUrl