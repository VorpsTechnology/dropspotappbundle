import { useEffect, useState } from "react";
import { LegacyCard, TextContainer, Text } from "@shopify/polaris";
import { Toast, useNavigate } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import axios from "axios"
import './ProductCard.css'
export function ProductsCard() {
  const [loginCard,setLoginCard]=useState(true)
  const [productCard,setProductCard]=useState(false)
  const [orderCard,setOrderCard]=useState(false)
  const [orders,setOrders]=useState([])
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();
  const list={
    backgroundColor:'#FFE51A',
    borderColor:'transparent',
    padding:'5px',
    width:'70px',
    borderRadius:'10px',
    margin:"5px 0px 5px 0px"
    
  }
  const order={
    backgroundColor:'black',
    borderColor:'transparent',
    padding:'5px',
    width:'70px',
    borderRadius:'10px',
    color:'white',
  }
  const buttonheader={
    backgroundColor:'#FDE31A',
    borderRadius:'15px',
    borderColor:'transparent',
    width:'auto',
    alignItems:'center',
    height:'80px',
    alignSelf:'center',
    boxShadow:'0px 4px 4px rgba(0, 0, 0, 0.15)',
    
  }

  const tabpanls={
    padding:'30px',
  
  }
  //state for products
  const [product,setProduct]=useState([])
useEffect(()=>{
fetchOrders()
},[])
  const navigate=useNavigate()
  //useeffect for fetch products
  useEffect(() => {
    
    async function fetchData() {
      // You can await here
      const {data}=await axios.get("https://server.dropspot.in/product/getproducts/1")
      setProduct(data)
      console.log("fkk",data);
      // ...
    }
    fetchData()

  }, []); // Or [] if effect doesn't need props or state
// 
  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handlePopulate = async () => {
  
    const reqOptions={
      method:"POST",
      headers:{'content-type':'application/json'},
      body:JSON.stringify({data:product})
    }
    const response = await fetch("/api/products/create",reqOptions);

    if (response.ok) {
      await refetchProductCount();
      setToastProps({ content: "products imported!" });
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error creating products",
        error: true,
      });
    }
  };
   console.log("Hello dropspot-dropship");
//.....................................
   const fetchCollections=async()=>{
    try { 
      const response =await fetch("/api/collections/447657509177")
      console.log("collections",await response.json()) 
    } catch (error) {
      console.log(error)
    }
   }

   // fetchCollections()
   //...................................

   const fetchOrders=async()=>{
    try { 
      const response =await fetch("/api/orders")
      //console.log("orders",await response.json()) 
      const zeta=await response.json()
     // console.log(zeta.data);
    const data=zeta.data
    
      setOrders(data)
     
    } catch (error) {
      console.log(error)
    }
   }
   // fetchOrders()

   console.log("orders",orders)
   //..................Navigation......
   const handleLoginCard=()=>{
      setLoginCard(false)
      setProductCard(true)
   }

const handleProductCard=()=>{
  setProductCard(true)
  setLoginCard(false)
  setOrderCard(false)
}

const handleOrderCard=()=>{
  setOrderCard(true)
  setLoginCard(false)
  setProductCard(false)
}


///login helpers
const [error, setError] = useState(false);
const [error2, setError2] = useState(false);
const userInfo = sessionStorage.getItem("userInfo");
  
const [user, setData] = useState({

  email: "",

  password: "",
});
const handleChange = (e) => {
  setData({ ...user, [e.target.name]: e.target.value });
};


