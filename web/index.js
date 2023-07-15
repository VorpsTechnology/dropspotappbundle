// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";  
import { Session } from "inspector";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;       

const app = express();    

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()

);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

//...............................
app.get("/api/collections/447657509177",async(req,res)=>{
  try {
   const response=
   await shopify.api.rest.Collection.find({
      session:res.locals.shopify.session,
      id:447657509177,
    })
    res.status(200).json(response)
  } catch (error) {
    res.status(500).send(error)
  }
})

//...............................

app.get("/api/orders",async(req,res)=>{
  try {
    const response=
    await shopify.api.rest.Order.all({
      session: res.locals.shopify.session,
      status: "any", 
    }); 
    res.status(200).json(response)
  } catch (error) {
    res.status(500).send(error)
  }
})  

//................................
//.............update order............
app.put("/api/orders/:orderid",async(req,res)=>{
  try {
 
const order = new shopify.api.rest.Order({session:res.locals.shopify.session});
order.id = parseInt(req.params.orderid);
console.log("order",order);
console.log("order req",req.body);

order.total_shipping_price_set={
  presentment_money:{
    amount:req.body.shipingCharge
  }
  }


console.log("fir");
const response=await order.save({
  update: true,
});
console.log("sec",response);
res.status(200).json(response)
  } catch (error) {
    console.log("error",error);
    res.status(500).send(error)
  }
})  
//.............update order............
app.post("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;
 const {data}=_req.body
  try {
    await productCreator(res.locals.shopify.session,data);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);   
      