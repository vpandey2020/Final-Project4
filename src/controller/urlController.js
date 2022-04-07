const urlModel = require("../model/urlModel")
const redisService=require("../redis/redisServices")
const shortid = require('shortid')


const isValid = function(value){
    if(typeof value ==undefined ||  value ==null)return false
    if(typeof value==='string'&&value.trim().length===0) return false
    return true
}

const createUrl = async function(req,res){
  try{  
   let data=req.body 
    const longUrl = data.longUrl
    const baseUrl = 'http://localhost:3000'

    // data is missing
   let keys=Object.keys(data)
    if (keys.length==0) {return res.status(400).send({status: false, message: "please iput Some data"})}

    //please input LongUrl
   if(!isValid(longUrl))
   return res.status(400).send({status:false, message: "please input longUrl"})

   //please enter a valid URL
if(!(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(longUrl)))
    return res.status(400).send({status:false, message: "please enter a valid URL"})

//only longUrlfield is allowed
if(!(keys.length==1 && keys== 'longUrl'))
 return res.status(400).send({status:false, message: "only longUrlfield is allowed"})



//fetching data from redis
let cachedData = await redisService.GET_ASYNC(`${longUrl}`)
        if(cachedData) {
            console.log("redis work...")
            return res.status(201).send({ status : true, data : JSON.parse(cachedData)})
        }
        else {
                 //fetching data from mongoDb
            const checkRes = await urlModel.findOne({ longUrl: longUrl})
            if(checkRes){
             const url123 = {longUrl:checkRes.longUrl,shortUrl:checkRes.shortUrl,urlCode:checkRes.urlCode}
             console.log("mongo")
        
             {return res.status(201).send({status:true,data:url123})}
        }
        else {
                let urlCode = shortid.generate().toLowerCase()
                const shortUrl = baseUrl + '/' + urlCode
                data.shortUrl=shortUrl
                data.urlCode=urlCode

           const url1 = await urlModel.create(data)
           const url12 = {longUrl:longUrl,shortUrl:shortUrl,urlCode:urlCode}
           await redisService.SET_ASYNC(`${url12.longUrl}`, JSON.stringify(url12),'EX',60*60*24) 
           await redisService.SET_ASYNC(`${url12.urlCode}`, url12.longUrl,'EX',60*60*24)
           
          console.log("mongodb...")
               return res.status(201).send({status:true, data:url12})
              
        }
    }

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

