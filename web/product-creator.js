import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
  "sun",
  "glade",
  "bird",
  "brook",
  "butterfly",
  "bush",
  "dew",
  "dust",
  "field",
  "fire",
  "flower",
];

export const DEFAULT_PRODUCTS_COUNT = 5;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
    }
  }
`;

export default async function productCreator(
  session,
  data
 
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    for (let i = 0; i < data.length; i++) {
      await client.query({
        data: {
          query: CREATE_PRODUCTS_MUTATION,
          variables: {
            "input": {
              "id":data[i]._id,
              "title": data[i].name,
              "vendor": data[i].sellerId,
             
              "images": [
                {
                  "altText": "",
                  
                	"src": `https://server.dropspot.in/images/${data[i].image0}`
                },
                {
                  "altText": "",
                  
                	"src": `https://server.dropspot.in/images/${data[i].image1}`
                },
                {
                  "altText": "",
                  
                	"src": `https://server.dropspot.in/images/${data[i].image2}`
                }
              ],
              "variants": [{ "price": data[i].dropshipperPrice ,"sku":data[i].sku ,
                "title":data[i]._id} ],
                "options": [
                  data[i]._id
                ],
             
            },
          },
        },
      });
    }
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
}