//form submit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (user.email === "") {
   setError2(true);
  } else {
    try {
      const { data } = await axios.post("https://server.dropspot.in/auth/login",user);
      console.log(data);
      sessionStorage.setItem("userInfo", data.user);
      sessionStorage.setItem("userEmail", data.user.email);
      sessionStorage.setItem("userName", data.user.username);
      sessionStorage.setItem("name", data.user.name);
      sessionStorage.setItem("accountType", data.user.accountType);
      sessionStorage.setItem("userId", data.user._id);
      resetForm();
     handleProductCard()
    } catch (error) {
      console.log(error);
       setError(true);
    }
  }
};
const resetForm = () => {
  
  setData({ email: "",  password: "" });
};
useEffect(() => {
  if (userInfo) {
   handleProductCard()
  }else if(userInfo)
  {
    handleOrderCard()
  }
}, []);

//..........sku check............
const [checkedOrders,setcheckedOrders]=useState([])
console.log("checkorders",checkedOrders);
useEffect(async()=>{
  const skuCheck=async()=>{
    for(let i=0;i<orders.length;i++){
      console.log("sku",orders[i].line_items[0].sku);
      const {data}=await axios.post("https://server.dropspot.in/list/checksku",{sku:orders[i].line_items[0].sku})
    
      console.log("resp",data);
      if(data){
        const {data}=await axios.post("https://server.dropspot.in/list/checkorder",{shopifyOrderId:orders[i].id}) 
        if(data){
          const check=[...checkedOrders,orders[i]]
          const uniqueOrders=[...new Set(check)]
          setcheckedOrders(uniqueOrders)
        }
      
      }
    }
  }
  skuCheck()
},[orders])
///.............create order.............

