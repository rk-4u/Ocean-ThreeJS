import './index.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Card() {
  const [products, setProducts] = useState([])
    useEffect(()=>{
      axios.get("https://dummyjson.com/products").then((res)=>{
        console.log(res.data.products)
        setProducts(res.data.products)
      }).catch((err)=>{
        console.log(err)
      })
    },[])
return(
  <section>
    <>
  <div className='productList'>
    {products.map((products,index)=>{
        return(
            <>
            <div className="card" style={{width: "18rem"}}>
  <img src={products.thumbnail} className="card-img-top" alt="..."/>
  <div className="card-body">
    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
  </div>
</div>
            </>
        )
    //   return(
    //     <>
    //       <div className='product-cart'>
    //         <img src={products.thumbnail} width={"100%"} height="200px" alt=''/>
    //         <h4>{products.title}</h4>
    //         <div>
    //           <span>$ {products.price}</span>
    //           <button>+</button>
    //         </div>
    //       </div>
    //     </>
    //   )
    })

    }
  </div>
  </>
  </section>
);

}

export default Card;
