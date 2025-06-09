import React, { useState } from "react";
import "./Main.css";
import datas from "../../data";

function Main() {
  const [data, setData] = useState(datas);
  console.log(data);
  return (
    <div className="main box-jashns py-5">
      <h1 className="text-center">جشنواره ها</h1>
      <div className="container">
        <div className="row">
          {data.map((item) => (
            <div className="col-12 col-xs-12 col-sm-12 col-md-4 text-center d-flex align-items-center flex-column"  key={item.id}>
              <img src={item.image} alt={item.title} className="card-img-top" />
              <h5 className="">{item.title}</h5>
              <p className="">{item.description}</p>
              <p className="">{item.date}</p>
              <a href={item.link} className="btn btn-primary">
                بیشتر بدانید
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Main;