const [address, setAddress] =useState({
  firstName:"",

  email: "",

  lastName: "",
  mobile:"",
  DAddress:"",
  city:"",
  state:"",
  zip:"",
  

});
const userId=sessionStorage.getItem("userId")
const exportorder=async(e)=>{
  e.preventDefault();
 
  if(userId && userInfo){
   for(let i=0;i<checkedOrders.length;i++){
    const ata={
      shopifyOrderId:checkedOrders[i].id,
       productId:checkedOrders[i].line_items[0].id,
       productName:checkedOrders[i].line_items[0].name,
       userId:userId,
       quantity:checkedOrders[i].number,
       price:checkedOrders[i].total_price,
       deliveryAddress:{
          firstName:address.firstName,
          lastName:address.lastName,
          mobile:address.mobile,
          email:"ahazadarsh0014@gmail.com",
          // state:stateCode,
          // city:cityCode,
          post:address.zip,
          address1:address.DAddress
  
       },
       orderType:"DROPSHIPPER",
       paymentMod:"COD",
       PaymentStatus:"PENDING",
       DeliveryStatus:"PENDING",
       OrderStatus:"ORDERED"
     }
     console.log(ata);
     const tata= await axios.post("https://server.dropspot.in/order/create",ata)
     if(tata){
    //  swal("Ordered Successfully...!")
    //  history.push("/SellerOrderFullfillment")
    alert("order Exported")
    setcheckedOrders([])
    setOrders([]) 
    fetchOrders()
      
     }
   }
  }else{
  //  swal("Login first")
  //  history.push('/signin')
  alert("order export failed")
  }
  
    
 }
  return (
    <>
      {toastMarkup }
    {loginCard &&   <LegacyCard
        title="LOGIN "
        sectioned
      
      >
       
          <div >

          <form  onSubmit={handleSubmit}  >
           <div style={{display:'inline'}}>
             <div ><label className="label" htmlFor="">Email</label></div>
             <div>
             <input
             className="inputbox"  
              
             name="email"
             placeholder="Enter Your Email"
             type="Email"
              value={user.email}
              onChange={handleChange}
              />
             </div>
             {error2 && (
              <span style={{ color: "red" }}>Email is required</span>
            )}
           </div>
           <div style={{display:'inline'}}>
             <div><label  className="label"  htmlFor="">Password</label></div>
             <div>
             <input 
             className="inputbox" 
             placeholder="Enter Your password"
             name="password"
         
            
             onChange={handleChange}
             value={user.password}
              
              
              />
             </div>
             {error && <span style={{ color: "red" }}> * Wrong password </span>}
           </div>
           <div>
           <label>
             <input  type="checkbox" name="remember" /> Remember me
           </label>
           </div>
           <button className="submitbtn" type="submit">Login</button>
           
         <div style={{display:'flex',justifyContent:'space-between',margin:'20px 0px 0px 0px'}}>
           <div>
           <p>Create Your New Account?SignUp</p>
           </div>
           <div>
           <span >Forgot <a href="#" style={{color:'rgba(255, 214, 0, 1)'}}>password?</a></span>
           </div>
         </div>
         </form>
          </div>
         
          

           {/* <button keyz="prop" onClick={handlePopulate}>add product</button>
          <button keyx="prop" onClick={()=>{fetchOrders()}}>Fetch orders</button> */}

        
          {/* <Text as="h4" variant="headingMd">
            TOTAL PRODUCTS
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              {isLoadingCount ? "-" : data.count}
            </Text>
          </Text> */}
     
      </LegacyCard>}
     {productCard &&  <LegacyCard
        title=""
        sectioned
       
      >
       <button style={{backgroundColor:"rgba(255, 214, 0, 1)"}}   onClick={handleProductCard}>IMPORT PRODUCTS</button> <button onClick={handleOrderCard}>EXPORT ORDERS</button>

       <br /> <hr />
        <table  border="1" className="table">
             <thead className="tablehead">
             <tr  style={{color:"black",margin:'20px'}}>
                <th style={{padding:'10px',width:'50px'}}>SELECT</th>
                
                <th>NAME</th>
                <th>Image</th>
                <th>SKU ID</th>

                <th>ACTIONS</th>
              </tr>
             </thead>
        {product &&
            product.length > 0 &&
            product.map((ele) => (
             
              <tbody key={ele._id}>
              
              <tr>
                <td><input type="checkbox" name="" id="" /></td>
                <td>image</td>
              <td  style={{color:"black"}}>{ele.name}</td>
              <td  style={{color:"black"}}>{ele._id}</td>
              <td>
               <div style={{display:'inline'}}>
               <div> <button style={list} >LIST</button></div>
              

               </div>
             </td> 
            </tr>
              </tbody >
             
           
               ))}
                 </table>
                 <div align='right' className="Export" ><button onClick={handlePopulate}>IMPORT</button></div> 
             
          
      
      </LegacyCard>}

      {orderCard && <LegacyCard
        title=""
        sectioned
       
      >
     
     <button style={{backgroundColor:"rgba(255, 214, 0, 1)"}}  onClick={handleOrderCard}>EXPORT ORDERS</button> <button onClick={handleProductCard}>IMPORT PRODUCTS</button> 

<br /> <hr />   
           
     <table  border="1" className="table">
             <thead className="tablehead">
             <tr  style={{color:"black",margin:'20px'}}>
                <th style={{padding:'10px',width:'50px'}}>SELECT</th>
                
                <th>ID</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Sku</th>

                <th>ACTIONS</th>
              </tr>
             </thead>
        {checkedOrders &&
            checkedOrders.length > 0 &&
            checkedOrders.map((ele) => (
             
              <tbody key={ele.id}>
              
              <tr>
                <td><input type="checkbox" name="" id="" /></td>
                <td>{ele.id}</td>
              <td  style={{color:"black"}}>{ele.number}</td>
              <td  style={{color:"black"}}>{ele.total_price} {ele.currency}</td>
              <td  style={{color:"black"}}>{ele.line_items[0].sku}</td>
              <td>
               <div style={{display:'inline'}}>
               
               <div><button style={order}>Export</button></div>

               </div>
             </td> 
            </tr>
              </tbody>
             
           
               ))}
              
               </table>
               {/* <button  onClick={fetchOrders}>Fetch orders</button> */}
               <div align='right' className="Export" ><button onClick={exportorder}>Export Order</button></div> 
      </LegacyCard>}
    </>
  );
}
